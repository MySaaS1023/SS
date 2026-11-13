"use client";
import { useState, type FormEvent } from "react";
import { primaryButtonClass } from "@/lib/styles";
export function RepresentativeAccessForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/partner/auth/representative-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ representativeId: form.get("representativeId") }) });
      const result = await response.json();
      setMessage(result.message ?? "If eligible, a secure link will be sent to your verified contact method.");
    } catch { setMessage("The request could not be confirmed. You can still use your existing login below."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="glass-card mx-auto mb-6 max-w-lg p-7 sm:p-10">
    <p className="section-kicker">Referral Partners</p><h1 className="mt-3 text-3xl font-semibold">Sign In With Your Representative ID</h1>
    <p className="mt-4 text-sm">We&apos;ll send a one-time sign-in link to your verified contact method. Your representative ID alone cannot sign you in.</p>
    <label className="mt-6 block text-sm font-medium">Representative ID<input name="representativeId" required maxLength={9} pattern="[Ss][Ss]-[A-HJ-NP-Za-hj-np-z2-9]{6}" autoComplete="off" placeholder="SS-ABC234" className="mt-2 block w-full rounded-xl border border-[var(--line)] p-3 uppercase"/></label>
    <button disabled={busy} className={`${primaryButtonClass} mt-5 w-full disabled:opacity-50`}>{busy ? "Requesting…" : "Send Secure Sign-In Link"}</button>
    <p role="status" aria-live="polite" className="mt-4 text-sm">{message}</p>
    <p className="mt-4 text-sm">Lost access to your verified email? Contact support for identity verification. Contact changes cannot be made using a representative ID alone.</p>
  </form>;
}
