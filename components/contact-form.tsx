"use client";

import React, { useId, useRef, useState } from "react";
import {
  contactLimits,
  contactProjectTypes,
  type ContactResult,
} from "@/lib/contact/shared";
import { primaryButtonClass } from "@/lib/styles";

export function ContactForm() {
  const id = useId();
  const sending = useRef(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const locked = result?.ok || result?.status === "indeterminate";
  const fieldClass =
    "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--brand-text-navy)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pacific-blue)]";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || locked) return;
    sending.current = true;
    const form = new FormData(event.currentTarget);
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        signal: AbortSignal.timeout(20_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          projectType: form.get("projectType"),
          message: form.get("message"),
          website: form.get("website") ?? "",
        }),
      });
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("message" in data) ||
        typeof data.message !== "string"
      )
        throw new Error("unconfirmed");
      const state = data as ContactResult;
      setResult({
        ok:
          response.ok &&
          state.ok === true &&
          ["accepted", "duplicate"].includes(state.status),
        status: state.status,
        message: state.message,
      });
    } catch {
      setResult({
        ok: false,
        status: "indeterminate",
        message:
          "We could not confirm whether your message was accepted. Please email support@steadystartco.com directly before trying again so we can avoid duplicate messages.",
      });
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  return (
    <div className="ocean-card contact-form-card mx-auto max-w-3xl p-6 sm:p-8">
      <h2
        id={`${id}-heading`}
        className="text-center text-2xl font-bold text-[var(--brand-text-navy)]"
      >
        Send Us a Message
      </h2>
      <p
        id={`${id}-help`}
        className="mt-3 text-center text-sm leading-6 text-[var(--brand-light-muted)]"
      >
        Tell us what you have in mind. All four fields are required.
      </p>
      <noscript>
        <p className="mt-4 text-sm leading-7 text-[var(--brand-text-navy)]">
          This form requires JavaScript. Please email{" "}
          <a className="underline" href="mailto:support@steadystartco.com">
            support@steadystartco.com
          </a>{" "}
          directly instead.
        </p>
      </noscript>
      <form
        method="post"
        action="/api/contact"
        onSubmit={submit}
        className="mt-6"
        aria-labelledby={`${id}-heading`}
        aria-describedby={`${id}-help`}
        aria-busy={pending}
      >
        <fieldset disabled={pending || !!locked} className="grid min-w-0 gap-5">
          <legend className="sr-only">Contact message details</legend>
          <label
            htmlFor={`${id}-name`}
            className="block text-sm font-semibold text-[var(--brand-text-navy)]"
          >
            Full name <span aria-hidden="true">*</span>
            <input
              id={`${id}-name`}
              name="fullName"
              autoComplete="name"
              required
              minLength={2}
              maxLength={contactLimits.fullName}
              className={fieldClass}
            />
          </label>
          <label
            htmlFor={`${id}-email`}
            className="block text-sm font-semibold text-[var(--brand-text-navy)]"
          >
            Email address <span aria-hidden="true">*</span>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={contactLimits.email}
              className={fieldClass}
            />
          </label>
          <label
            htmlFor={`${id}-project`}
            className="block text-sm font-semibold text-[var(--brand-text-navy)]"
          >
            Project type <span aria-hidden="true">*</span>
            <select
              id={`${id}-project`}
              name="projectType"
              defaultValue=""
              required
              className={fieldClass}
            >
              <option value="" disabled>
                Choose a project type
              </option>
              {contactProjectTypes.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label
            htmlFor={`${id}-message`}
            className="block text-sm font-semibold text-[var(--brand-text-navy)]"
          >
            Message <span aria-hidden="true">*</span>
            <textarea
              id={`${id}-message`}
              name="message"
              rows={5}
              required
              minLength={10}
              maxLength={contactLimits.message}
              aria-describedby={`${id}-limit`}
              className={fieldClass}
            />
          </label>
          <p
            id={`${id}-limit`}
            className="-mt-3 text-xs leading-6 text-[var(--brand-light-muted)]"
          >
            10–4,000 characters.
          </p>
          <div hidden aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending || !!locked}
            className={`${primaryButtonClass} min-h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {pending
              ? "Sending…"
              : result?.ok
                ? "Message accepted"
                : "Send Message"}
            {!pending && !result?.ok ? <span aria-hidden="true">→</span> : null}
          </button>
        </fieldset>
      </form>
      {result ? (
        <p
          role={result.ok ? "status" : "alert"}
          className={`mt-5 rounded-xl border p-4 text-sm leading-7 ${result.ok ? "border-emerald-700/30 bg-emerald-50 text-emerald-900" : "border-red-700/30 bg-red-50 text-red-900"}`}
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
