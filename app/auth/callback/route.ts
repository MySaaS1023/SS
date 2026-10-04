import { NextResponse } from "next/server";

import {
  authFailureDestination,
  resolveAuthenticatedDestination,
} from "@/lib/referrals/auth";
import {
  createServerSupabaseClient,
  getUserReferralRole,
} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next");
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const role = await getUserReferralRole(data.user);
      const destination = resolveAuthenticatedDestination(role, requested);
      if (destination)
        return NextResponse.redirect(new URL(destination, url.origin));
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/partner/login?error=unauthorized", url.origin),
      );
    }
  }
  return NextResponse.redirect(
    new URL(authFailureDestination(requested), url.origin),
  );
}
