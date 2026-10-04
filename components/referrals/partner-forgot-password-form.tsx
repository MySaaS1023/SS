"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

export function PartnerForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    await fetch("/api/partner/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    setSubmitting(false);
    setMessage(
      "If this address belongs to an approved Partner, a secure password-reset email has been requested.",
    );
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Referral Partners</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Reset Password</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Enter your approved Partner email to request a secure password-reset
        link.
      </p>
      <label className="mt-7 block text-sm font-medium text-white">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#3b82f6]"
        />
      </label>
      {message ? (
        <p className="mt-5 rounded-xl border border-green-400/30 bg-green-500/10 p-3 text-sm text-green-200">
          {message}
        </p>
      ) : null}
      <button
        disabled={submitting}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {submitting ? "Sending..." : "Send Reset Link"}
      </button>
      <p className="mt-5 text-center text-sm">
        <Link href="/partner/login" className="text-[#93c5fd] hover:text-white">
          Back to Partner Login
        </Link>
      </p>
    </form>
  );
}
