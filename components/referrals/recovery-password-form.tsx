"use client";
import { useEffect, useState, type FormEvent } from "react";
import { primaryButtonClass } from "@/lib/styles";
import type { RecoveryPortal } from "@/lib/partner-auth/recovery-core";

export function RecoveryPasswordForm({ portal }: { portal: RecoveryPortal }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(`/api/auth/recovery/session?portal=${portal}`, { cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error(); if (active) setReady(true); })
      .catch(() => { if (active) setError("This recovery link is invalid, expired, or already used. Request a new link."); });
    return () => { active = false; };
  }, [portal]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmation")) { setError("Passwords do not match."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/${portal}/auth/update-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password"), confirmation: form.get("confirmation") }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Request a new recovery link and try again."); if (response.status === 401) setReady(false); }
      else { setComplete(true); setReady(false); }
    } catch { setError("Recovery could not be confirmed. Request a new recovery link before retrying."); setReady(false); }
    finally { setBusy(false); }
  }
  return <div className="glass-card mx-auto max-w-lg p-7 sm:p-10">
    <p className="section-kicker">{portal === "admin" ? "Administrator" : "Referral Partners"}</p>
    <h1 className="mt-3 text-3xl font-semibold">{complete ? "Password Updated" : "Choose a New Password"}</h1>
    {complete ? <div role="status"><p className="mt-4">Your password was updated. The recovery session is complete. Sign in with your new password.</p><a href={`/${portal}/login`} className={`${primaryButtonClass} mt-6`}>Return to Sign In</a></div> : <form onSubmit={submit}>
      <p className="mt-4 text-sm">Use 12–256 characters. A verified, one-time recovery link is required.</p>
      <label className="mt-6 block text-sm font-medium">New Password<input name="password" type="password" required minLength={12} maxLength={256} autoComplete="new-password" disabled={!ready || busy} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
      <label className="mt-4 block text-sm font-medium">Confirm New Password<input name="confirmation" type="password" required minLength={12} maxLength={256} autoComplete="new-password" disabled={!ready || busy} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
      {error && <p role="alert" className="mt-4 text-sm">{error} <a href={`/${portal}/forgot-password`} className="underline">Request a new link</a></p>}
      <button disabled={!ready || busy} className={`${primaryButtonClass} mt-6 w-full disabled:opacity-50`}>{busy ? "Updating…" : ready ? "Set New Password" : error ? "Recovery Link Unavailable" : "Verifying Recovery Link…"}</button>
    </form>}
  </div>;
}
