"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/login", {
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
    if (!response.ok) {
      setSubmitting(false);
      setError(result.error ?? "Unable to log in.");
      return;
    }
    window.location.assign(
      result.mustChangePassword ? "/admin/change-password" : "/admin",
    );
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Administrator</p>
      <h1 className="mt-3 text-4xl font-semibold text-[var(--foreground)]">Admin Login</h1>
      <label className="mt-7 block text-sm font-medium text-[var(--foreground)]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
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
      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        disabled={submitting}
        className={`${primaryButtonClass} force-white-btn mt-6 w-full disabled:opacity-50`}
      >
        {submitting ? "Logging In..." : "Log In"}
      </button>
      <p className="mt-5 text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-[var(--primary)] hover:text-[var(--foreground)]"
        >
          Forgot Password?
        </Link>
      </p>
    </form>
  );
}
