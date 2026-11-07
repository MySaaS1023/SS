import { isIP } from "node:net";
import { HandoffError, validToken } from "./core";
import type { FeedbackOutcome } from "./feedback";

export function feedbackResponse(status: number, message: string) {
  return Response.json(
    { ok: status >= 200 && status < 300, message },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
export async function handleFeedbackRequest(
  request: Request,
  options: {
    origin: string;
    submit: (
      token: string,
      input: unknown,
      address: string,
    ) => Promise<FeedbackOutcome>;
  },
) {
  if (request.headers.get("origin") !== options.origin)
    return feedbackResponse(
      403,
      "Feedback must be submitted from this website.",
    );
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return feedbackResponse(415, "Submit feedback as JSON.");
  if (Number(request.headers.get("content-length")) > 4096)
    return feedbackResponse(413, "Feedback is too long.");
  let body = "";
  try {
    const reader = request.body?.getReader();
    if (!reader) return feedbackResponse(400, "Enter your feedback.");
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return feedbackResponse(413, "Feedback is too long.");
      }
      body += decoder.decode(next.value, { stream: true });
    }
    body += decoder.decode();
  } catch {
    return feedbackResponse(400, "Feedback could not be read.");
  }
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    input = parsed as Record<string, unknown>;
  } catch {
    return feedbackResponse(400, "Enter valid feedback.");
  }
  if (!validToken(input.token))
    return feedbackResponse(404, "This handoff is unavailable.");
  // Vercel supplies the forwarded client address. Unknown/local requests share a safe bucket.
  const forwarded = (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    ""
  )
    .split(",")[0]
    .trim();
  const address = isIP(forwarded) ? forwarded : "unknown";
  try {
    const result = await options.submit(input.token, input, address);
    if (result === "unavailable")
      return feedbackResponse(404, "This handoff is unavailable.");
    if (result === "rate_limited")
      return feedbackResponse(
        429,
        "Please wait before submitting feedback again.",
      );
    if (result === "duplicate")
      return feedbackResponse(
        409,
        "Feedback has already been received for this handoff.",
      );
    return feedbackResponse(200, "Thank you. Your feedback has been received.");
  } catch (error) {
    return error instanceof HandoffError && error.code === "validation"
      ? feedbackResponse(400, error.message)
      : feedbackResponse(
          503,
          "Feedback is temporarily unavailable. Please try again later.",
        );
  }
}
