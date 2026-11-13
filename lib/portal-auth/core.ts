import { createHash } from "node:crypto";

export type Portal = "admin" | "partner";
export type PortalIdentity = {
  userId: string;
  email: string;
  confirmed: boolean;
  administrator: boolean;
  approvedPartner: boolean;
  mustChangePassword: boolean;
};
export const emailLinkMessage = "If this email belongs to an eligible account, a secure sign-in link will be sent. You can also use your existing login.";
export const pendingLinkLifetimeSeconds = 300;
export function emailLinksEnabled() { return process.env.PORTAL_EMAIL_LINK_ENABLED === "true"; }
export function parsePortal(value: unknown): Portal | null { return value === "admin" || value === "partner" ? value : null; }
export function normalizeLoginEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function emailRateKey(email: string) { return createHash("sha256").update(email).digest("hex"); }
export function validEmailToken(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value); }
export function pendingLinkCookie(portal: Portal) { return `ss-email-access-${portal}`; }
export function portalLogin(portal: Portal) { return `/${portal}/login`; }
export function allowedPortalIdentity(identity: PortalIdentity | null, portal: Portal) {
  return Boolean(identity?.userId && identity.confirmed && normalizeLoginEmail(identity.email) && (portal === "admin" ? identity.administrator : identity.approvedPartner && !identity.administrator));
}
export async function requestEmailLink(value: unknown, portal: Portal, deps: {
  enabled: boolean;
  limit(key: string): boolean;
  find(email: string, portal: Portal): Promise<PortalIdentity | null>;
  send(email: string, portal: Portal): Promise<void>;
}) {
  const email = normalizeLoginEmail(value);
  if (!deps.enabled || !email || !deps.limit(`${portal}:${emailRateKey(email)}`)) return emailLinkMessage;
  try {
    const identity = await deps.find(email, portal);
    if (allowedPortalIdentity(identity, portal) && identity && normalizeLoginEmail(identity.email) === email) await deps.send(identity.email, portal);
  } catch { /* Do not expose eligibility, contact details, provider errors or directory state. */ }
  return emailLinkMessage;
}
export async function completeEmailLink(hash: unknown, type: unknown, portal: Portal, deps: {
  enabled: boolean;
  hasExistingSession?(): Promise<boolean>;
  verify(hash: string): Promise<PortalIdentity | null>;
  signOut(): Promise<void>;
}) {
  if (!deps.enabled || type !== "magiclink" || !validEmailToken(hash)) return null;
  // Never silently switch or clear an already authenticated account. The user
  // must explicitly sign out through the existing workflow before using a link.
  try { if (await deps.hasExistingSession?.()) return null; }
  catch { return null; }
  try {
    // Only the Auth provider's one-time verification can establish identity.
    // An ordinary existing session is never accepted instead of this exchange.
    const identity = await deps.verify(hash);
    if (!allowedPortalIdentity(identity, portal) || !identity) {
      await deps.signOut();
      return null;
    }
    // Preserve existing forced-password safeguards; do not silently alter Auth
    // metadata or turn an invitation/setup link into an ordinary login.
    return identity.mustChangePassword ? `/${portal}/change-password` : `/${portal}`;
  } catch {
    await deps.signOut().catch(() => {});
    return null;
  }
}
