import { NextResponse } from "next/server";
import { parseAdministratorChange } from "@/lib/admin-management/core";
import { changeAdministrator } from "@/lib/admin-management/server";
import { rateLimit } from "@/lib/referrals/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`administrator-management:${ip}`, 10, 60_000))
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Request origin denied." },
      { status: 403 },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ error: "JSON required." }, { status: 415 });
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    let body = "",
      size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Request too large." },
          { status: 413, headers: { "Cache-Control": "no-store" } },
        );
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    const result = await changeAdministrator(
      parseAdministratorChange(JSON.parse(body)),
    );
    return NextResponse.json(
      { message: result.message },
      { status: result.status, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid administrator change." },
      { status: 400 },
    );
  }
}
