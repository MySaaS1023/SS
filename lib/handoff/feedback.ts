import { createHmac } from "node:crypto";
import { HandoffError, hashToken, tokenKey, validToken } from "./core";

export type FeedbackOutcome =
  "accepted" | "duplicate" | "unavailable" | "rate_limited";
export function validateFeedback(input: unknown) {
  if (!input || typeof input !== "object")
    throw new HandoffError("validation", "Choose a rating from 1 to 5.");
  const value = input as Record<string, unknown>;
  if (
    !Number.isInteger(value.rating) ||
    Number(value.rating) < 1 ||
    Number(value.rating) > 5
  )
    throw new HandoffError("validation", "Choose a rating from 1 to 5.");
  if (value.comment != null && typeof value.comment !== "string")
    throw new HandoffError("validation", "Enter a plain text comment.");
  const comment =
    typeof value.comment === "string"
      ? value.comment
          .replace(/\r\n?/g, "\n")
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
          .trim()
      : "";
  if (comment.length > 1000)
    throw new HandoffError(
      "validation",
      "Please keep your comment to 1000 characters or fewer.",
    );
  return {
    rating: Number(value.rating),
    comment: comment || null,
    honeypot: value.website !== undefined && value.website !== "",
  };
}
export function feedbackRateKey(address: string, key: string | undefined) {
  return createHmac("sha256", tokenKey(key))
    .update("handoff-feedback-rate-v1\n" + address.slice(0, 128))
    .digest("hex");
}
export async function submitFeedback(input: {
  token: string;
  details: unknown;
  address: string;
  key?: string;
  consume: (hash: string) => Promise<boolean>;
  save: (
    hash: string,
    rating: number,
    comment: string | null,
  ) => Promise<FeedbackOutcome>;
}): Promise<FeedbackOutcome> {
  if (!validToken(input.token)) return "unavailable";
  const value = validateFeedback(input.details);
  if (value.honeypot) return "accepted";
  if (!(await input.consume(feedbackRateKey(input.address, input.key))))
    return "rate_limited";
  return input.save(hashToken(input.token), value.rating, value.comment);
}
