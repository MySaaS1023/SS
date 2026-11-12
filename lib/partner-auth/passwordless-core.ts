import { createHash } from "node:crypto";

export const representativeAccessMessage = "If this representative ID is eligible, a secure sign-in link will be sent to its verified contact method. You can also use your existing login.";
export function passwordlessEnabled() { return process.env.PARTNER_PASSWORDLESS_ENABLED === "true"; }
export function normalizeRepresentativeId(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return /^SS-[A-HJ-NP-Z2-9]{6}$/.test(normalized) ? normalized : null;
}
export function representativeRateKey(value: string) { return createHash("sha256").update(value).digest("hex"); }
export type PartnerAccessIdentity = { userId: string; email: string; confirmed: boolean; approved: boolean; protectedAdministrator: boolean };
export function canSendRepresentativeAccess(identity: PartnerAccessIdentity | null) {
  return Boolean(identity && identity.approved && identity.confirmed && !identity.protectedAdministrator && identity.userId && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.email));
}
export async function requestRepresentativeAccess(value: unknown, deps: {
  enabled: boolean;
  limit(key: string): boolean;
  find(code: string): Promise<PartnerAccessIdentity | null>;
  send(identity: PartnerAccessIdentity): Promise<void>;
}) {
  const code = normalizeRepresentativeId(value);
  if (!deps.enabled || !code || !deps.limit(representativeRateKey(code))) return representativeAccessMessage;
  try {
    const identity = await deps.find(code);
    if (canSendRepresentativeAccess(identity) && identity) await deps.send(identity);
  } catch { /* Identical response for unavailable setup, provider failure or ineligible ID. */ }
  return representativeAccessMessage;
}
