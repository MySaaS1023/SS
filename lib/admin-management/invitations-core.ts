import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { operationalWorkspaces } from "./core";

export const invitationCookieName = "ss-admin-invitation";
export const invitationLifetimeMs = 60 * 60_000;
export type InvitationState =
  | "pending_approval"
  | "approved"
  | "sending"
  | "sent"
  | "accepted"
  | "expired"
  | "revoked"
  | "failed"
  | "unknown";
export type AdministratorInvitation = {
  id: string;
  display_name: string;
  email: string;
  role: "admin";
  status: InvitationState;
  created_at: string;
  expires_at: string;
  send_claim?: string | null;
  auth_user_id?: string | null;
  nonce_hash?: string | null;
  auth_token_hash?: string | null;
  provider_message_id?: string | null;
};
export type InvitationIdentity = {
  id: string;
  email: string;
  confirmed: boolean;
};
export type InvitationPreview = Pick<
  AdministratorInvitation,
  "id" | "display_name" | "email" | "role" | "status" | "expires_at"
>;
export function invitationsEnabled() {
  return (
    process.env.ADMIN_MANAGEMENT_ENABLED === "true" &&
    process.env.ADMIN_INVITATIONS_ENABLED === "true"
  );
}
export function invitationId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
  );
}
export function invitationNonce(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}
export function invitationTokenHash(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value);
}
export function hashInvitationValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function equalHash(left: string | null | undefined, right: string) {
  return (
    typeof left === "string" &&
    /^[a-f0-9]{64}$/.test(left) &&
    timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"))
  );
}
export function parseInvitationDraft(value: unknown) {
  if (!value || typeof value !== "object")
    throw new Error("Enter the invitation details.");
  const data = value as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (
    !name ||
    name.length > 160 ||
    /[\u0000-\u001f\u007f]/.test(name) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    data.role !== "admin"
  )
    throw new Error("Enter a valid name and email for the Admin role.");
  return { name, email, role: "admin" as const };
}
export function invitationPreview(
  row: AdministratorInvitation,
): InvitationPreview {
  return {
    id: row.id,
    display_name: row.display_name,
    email: row.email,
    role: row.role,
    status: row.status,
    expires_at: row.expires_at,
  };
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
export function administratorInvitationEmail(name: string, url: string) {
  const scope = operationalWorkspaces.join(", ");
  const subject = "Your Steady Start administrator invitation";
  const text = `Hello ${name},\n\nYou have been invited to Steady Start LLC as an Admin.\n\nAccess: ${scope}. This role cannot manage administrators or protected security settings.\n\nUse the secure invitation below within one hour, review your access, and set your own password to accept:\n\n${url}\n\nIf you did not expect this invitation, do not accept it. Contact support@steadystartco.com.\n\nSteady Start LLC`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#061b35;max-width:600px"><h1 style="font-size:24px">You're invited to Steady Start</h1><p>Hello ${escapeHtml(name)},</p><p>You have been invited as an <strong>Admin</strong>.</p><p>Access: ${escapeHtml(scope)}. This role cannot manage administrators or protected security settings.</p><p>Review your access and set your own password within one hour.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0866cc;color:#fff;padding:12px 20px;border-radius:8px">Review administrator invitation</a></p><p>If the button does not work, open this secure link:<br><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p><p>If this was unexpected, do not accept it. Contact support@steadystartco.com.</p><p>Steady Start LLC</p></div>`;
  return { subject, text, html };
}
export type InvitationDeliveryResult = {
  status: "accepted" | "failed" | "unknown" | "blocked";
  message: string;
};
export type InvitationDeliveryDependencies = {
  now(): number;
  reserve(
    id: string,
    confirmation: string,
    nonceHash: string,
    expiresAt: string,
  ): Promise<AdministratorInvitation | null>;
  generate(
    email: string,
  ): Promise<{
    id: string;
    email: string;
    tokenHash: string;
    type: string;
    confirmed: boolean;
  } | null>;
  bind(
    row: AdministratorInvitation,
    userId: string,
    tokenFingerprint: string,
  ): Promise<boolean>;
  send(
    row: AdministratorInvitation,
    email: ReturnType<typeof administratorInvitationEmail>,
  ): Promise<{ id?: string; rejected?: boolean }>;
  finish(
    row: AdministratorInvitation,
    outcome: "accepted" | "rejected" | "unknown",
    providerId: string | null,
    code: string | null,
  ): Promise<boolean>;
};
export async function deliverAdministratorInvitation(
  deps: InvitationDeliveryDependencies,
  site: string,
  id: unknown,
  confirmation: unknown,
): Promise<InvitationDeliveryResult> {
  if (
    !invitationId(id) ||
    typeof confirmation !== "string" ||
    confirmation.length > 254
  )
    return {
      status: "blocked",
      message: "Invitation confirmation is required.",
    };
  const nonce = randomBytes(32).toString("base64url");
  const row = await deps.reserve(
    id,
    confirmation,
    hashInvitationValue(nonce),
    new Date(deps.now() + invitationLifetimeMs).toISOString(),
  );
  if (
    !row ||
    !row.send_claim ||
    row.role !== "admin" ||
    row.status !== "sending"
  )
    return {
      status: "blocked",
      message:
        "Invitation is unavailable, already attempted, or confirmation did not match. No duplicate was sent.",
    };
  let generated: Awaited<
    ReturnType<InvitationDeliveryDependencies["generate"]>
  > = null;
  try {
    generated = await deps.generate(row.email);
  } catch {
    /* Fixed safe status only. */
  }
  if (
    !generated ||
    generated.type !== "invite" ||
    generated.confirmed ||
    generated.email.toLowerCase() !== row.email ||
    !invitationId(generated.id) ||
    !invitationTokenHash(generated.tokenHash)
  ) {
    await deps.finish(row, "rejected", null, "auth_generation_failed");
    return {
      status: "failed",
      message:
        "Invitation could not be generated. Existing accounts require separately approved onboarding; no access was granted.",
    };
  }
  if (
    !(await deps.bind(
      row,
      generated.id,
      hashInvitationValue(generated.tokenHash),
    ))
  ) {
    await deps.finish(row, "rejected", null, "auth_binding_failed");
    return {
      status: "failed",
      message:
        "Invitation identity binding failed. No message or administrator access was granted.",
    };
  }
  const url = new URL("/auth/admin-invite", site);
  url.searchParams.set("id", row.id);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("token_hash", generated.tokenHash);
  url.searchParams.set("type", "invite");
  let sent: { id?: string; rejected?: boolean };
  try {
    sent = await deps.send(
      row,
      administratorInvitationEmail(row.display_name, url.toString()),
    );
  } catch {
    sent = {};
  }
  const accepted = Boolean(sent.id && invitationId(sent.id));
  const outcome = accepted
    ? "accepted"
    : sent.rejected
      ? "rejected"
      : "unknown";
  const recorded = await deps.finish(
    row,
    outcome,
    accepted ? sent.id! : null,
    accepted
      ? null
      : outcome === "rejected"
        ? "provider_rejected"
        : "outcome_unknown",
  );
  if (!recorded)
    return {
      status: "unknown",
      message: accepted
        ? "The provider accepted the invitation, but its audit update could not be confirmed. Do not retry; ask the owner to reconcile it."
        : "Delivery history could not be confirmed. Do not retry; ask the owner to reconcile it.",
    };
  return accepted
    ? {
        status: "accepted",
        message:
          "Resend accepted the invitation. This does not confirm inbox delivery or activate administrator access.",
      }
    : {
        status: outcome === "rejected" ? "failed" : "unknown",
        message:
          outcome === "rejected"
            ? "The provider rejected the invitation. No administrator access was activated."
            : "The provider outcome is unknown. Automatic retries are blocked to prevent duplicates.",
      };
}
export function validInvitationBinding(
  row: AdministratorInvitation | null,
  nonce: unknown,
  now: number,
  identity?: InvitationIdentity | null,
) {
  if (
    !row ||
    row.role !== "admin" ||
    row.status !== "sent" ||
    !row.auth_user_id ||
    !invitationNonce(nonce) ||
    !equalHash(row.nonce_hash, hashInvitationValue(nonce)) ||
    !Number.isFinite(Date.parse(row.expires_at)) ||
    Date.parse(row.expires_at) <= now
  )
    return false;
  return (
    identity === undefined ||
    Boolean(
      identity?.confirmed &&
      identity.id === row.auth_user_id &&
      identity.email.toLowerCase() === row.email,
    )
  );
}
export function validInvitationCallback(
  row: AdministratorInvitation | null,
  nonce: unknown,
  tokenHash: unknown,
  type: unknown,
  now: number,
) {
  return (
    type === "invite" &&
    invitationTokenHash(tokenHash) &&
    validInvitationBinding(row, nonce, now) &&
    equalHash(row?.auth_token_hash, hashInvitationValue(tokenHash))
  );
}
export type InvitationAcceptanceDependencies = {
  now(): number;
  load(id: string): Promise<AdministratorInvitation | null>;
  identity(): Promise<InvitationIdentity | null>;
  claim(
    row: AdministratorInvitation,
    user: InvitationIdentity,
    nonceHash: string,
  ): Promise<string | null>;
  updatePassword(password: string): Promise<boolean>;
  activate(
    row: AdministratorInvitation,
    user: InvitationIdentity,
    nonceHash: string,
    claim: string,
  ): Promise<boolean>;
  signOut(): Promise<void>;
};
export async function acceptAdministratorInvitation(
  deps: InvitationAcceptanceDependencies,
  id: unknown,
  nonce: unknown,
  password: unknown,
  confirmation: unknown,
) {
  if (
    !invitationId(id) ||
    !invitationNonce(nonce) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 256 ||
    password !== confirmation
  )
    return false;
  const row = await deps.load(id);
  const user = await deps.identity();
  if (!validInvitationBinding(row, nonce, deps.now(), user) || !row || !user)
    return false;
  const nonceHash = hashInvitationValue(nonce);
  const claim = await deps.claim(row, user, nonceHash);
  if (!claim) return false;
  try {
    // Claim before password write prevents concurrent/replayed accept requests
    // from changing a password more than once. Failure requires owner review.
    if (!(await deps.updatePassword(password))) return false;
    return await deps.activate(row, user, nonceHash, claim);
  } finally {
    await deps.signOut();
  }
}
