import { cookies } from "next/headers";
import { getAdministratorManagementContext } from "./server";
import {
  createAdminSupabaseClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";
import { businessEmail, getResendClient } from "@/lib/email";
import { validHandoffSender } from "@/lib/handoff/delivery-core";
import { getSiteUrl } from "@/lib/referrals/config";
import {
  acceptAdministratorInvitation,
  deliverAdministratorInvitation,
  invitationCookieName,
  invitationId,
  invitationNonce,
  invitationPreview,
  invitationsEnabled,
  parseInvitationDraft,
  validInvitationBinding,
  validInvitationCallback,
  type AdministratorInvitation,
  type InvitationIdentity,
} from "./invitations-core";

type ManagementContext = NonNullable<
  Awaited<ReturnType<typeof getAdministratorManagementContext>>
>;
export async function administratorInvitationContext() {
  if (!invitationsEnabled()) return null;
  return getAdministratorManagementContext();
}
export async function prepareAdministratorInvitation(
  context: ManagementContext,
  value: unknown,
) {
  if (!invitationsEnabled())
    throw new Error("Administrator invitations are unavailable.");
  const draft = parseInvitationDraft(value);
  const { data, error } = await context.database.rpc(
    "prepare_administrator_invitation",
    {
      p_actor: context.user.id,
      p_name: draft.name,
      p_email: draft.email,
    },
  );
  if (error || !data || !invitationId(data.id) || data.role !== "admin")
    throw new Error(
      "Invitation could not be prepared. Check existing memberships or Auth accounts; existing accounts require separately approved onboarding.",
    );
  return invitationPreview(data as AdministratorInvitation);
}
export async function sendAdministratorInvitation(
  context: ManagementContext,
  id: unknown,
  confirmation: unknown,
) {
  if (!invitationsEnabled())
    throw new Error("Administrator invitations are unavailable.");
  const sender = validHandoffSender(
    process.env.RESEND_FROM_EMAIL ?? process.env.HANDOFF_FROM_EMAIL,
  );
  if (!sender || !process.env.RESEND_API_KEY?.trim())
    throw new Error(
      "The general business email sender must be configured and verified before sending. Referral email credentials are never used.",
    );
  return deliverAdministratorInvitation(
    {
      now: Date.now,
      reserve: async (invitation, confirmedEmail, nonceHash, expiresAt) => {
        const { data, error } = await context.database.rpc(
          "reserve_administrator_invitation",
          {
            p_actor: context.user.id,
            p_id: invitation,
            p_confirmation: confirmedEmail,
            p_nonce_hash: nonceHash,
            p_expires_at: expiresAt,
          },
        );
        return error || !data ? null : (data as AdministratorInvitation);
      },
      generate: async (email) => {
        // Generates, but does not send, an Auth invite. Never update an existing
        // user's credentials or reuse signup/magiclink as administrator proof.
        const { data, error } = await context.database.auth.admin.generateLink({
          type: "invite",
          email,
          options: {
            redirectTo: `${getSiteUrl().replace(/\/$/, "")}/auth/admin-invite`,
          },
        });
        if (error || !data.user || !data.properties) return null;
        return {
          id: data.user.id,
          email: data.user.email ?? "",
          tokenHash: data.properties.hashed_token,
          type: data.properties.verification_type,
          confirmed: Boolean(data.user.email_confirmed_at),
        };
      },
      bind: async (row, userId, tokenFingerprint) => {
        const { data, error } = await context.database.rpc(
          "bind_administrator_invitation",
          {
            p_actor: context.user.id,
            p_id: row.id,
            p_claim: row.send_claim,
            p_user: userId,
            p_auth_token_hash: tokenFingerprint,
          },
        );
        return !error && data === true;
      },
      send: async (row, email) => {
        const { data, error } = await getResendClient().emails.send(
          {
            from: sender,
            to: [row.email],
            replyTo: businessEmail,
            ...email,
          },
          { idempotencyKey: `steady-start/admin-invitation/${row.id}` },
        );
        return data?.id
          ? { id: data.id }
          : {
              rejected: Boolean(
                error &&
                [
                  "validation_error",
                  "missing_required_field",
                  "invalid_access",
                  "restricted_api_key",
                  "invalid_api_key",
                  "rate_limit_exceeded",
                ].includes(error.name),
              ),
            };
      },
      finish: async (row, outcome, providerId, code) => {
        const { data, error } = await context.database.rpc(
          "complete_administrator_invitation_send",
          {
            p_actor: context.user.id,
            p_id: row.id,
            p_claim: row.send_claim,
            p_outcome: outcome,
            p_provider_id: providerId,
            p_error_code: code,
          },
        );
        return !error && data === true;
      },
    },
    getSiteUrl(),
    id,
    confirmation,
  );
}
export async function revokeAdministratorInvitation(
  context: ManagementContext,
  id: unknown,
  confirmation: unknown,
) {
  if (
    !invitationsEnabled() ||
    !invitationId(id) ||
    typeof confirmation !== "string" ||
    confirmation.length > 254
  )
    return false;
  const { data, error } = await context.database.rpc(
    "revoke_administrator_invitation",
    { p_actor: context.user.id, p_id: id, p_confirmation: confirmation },
  );
  return !error && data === true;
}
const privateInvitationFields =
  "id,display_name,email,role,status,created_at,expires_at,nonce_hash,auth_token_hash,auth_user_id,provider_message_id";
async function loadInvitation(id: string) {
  const { data, error } = await createAdminSupabaseClient()
    .from("administrator_invitations")
    .select(privateInvitationFields)
    .eq("id", id)
    .maybeSingle();
  return error ? null : (data as AdministratorInvitation | null);
}
async function verifiedIdentity(
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>,
): Promise<InvitationIdentity | null> {
  const { data, error } = await client.auth.getUser();
  return error || !data.user
    ? null
    : {
        id: data.user.id,
        email: data.user.email ?? "",
        confirmed: Boolean(data.user.email_confirmed_at),
      };
}
export async function beginAdministratorInvitation(input: {
  id: unknown;
  nonce: unknown;
  tokenHash: unknown;
  type: unknown;
}) {
  if (
    !invitationsEnabled() ||
    !invitationId(input.id) ||
    !invitationNonce(input.nonce)
  )
    return false;
  const row = await loadInvitation(input.id);
  if (
    !validInvitationCallback(
      row,
      input.nonce,
      input.tokenHash,
      input.type,
      Date.now(),
    ) ||
    !row
  )
    return false;
  const client = await createServerSupabaseClient();
  const current = await verifiedIdentity(client);
  // Opening another person's invitation must never replace an existing session.
  if (current && current.id !== row.auth_user_id) return false;
  const { data, error } = await client.auth.verifyOtp({
    token_hash: String(input.tokenHash),
    type: "invite",
  });
  const verified = !error && data.user ? await verifiedIdentity(client) : null;
  if (!validInvitationBinding(row, input.nonce, Date.now(), verified)) {
    if (!current) await client.auth.signOut({ scope: "local" });
    return false;
  }
  (await cookies()).set(
    invitationCookieName,
    JSON.stringify({ id: row.id, nonce: input.nonce }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth/admin-invite",
      maxAge: Math.min(
        15 * 60,
        Math.floor((Date.parse(row.expires_at) - Date.now()) / 1000),
      ),
    },
  );
  return true;
}
async function invitationCookie() {
  const raw = (await cookies()).get(invitationCookieName)?.value;
  try {
    const value = JSON.parse(raw ?? "null");
    return invitationId(value?.id) && invitationNonce(value?.nonce)
      ? (value as { id: string; nonce: string })
      : null;
  } catch {
    return null;
  }
}
export async function canAcceptAdministratorInvitation() {
  if (!invitationsEnabled()) return false;
  const proof = await invitationCookie();
  if (!proof) return false;
  return validInvitationBinding(
    await loadInvitation(proof.id),
    proof.nonce,
    Date.now(),
    await verifiedIdentity(await createServerSupabaseClient()),
  );
}
export async function completeAdministratorInvitation(
  password: unknown,
  confirmation: unknown,
) {
  if (!invitationsEnabled()) return false;
  const proof = await invitationCookie();
  if (!proof) return false;
  const client = await createServerSupabaseClient();
  const database = createAdminSupabaseClient();
  try {
    return await acceptAdministratorInvitation(
      {
        now: Date.now,
        load: loadInvitation,
        identity: () => verifiedIdentity(client),
        claim: async (row, user, nonceHash) => {
          const { data, error } = await database.rpc(
            "claim_administrator_invitation_acceptance",
            { p_id: row.id, p_user: user.id, p_nonce_hash: nonceHash },
          );
          return !error && invitationId(data) ? data : null;
        },
        updatePassword: async (value) => {
          const { error } = await client.auth.updateUser({ password: value });
          return !error;
        },
        activate: async (row, user, nonceHash, claim) => {
          const { data, error } = await database.rpc(
            "accept_administrator_invitation",
            {
              p_id: row.id,
              p_user: user.id,
              p_nonce_hash: nonceHash,
              p_acceptance_claim: claim,
            },
          );
          return !error && data === true;
        },
        signOut: async () => {
          const { error } = await client.auth.signOut({ scope: "local" });
          if (error)
            throw new Error(
              "Invitation session closure could not be confirmed.",
            );
        },
      },
      proof.id,
      proof.nonce,
      password,
      confirmation,
    );
  } finally {
    (await cookies()).set(invitationCookieName, "", {
      path: "/auth/admin-invite",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}
