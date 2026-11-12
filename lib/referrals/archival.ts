export const archiveKinds = [
  "application",
  "partner",
  "referral",
  "resource",
] as const;
export type ArchiveKind = (typeof archiveKinds)[number];

export function archiveRequest(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (
    !archiveKinds.includes(input.kind as ArchiveKind) ||
    typeof input.recordId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      input.recordId,
    ) ||
    input.confirmation !== `ARCHIVE ${input.recordId}`
  )
    return null;
  return {
    kind: input.kind as ArchiveKind,
    recordId: input.recordId,
    confirmation: input.confirmation,
  };
}

// Existing partner submissions create leads/invitations immediately. Neither
// a partial intake nor a failed email makes a submitted record a private draft.
export function canPartnerRemoveReferral() {
  return false;
}
