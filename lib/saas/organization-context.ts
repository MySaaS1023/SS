import type { OrganizationMembership, UserRole } from "@/lib/saas/types";

export type ActiveOrganizationContext = {
  organizationId: string;
  userId: string;
  role: UserRole;
};

export type ResolveOrganizationContextInput = {
  organizationId?: string | null;
  userId?: string | null;
  membership?: Pick<OrganizationMembership, "organizationId" | "userId" | "role" | "status">;
};

export class OrganizationContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationContextError";
  }
}

export function resolveOrganizationContext({
  organizationId,
  userId,
  membership,
}: ResolveOrganizationContextInput): ActiveOrganizationContext {
  if (membership) {
    if (membership.status !== "active") {
      throw new OrganizationContextError("Organization membership is not active.");
    }

    return {
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
    };
  }

  if (!organizationId || !userId) {
    throw new OrganizationContextError("Organization context is required.");
  }

  return {
    organizationId,
    userId,
    role: "owner",
  };
}

export function assertOrganizationScoped(record: { organizationId?: string | null }) {
  if (!record.organizationId) {
    throw new OrganizationContextError("Record must include an organizationId.");
  }
}
