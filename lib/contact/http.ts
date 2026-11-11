import { isIP } from "node:net";
import { ContactValidationError } from "./core";
import type { ContactResult } from "./shared";

function response(status: number, result: ContactResult) {
  return Response.json(result, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
      ...(status === 429 ? { "Retry-After": "3600" } : {}),
    },
  });
}

export async function handleContactRequest(
  request: Request,
  options: {
    origin: string;
    submit: (input: unknown, address: string) => Promise<ContactResult>;
  },
) {
  const rejected = (status: number, message: string) =>
    response(status, { ok: false, status: "blocked", message });
  if (
    request.headers.get("origin") !== options.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return rejected(
      403,
      "Please submit the contact form from the Steady Start website.",
    );
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return rejected(415, "Submit contact details as JSON.");
  if (Number(request.headers.get("content-length")) > 20_000)
    return rejected(413, "Your message is too long.");
  let input: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return rejected(400, "Complete the contact form.");
    let size = 0,
      text = "";
    const decoder = new TextDecoder();
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 20_000) {
        await reader.cancel();
        return rejected(413, "Your message is too long.");
      }
      text += decoder.decode(next.value, { stream: true });
    }
    text += decoder.decode();
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    input = parsed as Record<string, unknown>;
  } catch {
    return rejected(400, "Complete the contact form with valid details.");
  }
  // Honeypots never produce a fake sending-success response.
  if (input.website !== "")
    return rejected(
      400,
      "We could not accept this form. Please email Steady Start directly.",
    );
  const forwarded = (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    ""
  )
    .split(",")[0]
    .trim();
  try {
    const result = await options.submit(
      input,
      isIP(forwarded) ? forwarded : "unknown",
    );
    const status = result.ok
      ? 200
      : result.status === "rate_limited"
        ? 429
        : result.status === "pending"
          ? 409
          : 503;
    return response(status, result);
  } catch (error) {
    return error instanceof ContactValidationError
      ? response(400, {
          ok: false,
          status: "validation",
          message: error.message,
        })
      : response(503, {
          ok: false,
          status: "unavailable",
          message:
            "Contact email is temporarily unavailable. Please email support@steadystartco.com directly.",
        });
  }
}
