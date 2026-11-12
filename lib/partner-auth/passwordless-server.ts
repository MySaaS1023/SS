import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isProtectedAdminIdentity } from "@/lib/admin-management/server";
import { getSiteUrl } from "@/lib/referrals/config";
import { rateLimit } from "@/lib/referrals/server";
import { passwordlessEnabled, requestRepresentativeAccess } from "./passwordless-core";

export async function sendRepresentativeAccess(value: unknown) {
  return requestRepresentativeAccess(value, {
    enabled: passwordlessEnabled(),
    limit: key => rateLimit(`representative-id:${key}`, 3, 15 * 60_000),
    find: async code => {
      const database = createAdminSupabaseClient();
      const { data: partner, error } = await database.from("referral_partners")
        .select("user_id,email,status").eq("referral_code", code).eq("status", "approved").maybeSingle();
      if (error || !partner?.user_id) return null;
      const { data, error: userError } = await database.auth.admin.getUserById(partner.user_id);
      if (userError || !data.user || !data.user.email || data.user.email.toLowerCase() !== partner.email.toLowerCase()) return null;
      return { userId: data.user.id, email: data.user.email, confirmed: Boolean(data.user.email_confirmed_at), approved: partner.status === "approved", protectedAdministrator: await isProtectedAdminIdentity(data.user.id, data.user.email) };
    },
    send: async identity => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anon) throw new Error("Partner sign-in setup is unavailable.");
      // No SSR/PKCE storage here: writing verifier cookies only for existing IDs
      // would disclose eligibility. Email verification uses a strict hash callback.
      const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, flowType: "implicit" } });
      const { error } = await client.auth.signInWithOtp({ email: identity.email, options: { shouldCreateUser: false, emailRedirectTo: `${getSiteUrl()}/auth/partner-access` } });
      if (error) throw new Error("Representative access provider declined the request.");
    },
  });
}

export async function finishRepresentativeAccess(user: User) {
  if (!passwordlessEnabled() || !user.email_confirmed_at || await isProtectedAdminIdentity(user.id, user.email)) return false;
  const database = createAdminSupabaseClient();
  const { data, error } = await database.from("referral_partners").select("id,email")
    .eq("user_id", user.id).eq("status", "approved").maybeSingle();
  if (error || !data || data.email.toLowerCase() !== user.email?.toLowerCase()) return false;
  // Only after one-time provider code exchange and an owner-approved cutover.
  // This completes legacy temporary-password setup without requiring a password.
  const { error: metadataError } = await database.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, must_change_password: false, partner_passwordless_verified: true },
  });
  return !metadataError;
}
