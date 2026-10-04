export type ReusablePartner = {
  id: string;
  user_id: string | null;
  application_id: string | null;
  email: string;
  referral_code: string;
  status: string;
  approved_at: string | null;
};

export class PartnerApprovalError extends Error {
  constructor(
    public readonly code:
      | "auth_user_create_failed"
      | "auth_user_update_failed"
      | "existing_auth_user_conflict"
      | "partner_create_failed"
      | "partner_association_failed"
      | "application_update_failed"
      | "referral_code_collision"
      | "database_constraint_failed"
      | "approval_failed",
    options?: { cause?: unknown },
  ) {
    super(code, options);
    this.name = "PartnerApprovalError";
  }
}

export function resolveReusablePartner(input: {
  authUserId: string;
  byApplication?: ReusablePartner | null;
  byUser?: ReusablePartner | null;
  byEmail?: ReusablePartner | null;
}) {
  const candidates = [input.byApplication, input.byUser, input.byEmail].filter(
    (partner): partner is ReusablePartner => Boolean(partner),
  );
  const unique = new Map(candidates.map((partner) => [partner.id, partner]));
  if (unique.size > 1)
    throw new PartnerApprovalError("existing_auth_user_conflict");
  const partner = unique.values().next().value as ReusablePartner | undefined;
  if (partner?.user_id && partner.user_id !== input.authUserId)
    throw new PartnerApprovalError("existing_auth_user_conflict");
  return partner ?? null;
}

export function safeApprovalFailureCode(error: unknown) {
  if (error instanceof PartnerApprovalError) return error.code;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  )
    return "database_constraint_failed" as const;
  return "approval_failed" as const;
}
