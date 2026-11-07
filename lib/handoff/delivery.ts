import "server-only";
import { HandoffError, validateEmail } from "./core";
import { getHandoffForDelivery } from "./server";
import { handoffEmailMessage } from "./messages";
import { businessEmail, getResendClient } from "@/lib/email";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";
import {
  deliveryContentHash,
  dispatchHandoffEmail,
  validHandoffSender,
  type DeliveryRecord,
} from "./delivery-core";
export type { HandoffDeliveryResult } from "./delivery-core";
async function authorize() {
  const actor = await getFullyAuthorizedAdminUser();
  if (!actor)
    throw new HandoffError("unauthorized", "Administrator access is required.");
  return actor;
}
function storage(error: unknown) {
  if (error)
    throw new HandoffError(
      "storage_unavailable",
      "Email delivery history is unavailable. Check the handoff delivery migration and service-role permissions; no delivery success can be confirmed.",
    );
}
const columns =
  "id,handoff_id,destination,status,attempt_count,created_at,updated_at,sent_at,provider_message_id,provider_checked_at,delivery_observed_at,last_error_code,attempt_history";
export function handoffEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
    validHandoffSender(
      process.env.HANDOFF_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL,
    ),
  );
}
export async function sendHandoffEmail(input: {
  handoffId: string;
  destination: string;
}) {
  const actor = await authorize();
  const destination = validateEmail(input.destination);
  const handoff = await getHandoffForDelivery(input.handoffId);
  if (!handoff || handoff.status !== "active" || !handoff.url)
    throw new HandoffError(
      "delivery_unavailable",
      "This handoff link is not available for delivery.",
    );
  const sender = validHandoffSender(
    process.env.HANDOFF_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL,
  );
  if (!sender || !process.env.RESEND_API_KEY?.trim())
    throw new HandoffError(
      "configuration",
      "Handoff email requires RESEND_API_KEY and a verified HANDOFF_FROM_EMAIL sender (or an existing verified RESEND_FROM_EMAIL). Referral email settings are unchanged.",
    );
  const email = handoffEmailMessage(handoff);
  const db = createAdminSupabaseClient();
  return dispatchHandoffEmail({
    claim: async () => {
      const { data, error } = await db.rpc("claim_handoff_email_delivery", {
        p_handoff_id: handoff.id,
        p_actor: actor.id,
        p_destination: destination,
        p_content_hash: deliveryContentHash(email.subject, email.text),
        p_sender: sender,
      });
      storage(error);
      if (!data || typeof data.claimed !== "boolean") storage(true);
      return {
        claimed: data.claimed,
        reason: data.reason,
        attempt: data.attempt as DeliveryRecord | undefined,
        claimToken: data.attempt?.claim_token,
      };
    },
    send: async (key) => {
      const { data, error } = await getResendClient().emails.send(
        {
          from: sender,
          to: [destination],
          replyTo: businessEmail,
          subject: email.subject,
          text: email.text,
          html: email.html,
        },
        { idempotencyKey: key },
      );
      return data?.id
        ? { id: data.id }
        : {
            rejected:
              !!error &&
              [
                "validation_error",
                "missing_required_field",
                "invalid_access",
                "restricted_api_key",
                "invalid_api_key",
                "rate_limit_exceeded",
              ].includes(error.name),
          };
    },
    complete: async (id, claim, status, providerId) => {
      const { error } = await db.rpc("complete_handoff_email_delivery", {
        p_id: id,
        p_claim: claim,
        p_status: status,
        p_provider_id: providerId,
      });
      storage(error);
    },
  });
}
export async function listHandoffEmailDeliveries(
  handoffId?: string,
): Promise<DeliveryRecord[]> {
  await authorize();
  let query = createAdminSupabaseClient()
    .from("client_handoff_deliveries")
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(100);
  if (handoffId) query = query.eq("handoff_id", handoffId);
  const { data, error } = await query;
  storage(error);
  return (data ?? []) as DeliveryRecord[];
}
export async function refreshHandoffEmailDelivery(id: string) {
  await authorize();
  if (!/^[0-9a-f-]{36}$/i.test(id))
    throw new HandoffError("validation", "Invalid delivery identifier.");
  const db = createAdminSupabaseClient();
  const { data: attempt, error } = await db
    .from("client_handoff_deliveries")
    .select(columns)
    .eq("id", id)
    .single();
  storage(error);
  if (
    !attempt?.provider_message_id ||
    !["accepted", "delivered", "delivery_failed"].includes(attempt.status)
  )
    throw new HandoffError(
      "delivery_unavailable",
      "No accepted provider message is available to check.",
    );
  if (
    attempt.provider_checked_at &&
    Date.now() - Date.parse(attempt.provider_checked_at) < 30000
  )
    return attempt as DeliveryRecord;
  const response = await getResendClient().emails.get(
    attempt.provider_message_id,
  );
  if (response.error || !response.data)
    throw new HandoffError(
      "delivery_unavailable",
      "The email provider status could not be confirmed. No new message was sent.",
    );
  const event = response.data.last_event;
  const status =
    event === "delivered"
      ? "delivered"
      : ["bounced", "failed", "suppressed", "canceled"].includes(event)
        ? "delivery_failed"
        : attempt.status;
  const now = new Date().toISOString();
  const { data, error: updateError } = await db
    .from("client_handoff_deliveries")
    .update({
      status,
      provider_event: event,
      provider_checked_at: now,
      updated_at: now,
      ...(status === "delivered"
        ? { delivery_observed_at: attempt.delivery_observed_at ?? now }
        : {}),
    })
    .eq("id", id)
    .eq("provider_message_id", attempt.provider_message_id)
    .select(columns)
    .single();
  storage(updateError);
  return data as DeliveryRecord;
}
export function handoffSmsConfigured() {
  return false;
}
