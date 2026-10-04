"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { serviceOfferings } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

const field =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-[#3b82f6]";

export function NewReferralForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setSuccess("");
    const response = await fetch("/api/partner/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget)),
      ),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to submit referral.");
      setSending(false);
      return;
    }
    setSuccess(
      result.customerInviteStatus === "sent"
        ? "Referral Submitted ✓ Customer Invitation Sent ✓"
        : "Referral submitted successfully. Customer Invite: Delivery Failed. You can resend it from My Referrals.",
    );
    setSending(false);
    window.setTimeout(() => {
      router.push("/partner/referrals");
      router.refresh();
    }, 1800);
  }
  return (
    <form onSubmit={submit} className="glass-card mt-8 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ["customerFirstName", "Customer First Name"],
          ["customerLastName", "Customer Last Name"],
          ["businessName", "Business Name"],
          ["customerEmail", "Customer Email"],
          ["customerPhone", "Customer Phone"],
        ].map(([name, label]) => (
          <label key={name} className="text-sm font-medium text-white">
            {label} *
            <input
              name={name}
              required
              type={
                name === "customerEmail"
                  ? "email"
                  : name === "customerPhone"
                    ? "tel"
                    : "text"
              }
              maxLength={160}
              className={field}
            />
          </label>
        ))}
        <label className="text-sm font-medium text-white">
          Website (optional)
          <input name="website" type="url" maxLength={500} className={field} />
        </label>
        <label className="text-sm font-medium text-white sm:col-span-2">
          Service Interest *
          <select
            name="serviceInterest"
            required
            className={field}
            defaultValue=""
          >
            <option value="" disabled>
              Select a service
            </option>
            {serviceOfferings.map((service) => (
              <option key={service.key} value={service.key}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-white sm:col-span-2">
          Notes (optional)
          <textarea
            name="notes"
            maxLength={2000}
            className={`${field} min-h-28`}
          />
        </label>
      </div>
      <label className="mt-6 flex gap-3 text-sm leading-6 text-white">
        <input
          name="permissionConfirmed"
          value="yes"
          type="checkbox"
          required
          className="mt-1 accent-[#3b82f6]"
        />
        I confirm that this person/business has given me permission to share
        their contact information with Steady Start.
      </label>
      {error ? <p className="mt-5 text-sm text-red-200">{error}</p> : null}
      {success ? (
        <p className="mt-5 text-sm text-green-200">{success}</p>
      ) : null}
      <button
        disabled={sending}
        className={`${primaryButtonClass} force-white-btn mt-6 disabled:opacity-50`}
      >
        {sending ? "Submitting..." : "Submit Referral"}
      </button>
    </form>
  );
}
