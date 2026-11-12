import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/referrals/server";

export const invitationResponseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};
export function invitationResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: invitationResponseHeaders,
  });
}
export async function readInvitationRequest(
  request: Request,
): Promise<{ body: Record<string, unknown> } | Response> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`admin-invitation-http:${ip}`, 12, 60_000))
    return invitationResponse(
      { error: "Too many attempts. Try again later." },
      429,
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return invitationResponse({ error: "Request denied." }, 403);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return invitationResponse({ error: "JSON required." }, 415);
  const reader = request.body?.getReader();
  if (!reader) return invitationResponse({ error: "Invalid request." }, 400);
  try {
    let bytes = 0,
      text = "";
    const decoder = new TextDecoder("utf-8", { fatal: true });
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        return invitationResponse({ error: "Request too large." }, 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    const body = JSON.parse(text + decoder.decode());
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Invalid body");
    return { body };
  } catch {
    return invitationResponse({ error: "Invalid request." }, 400);
  }
}
