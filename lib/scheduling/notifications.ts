import { SchedulingError } from "./core";
export async function dispatchConsultationNotification(deps: {
  claim: () => Promise<{
    claimed: boolean;
    reason?: string;
    attempt?: { id: string; claim_token: string };
  }>;
  send: (
    idempotencyKey: string,
  ) => Promise<{ id?: string; rejected?: boolean }>;
  complete: (
    id: string,
    claim: string,
    status: "accepted" | "failed" | "indeterminate",
    providerId: string | null,
  ) => Promise<void>;
}) {
  const claim = await deps.claim();
  if (!claim.claimed) {
    if (claim.reason === "complete")
      return "The provider already accepted this version. No duplicate was sent; acceptance does not confirm inbox delivery.";
    throw new SchedulingError(
      claim.reason === "busy"
        ? "A notification is pending or retry cooldown is active. Nothing new was sent."
        : "Notification reconciliation or a fresh preview is required before sending again.",
    );
  }
  if (!claim.attempt?.id || !claim.attempt.claim_token)
    throw new SchedulingError(
      "A delivery claim could not be recorded. Nothing was sent.",
    );
  let outcome: { id?: string; rejected?: boolean };
  try {
    outcome = await deps.send(`consultation-email/${claim.attempt.id}`);
  } catch {
    outcome = {};
  }
  const status = outcome.id
    ? "accepted"
    : outcome.rejected
      ? "failed"
      : "indeterminate";
  await deps.complete(
    claim.attempt.id,
    claim.attempt.claim_token,
    status,
    outcome.id ?? null,
  );
  return status === "accepted"
    ? "Resend accepted the notification. Inbox delivery has not been confirmed."
    : status === "failed"
      ? "The provider rejected the notification. Check sender configuration before retrying."
      : "The provider outcome is unknown. Check history before retrying; no automatic resend was made.";
}
