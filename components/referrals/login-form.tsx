"use client";

import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

export function LoginForm() {
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
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const result = (await response.json()) as {
      error?: string;
      mustChangePassword?: boolean;
    };
    setSending(false);
    if (!response.ok) return setError(result.error ?? "Unable to log in.");
    window.location.assign(
      result.mustChangePassword ? "/partner/change-password" : "/partner",
    );
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Referral Partners</p>
      <h1 className="mt-3 text-4xl font-semibold text-[var(--foreground)]">Partner Login</h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Sign in with the email and password for your approved Partner account.
      </p>
      <label className="mt-7 block text-sm font-medium text-[var(--foreground)]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </label>
      <label className="mt-5 block text-sm font-medium text-[var(--foreground)]">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </label>
      <a
        href="/partner/forgot-password"
        className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--foreground)]"
      >
        Forgot Password?
      </a>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        disabled={sending}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {sending ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
