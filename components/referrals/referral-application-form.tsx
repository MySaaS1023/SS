"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]";

export function ReferralApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const response = await fetch("/api/referral-partners/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to submit your application.");
      setStatus("idle");
      return;
    }
    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    return (
      <div className="glass-card mx-auto max-w-3xl p-8 text-center sm:p-12">
        <p className="section-kicker">Application Received</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Thank you for applying
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--muted)]">
          Thank you for applying to become a Steady Start Referral Partner.
          We&apos;ll review your application and contact you at the email
          address provided.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="glass-card mx-auto max-w-4xl p-6 sm:p-10"
    >
      <p className="section-kicker">Become a Referral Partner</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Referral Partner application
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Applications are reviewed before portal access is granted.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[
          ["firstName", "First Name"],
          ["lastName", "Last Name"],
          ["email", "Email"],
          ["phone", "Phone Number"],
          ["city", "City"],
          ["state", "State"],
        ].map(([name, label]) => (
          <label key={name} className="text-sm font-medium text-white">
            {label} *
            <input
              className={fieldClass}
              type={
                name === "email" ? "email" : name === "phone" ? "tel" : "text"
              }
              name={name}
              required
              maxLength={name === "state" ? 40 : 120}
            />
          </label>
        ))}
        <label className="text-sm font-medium text-white sm:col-span-2">
          How did you hear about Steady Start? *
          <input
            className={fieldClass}
            name="heardAbout"
            required
            maxLength={240}
          />
        </label>
        <label className="text-sm font-medium text-white sm:col-span-2">
          Why would you like to become a Referral Partner? *
          <textarea
            className={`${fieldClass} min-h-28`}
            name="motivation"
            required
            maxLength={2000}
          />
        </label>
        <label className="text-sm font-medium text-white sm:col-span-2">
          How do you plan to find or refer potential customers? *
          <textarea
            className={`${fieldClass} min-h-28`}
            name="referralPlan"
            required
            maxLength={2000}
          />
        </label>
        <label className="text-sm font-medium text-white">
          Website (optional)
          <input
            className={fieldClass}
            name="website"
            type="url"
            maxLength={500}
          />
        </label>
        <label className="text-sm font-medium text-white">
          Social media profile (optional)
          <input className={fieldClass} name="socialProfile" maxLength={500} />
        </label>
      </div>
      <div className="mt-7 space-y-3">
        <label className="flex gap-3 text-sm leading-6 text-white">
          <input
            type="checkbox"
            name="accurate"
            value="yes"
            required
            className="mt-1 accent-[#3b82f6]"
          />
          I confirm that the information provided is accurate.
        </label>
        <label className="flex gap-3 text-sm leading-6 text-white">
          <input
            type="checkbox"
            name="terms"
            value="yes"
            required
            className="mt-1 accent-[#3b82f6]"
          />
          <span>
            I agree to the{" "}
            <Link
              className="text-[#93c5fd] underline"
              href="/referral-partners/terms"
              target="_blank"
            >
              Steady Start Referral Partner Terms
            </Link>
            .
          </span>
        </label>
        <label className="flex gap-3 text-sm leading-6 text-white">
          <input
            type="checkbox"
            name="notGuaranteed"
            value="yes"
            required
            className="mt-1 accent-[#3b82f6]"
          />
          I understand that submitting an application does not guarantee
          acceptance into the program.
        </label>
      </div>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        disabled={status === "sending"}
        className={`${primaryButtonClass} force-white-btn mt-7 w-full disabled:opacity-50 sm:w-auto`}
      >
        {status === "sending" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
