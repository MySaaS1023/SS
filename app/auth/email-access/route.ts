import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/referrals/config";
import { rateLimit } from "@/lib/referrals/server";
import { readLimitedAuthBody } from "@/lib/partner-auth/http-body";
import { emailLinksEnabled, parsePortal, pendingLinkCookie, pendingLinkLifetimeSeconds, portalLogin, validEmailToken, type Portal } from "@/lib/portal-auth/core";
import { finishPortalEmailLink } from "@/lib/portal-auth/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/auth/email-access" };
function redirect(path: string) { return NextResponse.redirect(new URL(path, getSiteUrl()), { status: 303, headers }); }
function fail(portal: Portal) { return redirect(`${portalLogin(portal)}?error=invalid-link`); }
function clearPending(response: NextResponse, portal: Portal) {
  response.cookies.set(pendingLinkCookie(portal), "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const selectedPortal = parsePortal(url.searchParams.get("portal"));
  const portal = selectedPortal ?? "admin";
  if (!emailLinksEnabled() || !selectedPortal || url.searchParams.getAll("portal").length !== 1 || url.origin !== new URL(getSiteUrl()).origin) return fail(portal);
  const hash = url.searchParams.get("token_hash");
  if (hash !== null) {
    if (url.searchParams.getAll("token_hash").length !== 1 || url.searchParams.getAll("type").length !== 1 || url.searchParams.get("type") !== "magiclink" || !validEmailToken(hash)) return fail(portal);
    // Do not consume an Auth token on GET (email scanners may follow links).
    // Move it to a short-lived HttpOnly cookie and remove it from the visible
    // URL before showing confirmation; no token appears in HTML or assets.
    const response = redirect(`/auth/email-access?portal=${portal}&confirm=1`);
    response.cookies.set(pendingLinkCookie(portal), hash, { ...cookieOptions, maxAge: pendingLinkLifetimeSeconds });
    return response;
  }
  const pending = (await cookies()).get(pendingLinkCookie(portal))?.value;
  if (url.searchParams.get("confirm") !== "1" || !validEmailToken(pending)) return fail(portal);
  const title = portal === "admin" ? "Administrator" : "Referral Partner";
  return new NextResponse(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm Secure Sign-In — Steady Start</title><style>body{margin:0;background:#f5f9fc;color:#071c3d;font:16px/1.6 system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}main{max-width:460px;margin:24px;padding:32px;background:white;border:1px solid #cbd5e1;border-radius:20px}h1{line-height:1.2}button{width:100%;padding:14px;border:0;border-radius:12px;background:#047857;color:white;font:inherit;font-weight:600;cursor:pointer}a{color:#0866cc}button:focus-visible,a:focus-visible{outline:3px solid #0866cc;outline-offset:4px}</style><main><p>Steady Start · ${title}</p><h1>Confirm Secure Sign-In</h1><p>Continue only if you requested this sign-in link for your own account. This link can be used once and expires shortly.</p><form method="post" action="/auth/email-access"><input type="hidden" name="portal" value="${portal}"><button name="confirmation" value="yes">Confirm Sign-In</button></form><p><a href="${portalLogin(portal)}">Return to existing login</a></p></main></html>`, { headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: Request) {
  const fallback: Portal = "admin";
  if (!emailLinksEnabled() || new URL(request.url).origin !== new URL(getSiteUrl()).origin || request.headers.get("origin") !== new URL(getSiteUrl()).origin || !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded")) return fail(fallback);
  let portal: Portal = fallback;
  try {
    const values = new URLSearchParams(await readLimitedAuthBody(request, 2048));
    const selectedPortal = parsePortal(values.get("portal"));
    if (!selectedPortal || values.getAll("portal").length !== 1 || values.getAll("confirmation").length !== 1 || values.get("confirmation") !== "yes") return fail(portal);
    portal = selectedPortal;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!rateLimit(`portal-email-confirm:${ip}`, 10, 15 * 60_000)) return clearPending(fail(portal), portal);
    const store = await cookies();
    const hash = store.get(pendingLinkCookie(portal))?.value;
    if (!validEmailToken(hash)) return clearPending(fail(portal), portal);
    // The provider enforces expiry and atomic single use, including concurrent
    // submissions. Cookie removal is defense in depth, not the replay proof.
    const destination = await finishPortalEmailLink(hash, portal);
    const allowed = [`/${portal}`, `/${portal}/change-password`];
    return clearPending(destination && allowed.includes(destination) ? redirect(destination) : fail(portal), portal);
  } catch { return clearPending(fail(portal), portal); }
}
