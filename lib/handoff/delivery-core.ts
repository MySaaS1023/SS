import { createHash } from "node:crypto";
import { HandoffError } from "./core";
export type DeliveryState =
  | "sending"
  | "accepted"
  | "failed"
  | "disabled"
  | "indeterminate"
  | "delivered"
  | "delivery_failed";
export type DeliveryRecord = {
  id: string;
  handoff_id: string;
  destination: string;
  status: DeliveryState;
  attempt_count: number;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  provider_message_id: string | null;
  provider_checked_at: string | null;
  delivery_observed_at: string | null;
  last_error_code: string | null;
  attempt_history: {
    number: number;
    startedAt: string;
    finishedAt?: string;
    status: string;
  }[];
};
export type HandoffDeliveryResult = {
  ok: boolean;
  status:
    | "accepted"
    | "duplicate"
    | "failed"
    | "pending"
    | "delivered"
    | "indeterminate";
  message: string;
};
export function validHandoffSender(value: string | undefined) {
  const sender = value?.trim();
  if (!sender || sender.length > 320 || /[\r\n]/.test(sender)) return null;
  const email = sender.includes("<")
    ? sender.match(/^[^<>]+<([^<>]+)>$/)?.[1]
    : sender;
  return email &&
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) &&
    !/@resend\.dev$/i.test(email)
    ? sender
    : null;
}
export const deliveryContentHash = (subject: string, text: string) =>
  createHash("sha256").update(`${subject}\n${text}`).digest("hex");
export async function dispatchHandoffEmail(deps: {
  claim: () => Promise<{
    claimed: boolean;
    reason?: string;
    attempt?: DeliveryRecord;
    claimToken?: string;
  }>;
  send: (key: string) => Promise<{ id?: string; rejected?: boolean }>;
  complete: (
    id: string,
    claim: string,
    status: "accepted" | "failed" | "indeterminate",
    providerId: string | null,
  ) => Promise<void>;
}): Promise<HandoffDeliveryResult> {
  const claim = await deps.claim();
  if (!claim.claimed) {
    if (claim.reason === "complete")
      return {
        ok: true,
        status: "duplicate",
        message:
          "This handoff email was already accepted by the provider. No duplicate was sent; acceptance alone does not confirm inbox delivery.",
      };
    if (claim.reason === "busy")
      return {
        ok: false,
        status: "pending",
        message:
          "A delivery is pending or retry cooldown is active. No duplicate message was sent.",
      };
    if (claim.reason === "legacy" || claim.reason === "expired")
      return {
        ok: false,
        status: "indeterminate",
        message:
          "Automatic retry is blocked. Reconcile the existing provider history before sending again.",
      };
    throw new HandoffError(
      "delivery_unavailable",
      "This handoff is inactive or its delivery details changed. Preview it again.",
    );
  }
  if (!claim.attempt || !claim.claimToken)
    throw new HandoffError(
      "storage_unavailable",
      "A secure delivery claim could not be recorded. Nothing was sent.",
    );
  let result: { id?: string; rejected?: boolean };
  try {
    result = await deps.send(`client-handoff/${claim.attempt.id}`);
  } catch {
    result = {};
  }
  const status = result.id
    ? "accepted"
    : result.rejected
      ? "failed"
      : "indeterminate";
  // Ledger failure after provider acceptance must not be misclassified as a rejected message.
  await deps.complete(
    claim.attempt.id,
    claim.claimToken,
    status,
    result.id ?? null,
  );
  return status === "accepted"
    ? {
        ok: true,
        status,
        message:
          "Resend accepted the email. Inbox delivery depends on the recipient's mail provider.",
      }
    : status === "failed"
      ? {
          ok: false,
          status,
          message:
            "The provider rejected this email. Review its configuration before retrying.",
        }
      : {
          ok: false,
          status,
          message:
            "The provider outcome is unknown. No automatic resend was made; check the delivery history before retrying.",
        };
}
