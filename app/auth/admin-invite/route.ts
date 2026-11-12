import { NextResponse } from "next/server";
import { beginAdministratorInvitation } from "@/lib/admin-management/invitations-server";
import { invitationResponseHeaders } from "@/lib/admin-management/invitations-http";
import { rateLimit } from "@/lib/referrals/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = () =>
    NextResponse.redirect(
      new URL("/admin/login?error=invalid-invitation", url.origin),
      { headers: invitationResponseHeaders },
    );
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-invitation-callback:${ip}`, 12, 60_000)) return fail();
  try {
    const ok = await beginAdministratorInvitation({
      id: url.searchParams.get("id"),
      nonce: url.searchParams.get("nonce"),
      tokenHash: url.searchParams.get("token_hash"),
      type: url.searchParams.get("type"),
    });
    return ok
      ? NextResponse.redirect(
          new URL("/auth/admin-invite/accept", url.origin),
          { headers: invitationResponseHeaders },
        )
      : fail();
  } catch {
    return fail();
  }
}
