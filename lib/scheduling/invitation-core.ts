import { createHmac, timingSafeEqual } from "node:crypto";
import { contactSender } from "@/lib/contact/provider";
import {
  consultationInvitationSubject,
  consultationInvitationText,
  type ConsultationInvitationResult,
} from "./invitation-shared";

export class InvitationValidationError extends Error {}
export function invitationRecipient(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > 254 ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /\s/.test(value.trim())
  )
    throw new InvitationValidationError(
      "Enter a valid intended recipient email address.",
    );
  const email = value.trim().toLowerCase();
  const [local, domain, extra] = email.split("@");
  if (
    !local ||
    local.length > 64 ||
    extra !== undefined ||
    !domain ||
    !/^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(
      local,
    ) ||
    domain.split(".").length < 2 ||
    domain
      .split(".")
      .some(
        (label) => !/^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i.test(label),
      ) ||
    !/^(?:[A-Z]{2,63}|XN--[A-Z0-9-]{2,59})$/i.test(
      domain.split(".").at(-1) ?? "",
    )
  )
    throw new InvitationValidationError(
      "Enter a valid intended recipient email address.",
    );
  return email;
}

type ProviderOutcome =
  | { status: "accepted"; id: string }
  | { status: "rejected" | "indeterminate" | "setup" };
type PreviewPayload = {
  actor: string;
  recipient: string;
  url: string;
  expires: number;
};
const signed = (key: string, value: string) =>
  createHmac("sha256", key).update(value).digest("base64url");
