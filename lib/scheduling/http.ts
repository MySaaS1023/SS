import { isIP } from "node:net";
import { SchedulingError } from "./core";
export const scheduleResponse = (status: number, message: string) =>
  Response.json(
    { ok: status >= 200 && status < 300, message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
export async function bookingRequest(
  request: Request,
  options: {
    origin: string;
    submit: (input: unknown, address: string) => Promise<string>;
  },
) {
  if (request.headers.get("origin") !== options.origin)
    return scheduleResponse(
      403,
      "Please submit from the Steady Start website.",
    );
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return scheduleResponse(415, "Submit consultation details as JSON.");
  if (Number(request.headers.get("content-length")) > 8192)
    return scheduleResponse(413, "Your request is too long.");
  try {
    const reader = request.body?.getReader();
    if (!reader) return scheduleResponse(400, "Enter consultation details.");
    let size = 0,
      text = "";
    const decoder = new TextDecoder();
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return scheduleResponse(413, "Your request is too long.");
      }
      text += decoder.decode(next.value, { stream: true });
    }
    text += decoder.decode();
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(text);
      if (!input || typeof input !== "object" || Array.isArray(input))
        throw new Error();
    } catch {
      return scheduleResponse(400, "Enter valid consultation details.");
    }
    if (input.website)
      return scheduleResponse(
        200,
        "Your consultation request has been received. A meeting is confirmed only after Steady Start reviews it.",
      );
    const raw = (
      request.headers.get("x-vercel-forwarded-for") ||
      request.headers.get("x-forwarded-for") ||
      ""
    )
      .split(",")[0]
      .trim();
    const result = await options.submit(input, isIP(raw) ? raw : "unknown");
    if (result === "rate_limited")
      return scheduleResponse(
        429,
        "Please wait before requesting another consultation.",
      );
    if (result === "unavailable")
      return scheduleResponse(
        409,
        "That time is no longer available. Choose another slot.",
      );
    if (result !== "received")
      return scheduleResponse(400, "Check the request details and try again.");
    return scheduleResponse(
      200,
      "Your consultation request has been received. A meeting is confirmed only after Steady Start reviews it. We will follow up with your meeting details.",
    );
  } catch (error) {
    return scheduleResponse(
      error instanceof SchedulingError && error.kind === "validation"
        ? 400
        : 503,
      error instanceof SchedulingError && error.kind === "validation"
        ? error.message
        : "Consultation requests are temporarily unavailable. Please try again later.",
    );
  }
}
