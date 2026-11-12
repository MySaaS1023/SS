export type AdministratorRole = "super_admin" | "admin";
export type AdministratorStatus = "active" | "disabled" | "revoked";
export function isActiveAdministrator(
  value: { role?: unknown; status?: unknown } | null | undefined,
) {
  return (
    value?.status === "active" &&
    (value.role === "super_admin" || value.role === "admin")
  );
}
export async function resolveAdministratorAccess(
  enabled: boolean,
  legacyAllowed: boolean,
  load: () => Promise<{ role?: unknown; status?: unknown } | null>,
) {
  if (!enabled) return legacyAllowed;
  try {
    return isActiveAdministrator(await load());
  } catch {
    return false;
  }
}
export type Administrator = {
  user_id: string;
  display_name: string;
  email: string;
  role: AdministratorRole;
  status: AdministratorStatus;
  version: number;
};
export const operationalWorkspaces = [
  "Referral Program",
  "Client Scheduling",
  "Client Handoff",
  "QR Code",
] as const;
export const invitationProposalTemplate = {
  name: "Awaiting owner-approved recipient",
  email: "Not configured",
  role: "admin" as const,
  status: "Awaiting explicit owner approval — not sent or activated",
  workspaces: operationalWorkspaces,
};
export type AdministratorChange = {
  userId: string;
  role: AdministratorRole;
  status: AdministratorStatus;
  version: number;
  confirmation: string;
};
export function parseAdministratorChange(value: unknown): AdministratorChange {
  if (!value || typeof value !== "object") throw new Error("Invalid request.");
  const data = value as Record<string, unknown>;
  if (
    typeof data.userId !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      data.userId,
    ) ||
    !["super_admin", "admin"].includes(String(data.role)) ||
    !["active", "disabled", "revoked"].includes(String(data.status)) ||
    !Number.isSafeInteger(data.version) ||
    Number(data.version) < 1 ||
    typeof data.confirmation !== "string" ||
    data.confirmation.length > 254
  ) {
    throw new Error("Invalid administrator change.");
  }
  return data as AdministratorChange;
}
export function authorizeAdministratorChange(
  actor: Administrator,
  target: Administrator,
  change: AdministratorChange,
  activeSuperAdministrators: number,
) {
  if (actor.role !== "super_admin" || actor.status !== "active")
    throw new Error("Super Admin access required.");
  if (target.user_id !== change.userId || target.version !== change.version)
    throw new Error("This record changed. Reload before continuing.");
  if (change.confirmation !== target.email)
    throw new Error("Confirm the exact administrator email address.");
  if (
    target.role === "super_admin" &&
    target.status === "active" &&
    (change.role !== "super_admin" || change.status !== "active") &&
    activeSuperAdministrators <= 1
  )
    throw new Error("The last active Super Admin must be retained.");
}
