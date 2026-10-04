export type ApplicationDecision = "approve" | "reject";

export function decisionStatus(decision: ApplicationDecision) {
  return decision === "approve" ? "approved" : "rejected";
}

export function isIdempotentDecision(
  currentStatus: string,
  decision: ApplicationDecision,
) {
  return currentStatus === decisionStatus(decision);
}

export function canReviewApplication(
  currentStatus: string,
  decision: ApplicationDecision,
) {
  return (
    currentStatus === "pending" || isIdempotentDecision(currentStatus, decision)
  );
}

export function preserveInternalNotes(
  submittedNotes: string,
  existingNotes: string | null | undefined,
) {
  return submittedNotes || existingNotes || null;
}
