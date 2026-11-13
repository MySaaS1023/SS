"use client";

import { useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]";

export function CustomerIntakeForm({ partnerName }: { partnerName: string }) {
  const [startedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/referral-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          businessName: formData.get("businessName"),
          consent: formData.get("consent") === "yes",
          companyWebsite: formData.get("companyWebsite"),
          startedAt,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !result.success) {
        setError(
          result.error ??
            "We couldn't save your information. Please try again in a moment.",
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setError(
        "We couldn't save your information. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted)
    return (
      <div className="glass-card p-7 sm:p-9" role="status">
        <p className="section-kicker">Information Received</p>
        <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Welcome to Steady Start
        </h2>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Your information was saved successfully. Check your email for a secure
          link to explore Steady Start services and continue your request.
        </p>
      </div>
    );

  return (
    <form
      className="glass-card p-6 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <p className="section-kicker">Customer Information</p>
      <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
        Let&apos;s get your business started
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Share your contact details below. Steady Start will send you a secure
        link where you can explore services and complete your request.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Full name
          <input
            name="fullName"
            autoComplete="name"
            required
            maxLength={240}
            className={inputClassName}
          />
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={inputClassName}
          />
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={60}
            className={inputClassName}
          />
        </label>
        <label className="text-sm font-medium text-[var(--foreground)]">
          Business name
          <input
            name="businessName"
            autoComplete="organization"
            required
            maxLength={160}
            className={inputClassName}
          />
        </label>
      </div>

      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label>
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-6 flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--foreground)]">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
        />
        <span>
          I agree that Steady Start may email me information about the services
          I requested through {partnerName}.
        </span>
      </label>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:pointer-events-none disabled:opacity-60 sm:w-auto`}
      >
        {isSubmitting ? "Submitting..." : "Continue with Steady Start"}
      </button>
    </form>
  );
}
