"use client";
import Link from "next/link";
import { useState } from "react";
import { operationalWorkspaces } from "@/lib/admin-management/core";

export function AdministratorInvitationAccept() {
  const [busy, setBusy] = useState(false),
    [complete, setComplete] = useState(false),
    [message, setMessage] = useState("");
  async function accept(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || complete) return;
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/auth/admin-invite/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accept: data.get("accept") === "yes",
          password: data.get("password"),
          confirmation: data.get("confirmation"),
        }),
      });
      const result = await response.json();
      setComplete(response.ok);
      setMessage(
        result.message ??
          result.error ??
          "Acceptance could not be confirmed. Contact the owner.",
      );
    } catch {
      setMessage(
        "Acceptance could not be confirmed. Contact the owner before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <p>
        You are accepting the Admin role for {operationalWorkspaces.join(", ")}.
        This role cannot manage administrators or protected security settings.
      </p>
      {!complete && (
        <form onSubmit={accept} className="space-y-4">
          <label className="block text-sm font-medium">
            Create your own password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Confirm password
            <input
              type="password"
              name="confirmation"
              autoComplete="new-password"
              minLength={12}
              maxLength={256}
              required
              className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
            />
          </label>
          <p className="text-sm">
            Use at least 12 characters. Never share your password or invitation
            link.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              name="accept"
              value="yes"
              className="mt-1"
            />
            I accept this invitation and the listed Admin access.
          </label>
          <button
            disabled={busy}
            className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Accepting…" : "Accept administrator invitation"}
          </button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
      {complete && (
        <Link
          href="/admin/login"
          className="inline-flex min-h-11 items-center underline underline-offset-4"
        >
          Sign in with your new password
        </Link>
      )}
    </div>
  );
}
