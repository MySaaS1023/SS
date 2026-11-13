import { after, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { rateLimit } from "@/lib/referrals/server";
import { readLimitedAuthBody } from "@/lib/partner-auth/http-body";
import { emailLinkMessage, emailLinksEnabled, normalizeLoginEmail, type Portal } from "./core";
import { sendPortalEmailLink } from "./server";

export async function portalEmailLinkRequest(request: Request, portal: Portal) {
  const started = Date.now();
  const minimumDuration = randomInt(700, 901);
  const response = async () => {
    await setTimeout(Math.max(0, minimumDuration - (Date.now() - started)));
    return NextResponse.json({ message: emailLinkMessage }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  };
  if (!emailLinksEnabled()) return response();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (request.headers.get("origin") !== new URL(request.url).origin ||
    !request.headers.get("content-type")?.startsWith("application/json") ||
    !rateLimit(`portal-email-ip:${ip}`, 5, 15 * 60_000)) return response();
  try {
    const raw = await readLimitedAuthBody(request, 2048);
    const email = normalizeLoginEmail(JSON.parse(raw).email);
    if (email) after(async () => { await sendPortalEmailLink(email, portal); });
  } catch { /* Same response for invalid input and unavailable setup. */ }
  return response();
}
