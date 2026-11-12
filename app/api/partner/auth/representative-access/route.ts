import { after, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { representativeAccessMessage } from "@/lib/partner-auth/passwordless-core";
import { sendRepresentativeAccess } from "@/lib/partner-auth/passwordless-server";
import { rateLimit } from "@/lib/referrals/server";
import { readLimitedAuthBody } from "@/lib/partner-auth/http-body";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const started = Date.now();
  const minimumDuration = randomInt(700, 901);
  const response = async () => {
    await setTimeout(Math.max(0, minimumDuration - (Date.now() - started)));
    return NextResponse.json({ message: representativeAccessMessage }, { headers: { "Cache-Control": "no-store" } });
  };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (request.headers.get("origin") !== new URL(request.url).origin ||
      !request.headers.get("content-type")?.startsWith("application/json") ||
      !rateLimit(`representative-ip:${ip}`, 5, 15 * 60_000)) return response();
  try {
    const raw = await readLimitedAuthBody(request, 2048);
    const representativeId = JSON.parse(raw).representativeId;
    // Provider/DB work occurs after the generic response so latency cannot
    // expose whether the representative ID maps to a real account.
    after(async () => { await sendRepresentativeAccess(representativeId); });
  } catch { /* Never expose eligibility, contact details or provider errors. */ }
  return response();
}
