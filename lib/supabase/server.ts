import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { User } from "@supabase/supabase-js";

import type { ReferralAuthRole } from "@/lib/referrals/auth";

function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  return { url, key };
}

export async function createServerSupabaseClient() {
  const { url, key } = publicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies. Middleware/callback routes refresh them.
        }
      },
    },
  });
}

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Supabase server environment variables are not configured.",
    );
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowed = (
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    "support@steadystartco.com"
  )
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getApprovedPartner() {
  const user = await requireUser();
  if (!user) return null;
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("referral_partners")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();
  return data ? { user, partner: data } : null;
}

export async function getAdminUser() {
  const user = await requireUser();
  return user && isAdminEmail(user.email) ? user : null;
}

export async function getUserReferralRole(
  suppliedUser?: User | null,
): Promise<ReferralAuthRole> {
  const user = suppliedUser === undefined ? await requireUser() : suppliedUser;
  if (!user) return null;
  if (isAdminEmail(user.email)) return "admin";
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("referral_partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "approved")
    .maybeSingle();
  return data ? "partner" : null;
}
