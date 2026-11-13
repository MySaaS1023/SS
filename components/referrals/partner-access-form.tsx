"use client";

import { useState, useTransition } from "react";

import { regeneratePartnerAccess } from "@/app/admin/(protected)/referral-program/actions";

export function PartnerAccessForm({ partnerId }: { partnerId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function regenerate() {
    const formData = new FormData();
    formData.set("id", partnerId);
    setMessage("");
    startTransition(async () => {
      const result = await regeneratePartnerAccess(formData);
      setConfirming(false);
      if (!result.ok) {
        setMessage("Unable to regenerate Partner access.");
      } else if (!result.emailSent) {
        setMessage(
          "Access was reset, but the email was not delivered. Resolve email delivery, then regenerate again.",
        );
      } else {
        setMessage("New temporary Partner access was emailed successfully.");
      }
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Regenerating..." : "Regenerate Partner Access"}
      </button>
      {message ? (
        <p role="status" className="mt-3 text-sm text-[var(--muted)]">
          {message}
        </p>
      ) : null}
      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--secondary)]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`access-title-${partnerId}`}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
            <h2
              id={`access-title-${partnerId}`}
              className="text-xl font-semibold text-[var(--foreground)]"
            >
              Regenerate Partner Access?
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              This replaces the Partner&apos;s current password, requires an
              immediate password change, and emails new temporary credentials.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirming(false)}
                className="cursor-pointer rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={regenerate}
                className="cursor-pointer rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isPending ? "Regenerating..." : "Regenerate Access"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
