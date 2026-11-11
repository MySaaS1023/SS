import { createHash } from "node:crypto";
import {
  contactLimits,
  contactProjectTypes,
  type ContactResult,
} from "./shared";

export type ContactInput = {
  fullName: string;
  email: string;
  projectType: string;
  message: string;
};

export class ContactValidationError extends Error {}

export function validateContact(input: unknown): ContactInput {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new ContactValidationError("Please complete the contact form.");
  const body = input as Record<string, unknown>;
  const text = (key: string) =>
    typeof body[key] === "string" ? body[key].normalize("NFC").trim() : "";
  const fullName = text("fullName");
  const email = text("email").toLowerCase();
  const projectType = text("projectType");
  const message = text("message");
  const emailParts = email.split("@");
  const localPart = emailParts[0];
  const domainLabels = emailParts[1]?.split(".") ?? [];
  if (
    fullName.length < 2 ||
    fullName.length > contactLimits.fullName ||
    /[\u0000-\u001f\u007f]/.test(fullName)
  )
    throw new ContactValidationError(
      "Enter your full name (2–100 characters).",
    );
  if (
    email.length > contactLimits.email ||
    emailParts.length !== 2 ||
    localPart.length > 64 ||
    !/^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(
      localPart,
    ) ||
    domainLabels.length < 2 ||
    domainLabels.some(
      (label) => !/^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i.test(label),
    ) ||
    !/^(?:[A-Z]{2,63}|XN--[A-Z0-9-]{2,59})$/i.test(domainLabels.at(-1) ?? "")
  )
    throw new ContactValidationError("Enter a valid email address.");
  if (!contactProjectTypes.some(({ value }) => value === projectType))
    throw new ContactValidationError("Choose a project type.");
  if (
    message.length < 10 ||
    message.length > contactLimits.message ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)
  )
    throw new ContactValidationError(
      "Enter a message between 10 and 4,000 characters.",
    );
  return { fullName, email, projectType, message };
}

export function contactContent(input: ContactInput) {
  return JSON.stringify([
    input.fullName,
    input.email,
    input.projectType,
    input.message,
  ]);
}

export type ContactProviderOutcome =
  | { status: "accepted"; id: string }
  | { status: "unavailable" | "rejected" | "indeterminate" };

type Attempt = {
  expires: number;
  status: "pending" | "accepted" | "indeterminate" | "failed";
  attempts: number;
  nextTry: number;
};

const accepted: ContactResult = {
  ok: true,
  status: "accepted",
  message:
    "Thank you. Our email provider accepted your message for Steady Start. Inbox delivery has not been independently confirmed.",
};
const duplicate: ContactResult = {
  ok: true,
  status: "duplicate",
  message:
    "Our email provider already accepted this message. No additional message was sent. Inbox delivery has not been independently confirmed.",
};
const uncertain: ContactResult = {
  ok: false,
  status: "indeterminate",
  message:
    "We could not confirm whether the email provider accepted your message. Automatic retry is blocked to avoid duplicates. Please email support@steadystartco.com directly if you need help.",
};

// Best-effort limits are deliberately isolated to Contact. No customer payloads,
// raw addresses or credentials are retained. Serverless instances do not share
// this memory; Resend's deterministic idempotency key protects cross-instance retries.
export function createContactDispatcher(options: {
  send: (input: ContactInput) => Promise<ContactProviderOutcome>;
  now?: () => number;
  capacity?: number;
}) {
  const now = options.now ?? Date.now;
  const capacity = options.capacity ?? 2000;
  const attempts = new Map<string, Attempt>();
  const addresses = new Map<string, { expires: number; count: number }>();
  let globalWindow = { expires: 0, count: 0 };
  const digest = (value: string) =>
    createHash("sha256").update(value).digest("hex");
  return async function dispatch(
    input: unknown,
    address: string,
  ): Promise<ContactResult> {
    const contact = validateContact(input);
    const time = now();
    for (const [key, entry] of attempts)
      if (entry.expires <= time) attempts.delete(key);
    for (const [key, entry] of addresses)
      if (entry.expires <= time) addresses.delete(key);
    const key = digest(contactContent(contact));
    const prior = attempts.get(key);
    if (prior?.status === "accepted") return duplicate;
    if (prior?.status === "indeterminate") return uncertain;
    if (prior?.status === "pending")
      return {
        ok: false,
        status: "pending",
        message:
          "Your message is being checked. Please wait; no duplicate was sent.",
      };
    const limited = (): ContactResult => ({
      ok: false,
      status: "rate_limited",
      message:
        "Please wait before sending another message, or email support@steadystartco.com directly.",
    });
    if (prior && (prior.nextTry > time || prior.attempts >= 2))
      return limited();
    if (globalWindow.expires <= time)
      globalWindow = { expires: time + 10 * 60_000, count: 0 };
    const addressKey = digest(address);
    const bucket = addresses.get(addressKey) ?? {
      expires: time + 60 * 60_000,
      count: 0,
    };
    if (
      bucket.count >= 3 ||
      globalWindow.count >= 30 ||
      (!prior && attempts.size >= capacity) ||
      (!addresses.has(addressKey) && addresses.size >= capacity)
    )
      return limited();
    bucket.count++;
    globalWindow.count++;
    addresses.set(addressKey, bucket);
    const attempt: Attempt = {
      expires: time + 23 * 60 * 60_000,
      status: "pending",
      attempts: (prior?.attempts ?? 0) + 1,
      nextTry: time + 60_000,
    };
    attempts.set(key, attempt);
    let result: ContactProviderOutcome;
    try {
      result = await options.send(contact);
    } catch {
      result = { status: "indeterminate" };
    }
    if (
      result.status === "accepted" &&
      typeof result.id === "string" &&
      result.id.trim()
    ) {
      attempt.status = "accepted";
      return accepted;
    }
    if (result.status === "unavailable" || result.status === "rejected") {
      attempt.status = "failed";
      return {
        ok: false,
        status: result.status,
        message:
          "Your message was not accepted by our email service. Please email support@steadystartco.com directly or request a consultation.",
      };
    }
    attempt.status = "indeterminate";
    return uncertain;
  };
}
