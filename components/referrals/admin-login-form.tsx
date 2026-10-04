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
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setSubmitting(false);
      setError(result.error ?? "Unable to log in.");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={submit} className="glass-card mx-auto max-w-lg p-7 sm:p-10">
      <p className="section-kicker">Administrator</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Admin Login</h1>
      <label className="mt-7 block text-sm font-medium text-white">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#3b82f6]"
        />
      </label>
      <label className="mt-5 block text-sm font-medium text-white">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {submitting ? "Logging In..." : "Log In"}
      </button>
      <p className="mt-5 text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-[#93c5fd] hover:text-white"
        >
          Forgot Password?
        </Link>
      </p>
    </form>
  );
}
