import "server-only";
import { createClient, type User } from "@supabase/supabase-js";
import { administratorRolesEnabled, createAdminSupabaseClient, createServerSupabaseClient, hasAdministratorAccess, isAdminEmail, adminMustChangePassword } from "@/lib/supabase/server";
import { isActiveAdministrator } from "@/lib/admin-management/core";
import { getSiteUrl } from "@/lib/referrals/config";
import { rateLimit } from "@/lib/referrals/server";
import { partnerMustChangePassword } from "@/lib/referrals/partner-access";
import { completeEmailLink, emailLinksEnabled, requestEmailLink, type Portal, type PortalIdentity } from "./core";

async function identityForUser(user: User): Promise<PortalIdentity> {
  const administrator = await hasAdministratorAccess(user);
  let approvedPartner = false;
  if (!administrator && user.email) {
    const database = createAdminSupabaseClient();
    const { data, error } = await database.from("referral_partners").select("id,email")
      .eq("user_id", user.id).eq("status", "approved").maybeSingle();
    approvedPartner = !error && Boolean(data && data.email.toLowerCase() === user.email.toLowerCase());
  }
  return { userId: user.id, email: user.email ?? "", confirmed: Boolean(user.email_confirmed_at), administrator, approvedPartner, mustChangePassword: administrator ? adminMustChangePassword(user) : partnerMustChangePassword(user) };
}

export async function findEmailLinkIdentity(email: string, portal: Portal): Promise<PortalIdentity | null> {
  const database = createAdminSupabaseClient();
  let userId: string | null = null;
  if (portal === "partner") {
    const { data, error } = await database.from("referral_partners").select("user_id,email")
      .eq("email", email).eq("status", "approved").maybeSingle();
    if (error || !data?.user_id) return null;
    userId = data.user_id;
  } else if (administratorRolesEnabled()) {
    const { data, error } = await database.from("administrator_memberships").select("user_id,role,status")
      .eq("email", email).maybeSingle();
    if (error || !isActiveAdministrator(data) || !data?.user_id) return null;
    userId = data.user_id;
  } else {
    // The legacy architecture has an email allowlist, not UUID memberships.
    // Only allowlisted administrator addresses can trigger this bounded lookup.
    // No directory response, email or UUID is returned or logged publicly.
    if (!isAdminEmail(email)) return null;
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await database.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return null;
      const matches = data.users.filter(user => user.email?.toLowerCase() === email);
      if (matches.length > 1) return null;
      if (matches.length === 1) { userId = matches[0].id; break; }
      if (data.users.length < 1000) break;
    }
  }
  if (!userId) return null;
  const { data, error } = await database.auth.admin.getUserById(userId);
  if (error || !data.user || !data.user.email_confirmed_at || data.user.email?.toLowerCase() !== email) return null;
  return identityForUser(data.user);
}

export async function sendPortalEmailLink(value: unknown, portal: Portal) {
  return requestEmailLink(value, portal, {
    enabled: emailLinksEnabled(),
    limit: key => rateLimit(`portal-email:${key}`, 3, 15 * 60_000),
    find: findEmailLinkIdentity,
    send: async (email, selectedPortal) => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) throw new Error("Authentication unavailable.");
      // Stateless sending prevents eligibility-dependent verifier cookies.
      // Supabase Auth sends the message; neither Resend key is used here.
      const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, flowType: "implicit" } });
      const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${getSiteUrl()}/auth/email-access?portal=${selectedPortal}` } });
      if (error) throw new Error("Authentication request unavailable.");
    },
  });
}

export async function finishPortalEmailLink(hash: string, portal: Portal) {
  if (!emailLinksEnabled()) return null;
  const client = await createServerSupabaseClient();
  return completeEmailLink(hash, "magiclink", portal, {
    enabled: emailLinksEnabled(),
    hasExistingSession: async () => {
      const { data, error } = await client.auth.getUser();
      if (error && error.name !== "AuthSessionMissingError") throw new Error("Existing session could not be verified.");
      return Boolean(data.user);
    },
    verify: async tokenHash => {
      const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
      if (error || !data.user || !data.session) return null;
      return identityForUser(data.user);
    },
    signOut: async () => { const { error } = await client.auth.signOut({ scope: "local" }); if (error) throw new Error("Sign-in cleanup unavailable."); },
  });
}
