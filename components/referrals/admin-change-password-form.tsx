"use client";

import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

export function AdminChangePasswordForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: form.get("password"),
        confirmation: form.get("confirmation"),
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setSubmitting(false);
      setError(result.error ?? "Unable to update the password.");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Administrator Security</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Change Your Password
      </h1>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        For security, create your permanent Steady Start administrator password
        before continuing.
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
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        disabled={submitting}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {submitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
