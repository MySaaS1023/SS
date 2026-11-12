import { InvitationValidationError } from "./invitation-core";
import type { ConsultationInvitationResult } from "./invitation-shared";

export async function handleInvitationRequest(
  request: Request,
  options: {
    origin: string;
    authorize: () => Promise<{ id: string } | null>;
    submit: (
      actor: string,
      input: Record<string, unknown>,
    ) => Promise<ConsultationInvitationResult>;
  },
) {
  const reply = (status: number, body: ConsultationInvitationResult) =>
    Response.json(body, {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
      },
    });
  const blocked = (status: number, message: string) =>
    reply(status, { ok: false, status: "validation", message });
  if (
    request.headers.get("origin") !== options.origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return blocked(
      403,
      "Submit from the Steady Start Admin Portal. Nothing was sent.",
    );
  try {
    const actor = await options.authorize();
    if (!actor)
      return reply(401, {
        ok: false,
        status: "unauthorized",
        message: "Administrator authorization is required. Nothing was sent.",
      });
    if (
      request.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() !== "application/json"
    )
      return blocked(415, "Submit invitation details as JSON.");
    if (Number(request.headers.get("content-length")) > 4096)
      return blocked(413, "Invitation request is too large.");
    const reader = request.body?.getReader();
    if (!reader) return blocked(400, "Enter the intended recipient.");
    let text = "",
      size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return blocked(413, "Invitation request is too large.");
      }
      text += decoder.decode(next.value, { stream: true });
    }
    text += decoder.decode();
    let input: unknown;
    try {
      input = JSON.parse(text);
    } catch {
      return blocked(400, "Enter valid invitation details.");
    }
    if (!input || typeof input !== "object" || Array.isArray(input))
      return blocked(400, "Enter valid invitation details.");
    const result = await options.submit(
      actor.id,
      input as Record<string, unknown>,
    );
    return reply(
      result.ok
        ? 200
        : result.status === "limited"
          ? 429
          : result.status === "pending"
            ? 409
            : 503,
      result,
    );
  } catch (error) {
    return error instanceof InvitationValidationError
      ? blocked(400, error.message)
      : reply(503, {
          ok: false,
          status: "setup",
          message:
            "Consultation email is temporarily unavailable. Nothing new was requested. Copy Consultation Link remains available.",
        });
  }
}
