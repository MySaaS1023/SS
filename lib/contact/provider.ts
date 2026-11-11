import { createHmac } from "node:crypto";
import { supportEmail } from "@/lib/site-data";
import {
  contactContent,
  type ContactInput,
  type ContactProviderOutcome,
} from "./core";
import { contactProjectTypes } from "./shared";

export function contactSender(value: string | undefined) {
  const sender = value?.trim();
  if (!sender || sender.length > 320 || /[\r\n]/.test(sender)) return null;
  const email = sender.includes("<")
    ? sender.match(/^[^<>]+<([^<>]+)>$/)?.[1]
    : sender;
  return email && /^[^\s@<>]+@steadystartco\.com$/i.test(email) ? sender : null;
}

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );

export function contactMessage(input: ContactInput) {
  const project = contactProjectTypes.find(
    ({ value }) => value === input.projectType,
  )!.label;
  return {
    subject: `Steady Start Contact — ${project}`,
    text: `New Steady Start contact message\n\nFull name: ${input.fullName}\nEmail: ${input.email}\nProject type: ${project}\n\nMessage:\n${input.message}`,
    html: `<div style="font-family:Arial,sans-serif;color:#071c3d;line-height:1.6"><h1>New Steady Start contact message</h1><p><strong>Full name:</strong> ${escape(input.fullName)}<br><strong>Email:</strong> ${escape(input.email)}<br><strong>Project type:</strong> ${escape(project)}</p><p style="white-space:pre-wrap">${escape(input.message)}</p></div>`,
  };
}

export function createContactProvider(options: {
  apiKey: string | undefined;
  sender: string | undefined;
  fetch?: typeof fetch;
}) {
  return async (input: ContactInput): Promise<ContactProviderOutcome> => {
    const sender = contactSender(options.sender);
    const key = options.apiKey;
    if (!key || key.length > 512 || /\s/.test(key) || !sender)
      return { status: "unavailable" };
    const message = contactMessage(input);
    // Stable across instances and retries. The provider retains idempotency keys
    // for its documented retention window; no timestamps or random IDs change the body.
    const idempotencyKey = `steady-start/contact/${createHmac("sha256", key)
      .update("contact-v1\n" + sender + "\n" + contactContent(input))
      .digest("hex")}`;
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
            to: [supportEmail],
            reply_to: input.email,
            ...message,
          }),
        },
      );
      if ([400, 401, 403, 422].includes(response.status))
        return { status: "rejected" };
      if (!response.ok) return { status: "indeterminate" };
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === "object" &&
        "id" in body &&
        typeof body.id === "string" &&
        /^[a-zA-Z0-9_-]{8,100}$/.test(body.id)
      )
        return { status: "accepted", id: body.id };
      return { status: "indeterminate" };
    } catch {
      // Never return or log raw provider bodies, headers, key values or exceptions.
      return { status: "indeterminate" };
    }
  };
}
