"use client";

import { FormEvent, useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { primaryButtonClass } from "@/lib/styles";

export function PartnerResetPasswordForm() {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        const supabase = createBrowserSupabaseClient();
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          window.history.replaceState({}, "", "/partner/reset-password");
        }
        const response = await fetch("/api/partner/auth/session", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("invalid recovery session");
        if (active) setReady(true);
      } catch {
        window.location.assign("/partner/login?error=invalid-recovery-session");
      }
    }
    void prepare();
    return () => {
      active = false;
    };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password !== confirmation) {
      setSubmitting(false);
      setError("Passwords do not match.");
      return;
    }
    const response = await fetch("/api/partner/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmation }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setSubmitting(false);
      setError(result.error ?? "Unable to update the password.");
      return;
    }
    window.location.assign("/partner");
  }
  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Referral Partners</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Choose a New Password
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Use at least 12 characters.
      </p>
      <label className="mt-7 block text-sm font-medium text-white">
        New Password
        <input
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#3b82f6]"
        />
      </label>
      <label className="mt-5 block text-sm font-medium text-white">
        Confirm New Password
        <input
          name="confirmation"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#3b82f6]"
        />
      </label>
      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}
      <button
        disabled={submitting || !ready}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {!ready
          ? "Verifying secure link..."
          : submitting
            ? "Updating..."
            : "Update Password"}
      </button>
    </form>
  );
}
