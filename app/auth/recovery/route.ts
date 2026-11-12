import { NextResponse } from "next/server";
import { recoveryEnabled, recoveryPortal } from "@/lib/partner-auth/recovery-core";
import { recoveryContext, setRecoveryCookie } from "@/lib/partner-auth/recovery-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const portal = recoveryPortal(url.searchParams.get("portal"));
  const failure = () => NextResponse.redirect(new URL(`/${portal ?? "partner"}/forgot-password?error=invalid-recovery-link`, url.origin), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  if (!recoveryEnabled() || !portal) return failure();
  try {
    const { service } = await recoveryContext();
    const nonce = await service.begin(url.searchParams.get("token_hash"), url.searchParams.get("type"), portal);
    if (!nonce) return failure();
    await setRecoveryCookie(portal, nonce);
    return NextResponse.redirect(new URL(`/${portal}/reset-password`, url.origin), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch { return failure(); }
}
