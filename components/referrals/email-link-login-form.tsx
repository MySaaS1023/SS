"use client";

import { useState, type FormEvent } from "react";
import { primaryButtonClass } from "@/lib/styles";
import type { Portal } from "@/lib/portal-auth/core";

export function EmailLinkLoginForm({ portal }: { portal: Portal }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/${portal}/auth/email-link`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) });
      const result = await response.json();
      setMessage(result.message ?? "If this email belongs to an eligible account, a secure sign-in link will be sent.");
    } catch { setMessage("The request could not be confirmed. Use your existing login below or try again later."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="glass-card mx-auto mb-6 max-w-lg p-7 sm:p-10">
    <p className="section-kicker">{portal === "admin" ? "Administrator" : "Referral Partners"}</p>
    <h1 className="mt-3 text-3xl font-semibold">Sign In With a Secure Email Link</h1>
    <p className="mt-4 text-sm">Enter your registered email. Open the one-time link in your inbox, then confirm sign-in. No new account is created.</p>
    <label className="mt-6 block text-sm font-medium">Email address<input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-2 block w-full rounded-xl border border-slate-300 p-3" /></label>
    <button disabled={busy} className={`${primaryButtonClass} mt-5 w-full disabled:opacity-50`}>{busy ? "Requesting…" : "Send Secure Sign-In Link"}</button>
    <p role="status" aria-live="polite" className="mt-4 text-sm">{message}</p>
    <p className="mt-4 text-sm">Lost access to your email? Contact support for identity verification.</p>
  </form>;
}
