import { NextResponse } from "next/server";
import { createServerSupabaseClient, getUserReferralRole } from "@/lib/supabase/server";
import { passwordlessEnabled } from "@/lib/partner-auth/passwordless-core";
import { validRecoveryTokenHash } from "@/lib/partner-auth/recovery-core";
import { finishRepresentativeAccess } from "@/lib/partner-auth/passwordless-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
  const fail = () => NextResponse.redirect(new URL("/partner/login?error=invalid-link", url.origin), { headers });
  const hash = url.searchParams.get("token_hash");
  if (!passwordlessEnabled() || url.searchParams.get("type") !== "magiclink" || !validRecoveryTokenHash(hash)) return fail();
  try {
    const client = await createServerSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({ token_hash: hash, type: "magiclink" });
    if (error || !data.user || await getUserReferralRole(data.user) !== "partner" || !await finishRepresentativeAccess(data.user)) {
      await client.auth.signOut({ scope: "local" });
      return fail();
    }
    return NextResponse.redirect(new URL("/partner", url.origin), { headers });
  } catch { return fail(); }
}
