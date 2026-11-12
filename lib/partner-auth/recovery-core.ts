import { createHash, randomBytes } from "node:crypto";

export type RecoveryPortal = "admin" | "partner";
export type RecoveryIdentity = { userId: string; sessionFingerprint: string };
export type RecoveryGrant = RecoveryIdentity & { portal: RecoveryPortal; nonceHash: string; expiresAt: string };
export const recoveryLifetimeMs = 10 * 60_000;
export function recoveryEnabled() { return process.env.AUTH_RECOVERY_V2_ENABLED === "true"; }
export function recoveryPortal(value: unknown): RecoveryPortal | null { return value === "admin" || value === "partner" ? value : null; }
export function hashRecoveryValue(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function validRecoveryTokenHash(value: unknown): value is string { return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value); }
export function recoveryCookieName(portal: RecoveryPortal) { return `ss-${portal}-recovery`; }
export function recoveryRedirect(site: string, portal: RecoveryPortal) { return `${site.replace(/\/$/, "")}/auth/recovery?portal=${portal}`; }
export function validateRecoveryPasswords(password: unknown, confirmation: unknown) {
  if (typeof password !== "string" || password.length < 12 || password.length > 256) throw new Error("Use 12–256 characters for your password.");
  if (password !== confirmation) throw new Error("Passwords do not match.");
  return password;
}
export type RecoveryDependencies = {
  now(): number;
  verify(tokenHash: string, portal: RecoveryPortal): Promise<RecoveryIdentity | null>;
  save(grant: RecoveryGrant): Promise<void>;
  check(grant: Omit<RecoveryGrant, "expiresAt">): Promise<boolean>;
  consume(grant: Omit<RecoveryGrant, "expiresAt">): Promise<boolean>;
  updatePassword(password: string): Promise<boolean>;
  signOut(): Promise<void>;
};
export function createRecoveryService(deps: RecoveryDependencies) {
  return {
    async begin(tokenHash: unknown, suppliedType: unknown, portal: RecoveryPortal) {
      if (suppliedType !== "recovery" || !validRecoveryTokenHash(tokenHash)) return null;
      const identity = await deps.verify(tokenHash, portal);
      if (!identity) return null;
      const nonce = randomBytes(32).toString("base64url");
      await deps.save({ ...identity, portal, nonceHash: hashRecoveryValue(nonce), expiresAt: new Date(deps.now() + recoveryLifetimeMs).toISOString() });
      return nonce;
    },
    async valid(nonce: string | undefined, portal: RecoveryPortal, identity: RecoveryIdentity | null) {
      if (!nonce || !/^[A-Za-z0-9_-]{43}$/.test(nonce) || !identity) return false;
      return deps.check({ ...identity, portal, nonceHash: hashRecoveryValue(nonce) });
    },
    async complete(nonce: string | undefined, portal: RecoveryPortal, identity: RecoveryIdentity | null, password: unknown, confirmation: unknown) {
      const validated = validateRecoveryPasswords(password, confirmation);
      if (!nonce || !/^[A-Za-z0-9_-]{43}$/.test(nonce) || !identity) return false;
      // Atomic database consumption happens before the Auth write. Failed writes
      // require a new recovery link; a replay can never change the password twice.
      if (!await deps.consume({ ...identity, portal, nonceHash: hashRecoveryValue(nonce) })) return false;
      try { return await deps.updatePassword(validated); }
      finally { await deps.signOut(); }
    },
  };
}
