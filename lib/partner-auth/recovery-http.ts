import { NextResponse } from "next/server";
import { recoveryEnabled, type RecoveryPortal } from "./recovery-core";
import { getRecoveryCookie, clearRecoveryCookie, recoveryContext } from "./recovery-server";
import { rateLimit } from "@/lib/referrals/server";
import { AuthBodyLimitError, readLimitedAuthBody } from "./http-body";
export async function completeRecoveryRequest(request: Request, portal: RecoveryPortal) {
  const headers = { "Cache-Control": "no-store" };
  if (!recoveryEnabled()) return NextResponse.json({ error: "Recovery setup is unavailable." }, { status: 403, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Request origin denied." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "JSON required." }, { status: 415, headers });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`recovery-complete:${portal}:${ip}`, 8, 60_000)) return NextResponse.json({ error: "Too many attempts. Request a new recovery link later." }, { status: 429, headers });
  try {
    const raw = await readLimitedAuthBody(request, 4096);
    const body = JSON.parse(raw);
    const { service, identity } = await recoveryContext();
    const result = await service.complete(await getRecoveryCookie(portal), portal, await identity(portal), body.password, body.confirmation);
    await clearRecoveryCookie(portal);
    return NextResponse.json(result ? { success: true, signInRequired: true } : { error: "The recovery link is invalid, expired, or already used. Request a new link." }, { status: result ? 200 : 401, headers });
  } catch (error) {
    if (error instanceof AuthBodyLimitError) return NextResponse.json({ error: "Request too large." }, { status: 413, headers });
    const validation = error instanceof Error && /^(Use 12|Passwords do not match)/.test(error.message);
    return NextResponse.json({ error: validation && error instanceof Error ? error.message : "Recovery could not be completed. Request a new recovery link." }, { status: 400, headers });
  }
}
