"use client";

import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/partner/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), admin }),
    });
    const result = await response.json();
    setSending(false);
    if (!response.ok)
      return setError(result.error ?? "Unable to send a login link.");
    setMessage("Check your email for your secure login link.");
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">
        {admin ? "Administrator" : "Referral Partners"}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        {admin ? "Admin login" : "Partner Login"}
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Enter your approved account email. We&apos;ll send a secure,
        passwordless login link.
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
      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        disabled={sending}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {sending ? "Sending..." : "Email Me a Login Link"}
      </button>
    </form>
  );
}