export function createInvitationService(options: {
  apiKey: () => string | undefined;
  sender: () => string | undefined;
  bookingUrl: string;
  fetch?: typeof fetch;
  now?: () => number;
}) {
  const now = options.now ?? Date.now;
  const attempts = new Map<
    string,
    {
      status: "pending" | "accepted" | "rejected" | "indeterminate";
      expires: number;
      nextTry: number;
      count: number;
      providerId?: string;
    }
  >();
  const actors = new Map<string, { expires: number; count: number }>();
  const configuration = () => {
    const key = options.apiKey();
    const sender = contactSender(options.sender());
    return key && key.length <= 512 && !/\s/.test(key) && sender
      ? { key, sender }
      : null;
  };
  const result = (
    status: ConsultationInvitationResult["status"],
    message: string,
    extra: Partial<ConsultationInvitationResult> = {},
  ): ConsultationInvitationResult => ({
    ok: ["preview", "accepted", "duplicate"].includes(status),
    status,
    message,
    checkedAt: new Date(now()).toISOString(),
    ...extra,
  });
  const setup = () =>
    result(
      "setup",
      "Consultation email setup required. Check the existing general RESEND_API_KEY and a verified Steady Start consultation/general sender. Nothing was sent. Copy Consultation Link remains available.",
    );
  async function sendProvider(
    recipient: string,
    key: string,
    sender: string,
    idempotencyKey: string,
  ): Promise<ProviderOutcome> {
    try {
      const response = await (options.fetch ?? fetch)(
        "https://api.resend.com/emails",
        {
          method: "POST",
          redirect: "error",
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            from: sender,
            to: [recipient],
            reply_to: "support@steadystartco.com",
            subject: consultationInvitationSubject,
            text: consultationInvitationText(options.bookingUrl),
          }),
        },
      );
      if ([400, 401, 403, 422, 429].includes(response.status))
        return { status: "rejected" };
      if (!response.ok) return { status: "indeterminate" };
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === "object" &&
        "id" in body &&
        typeof body.id === "string" &&
        /^[A-Za-z0-9_-]{8,100}$/.test(body.id)
      )
        return { status: "accepted", id: body.id };
      return { status: "indeterminate" };
    } catch {
      return { status: "indeterminate" };
    }
  }
  return async (
    actor: string,
    input: Record<string, unknown>,
  ): Promise<ConsultationInvitationResult> => {
    if (!actor)
      return result(
        "unauthorized",
        "Administrator authorization is required. Nothing was sent.",
      );
    const recipient = invitationRecipient(input.recipient);
    const config = configuration();
    if (!config) return setup();
    const time = now();
    if (input.action === "preview") {
      const payload = Buffer.from(
        JSON.stringify({
          actor,
          recipient,
          url: options.bookingUrl,
          expires: time + 15 * 60_000,
        } satisfies PreviewPayload),
      ).toString("base64url");
      return result(
        "preview",
        "Review the recipient and message, then explicitly confirm Send Consultation Link. Previewing has not sent an email. Sender verification is checked by the provider only when sending.",
        {
          recipient,
          confirmationToken:
            payload +
            "." +
            signed(config.key, "consultation-preview-v1:" + payload),
        },
      );
    }
    if (
      input.action !== "send" ||
      input.confirmed !== true ||
      typeof input.confirmationToken !== "string" ||
      input.confirmationToken.length > 2048
    )
      throw new InvitationValidationError(
        "Preview and confirm the intended recipient before sending.",
      );
    const [payload, signature, extra] = input.confirmationToken.split(".");
    const expected = signed(config.key, "consultation-preview-v1:" + payload);
    if (
      !signature ||
      extra ||
      !/^[A-Za-z0-9_-]{43}$/.test(signature) ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      throw new InvitationValidationError(
        "This preview is invalid. Review the recipient again.",
      );
    let preview: PreviewPayload;
    try {
      preview = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
      throw new InvitationValidationError("Review a fresh invitation preview.");
    }
    if (
      !preview ||
      preview.actor !== actor ||
      preview.recipient !== recipient ||
      preview.url !== options.bookingUrl ||
      !Number.isSafeInteger(preview.expires) ||
      preview.expires <= time ||
      preview.expires > time + 15 * 60_000
    )
      throw new InvitationValidationError(
        "The recipient or preview changed or expired. Review a fresh invitation preview.",
      );
    for (const [key, value] of attempts)
      if (value.expires <= time) attempts.delete(key);
    for (const [key, value] of actors)
      if (value.expires <= time) actors.delete(key);
    // Stable across previews, retries and instances; payload never includes a timestamp.
    const contentKey = signed(
      config.key,
      "consultation-invitation-v1:" +
        config.sender +
        ":" +
        recipient +
        ":" +
        options.bookingUrl,
    );
    const prior = attempts.get(contentKey);
    if (prior?.status === "accepted")
      return result(
        "duplicate",
        "Resend already accepted this invitation. No duplicate was sent. Inbox delivery is not confirmed.",
        { providerId: prior.providerId },
      );
    if (prior?.status === "pending")
      return result(
        "pending",
        "An invitation is already being sent. No duplicate was sent.",
      );
    if (prior?.status === "indeterminate")
      return result(
        "indeterminate",
        "The previous provider outcome is unknown. Automatic retry is blocked to avoid duplicates. Check Resend history before sending again.",
      );
    const actorKey = signed(config.key, "consultation-actor:" + actor);
    const bucket = actors.get(actorKey) ?? {
      expires: time + 60 * 60_000,
      count: 0,
    };
    if (
      bucket.count >= 10 ||
      (prior && (prior.nextTry > time || prior.count >= 3)) ||
      (!prior && attempts.size >= 1000) ||
      (!actors.has(actorKey) && actors.size >= 1000)
    )
      return result(
        "limited",
        "Please wait before retrying this invitation. Copy Consultation Link remains available.",
      );
    bucket.count++;
    actors.set(actorKey, bucket);
    const attempt = {
      status: "pending" as
        "pending" | "accepted" | "rejected" | "indeterminate",
      expires: time + 23 * 60 * 60_000,
      nextTry: time + 60_000,
      count: (prior?.count ?? 0) + 1,
      providerId: undefined as string | undefined,
    };
    attempts.set(contentKey, attempt);
    const outcome = await sendProvider(
      recipient,
      config.key,
      config.sender,
      "steady-start/consultation-invite/" + contentKey,
    );
    if (outcome.status === "accepted") {
      attempt.status = "accepted";
      attempt.providerId = outcome.id;
      return result(
        "accepted",
        "Resend accepted the consultation invitation. This does not confirm inbox delivery.",
        { providerId: outcome.id },
      );
    }
    if (outcome.status === "rejected" || outcome.status === "setup") {
      attempt.status = "rejected";
      return result(
        "rejected",
        "The email provider rejected the invitation. Verify the existing general Resend key, permissions and Steady Start sender/domain before retrying. Nothing was accepted. Copy Consultation Link remains available.",
      );
    }
    attempt.status = "indeterminate";
    return result(
      "indeterminate",
      "The email provider outcome is unknown. Do not resend automatically; check Resend history first. Inbox delivery has not been confirmed.",
    );
  };
}
