import { cookies } from "next/headers";
import { createAdminSupabaseClient, createServerSupabaseClient, getUserReferralRole } from "@/lib/supabase/server";
import { createRecoveryService, hashRecoveryValue, recoveryCookieName, recoveryLifetimeMs, type RecoveryIdentity, type RecoveryPortal } from "./recovery-core";

export async function recoveryContext() {
  const supabase = await createServerSupabaseClient();
  const database = createAdminSupabaseClient();
  async function identity(portal: RecoveryPortal): Promise<RecoveryIdentity | null> {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user || await getUserReferralRole(userData.user) !== portal) return null;
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) return null;
    // Only fingerprint a session after Auth has verified its user. The stable
    // session_id survives token refresh; the token itself is never persisted.
    let sessionId = data.session.access_token;
    try {
      const claims = JSON.parse(Buffer.from(sessionId.split(".")[1], "base64url").toString());
      if (typeof claims.session_id === "string") sessionId = claims.session_id;
    } catch { /* A non-JWT fixture safely falls back to hashing the token. */ }
    return { userId: userData.user.id, sessionFingerprint: hashRecoveryValue(sessionId) };
  }
  const service = createRecoveryService({
    now: Date.now,
    verify: async (token_hash, portal) => {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: "recovery" });
      if (error) return null;
      const result = await identity(portal);
      if (!result) await supabase.auth.signOut({ scope: "local" });
      return result;
    },
    save: async grant => {
      const { error } = await database.rpc("issue_auth_recovery_grant", { p_user: grant.userId, p_portal: grant.portal, p_nonce_hash: grant.nonceHash, p_session_hash: grant.sessionFingerprint, p_expires_at: grant.expiresAt });
      if (error) { await supabase.auth.signOut({ scope: "local" }); throw new Error("Recovery setup is unavailable."); }
    },
    check: async grant => {
      const { data, error } = await database.from("auth_recovery_grants").select("nonce_hash")
        .eq("user_id", grant.userId).eq("portal", grant.portal).eq("nonce_hash", grant.nonceHash)
        .eq("session_hash", grant.sessionFingerprint).is("consumed_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
      return !error && Boolean(data);
    },
    consume: async grant => {
      const { data, error } = await database.rpc("consume_auth_recovery_grant", { p_user: grant.userId, p_portal: grant.portal, p_nonce_hash: grant.nonceHash, p_session_hash: grant.sessionFingerprint });
      return !error && data === true;
    },
    updatePassword: async password => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return false;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return false;
      const { error: metadataError } = await database.auth.admin.updateUserById(data.user.id, { app_metadata: { ...data.user.app_metadata, must_change_password: false } });
      return !metadataError;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw new Error("Recovery session closure could not be confirmed.");
    },
  });
  return { service, identity };
}
export async function setRecoveryCookie(portal: RecoveryPortal, nonce: string) {
  const store = await cookies();
  store.set(recoveryCookieName(portal), nonce, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: recoveryLifetimeMs / 1000 });
}
export async function getRecoveryCookie(portal: RecoveryPortal) { return (await cookies()).get(recoveryCookieName(portal))?.value; }
export async function clearRecoveryCookie(portal: RecoveryPortal) { (await cookies()).delete(recoveryCookieName(portal)); }
