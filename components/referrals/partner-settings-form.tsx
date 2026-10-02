"use client";

import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]";

export function PartnerSettingsForm({
  partner,
}: {
  partner: Record<string, string | null>;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/partner/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget)),
      ),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok)
      return setError(result.error ?? "Unable to save settings.");
    setMessage("Settings saved.");
  }
  return (
    <form onSubmit={submit} className="glass-card mt-8 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-white">
          First Name
          <input
            name="firstName"
            required
            defaultValue={partner.first_name ?? ""}
            className={field}
          />
        </label>
        <label className="text-sm text-white">
          Last Name
          <input
            name="lastName"
            required
            defaultValue={partner.last_name ?? ""}
            className={field}
          />
        </label>
        <label className="text-sm text-white">
          Phone
          <input
            name="phone"
            required
            defaultValue={partner.phone ?? ""}
            className={field}
          />
        </label>
        <label className="text-sm text-white">
          Email
          <input
            disabled
            value={partner.email ?? ""}
            className={`${field} opacity-60`}
          />
        </label>
        <label className="text-sm text-white sm:col-span-2">
          Mailing Address (optional)
          <textarea
            name="mailingAddress"
            defaultValue={partner.mailing_address ?? ""}
            className={`${field} min-h-24`}
          />
        </label>
        <label className="text-sm text-white">
          Preferred Payout Method
          <select
            name="payoutMethod"
            defaultValue={partner.payout_method ?? ""}
            className={field}
          >
            <option value="">Not selected</option>
            <option value="paypal">PayPal</option>
            <option value="zelle">Zelle</option>
            <option value="check">Check</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="text-sm text-white">
          Payout Information
          <input
            name="payoutDetails"
            className={field}
            placeholder={
              partner.payout_details_encrypted
                ? "Saved — enter a value only to replace"
                : "Email, name, or mailing detail"
            }
          />
          <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
            Stored encrypted. Never enter a bank password or login credential.
          </span>
        </label>
      </div>
      {message ? (
        <p className="mt-5 text-sm text-green-200">{message}</p>
      ) : null}
      {error ? <p className="mt-5 text-sm text-red-200">{error}</p> : null}
      <button
        disabled={saving}
        className={`${primaryButtonClass} force-white-btn mt-6 disabled:opacity-50`}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
