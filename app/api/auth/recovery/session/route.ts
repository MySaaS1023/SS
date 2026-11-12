import { NextResponse } from "next/server";
import { recoveryEnabled, recoveryPortal } from "@/lib/partner-auth/recovery-core";
import { getRecoveryCookie, recoveryContext } from "@/lib/partner-auth/recovery-server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const portal = recoveryPortal(new URL(request.url).searchParams.get("portal"));
  let valid = false;
  if (recoveryEnabled() && portal) {
    try {
      const { service, identity } = await recoveryContext();
      valid = await service.valid(await getRecoveryCookie(portal), portal, await identity(portal));
    } catch { /* Missing setup is denied, never replaced by ordinary session auth. */ }
  }
  return NextResponse.json({ valid }, { status: valid ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
