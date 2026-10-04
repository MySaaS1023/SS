"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  reviewApplication,
  type ApplicationReviewAction,
} from "@/app/admin/(protected)/referral-program/actions";

export function ApplicationReviewForm({
  applicationId,
  initialNotes = "",
}: {
  applicationId: string;
  initialNotes?: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [confirmation, setConfirmation] =
    useState<ApplicationReviewAction | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(action: ApplicationReviewAction) {
    setError("");
    const formData = new FormData();
    formData.set("id", applicationId);
    formData.set("action", action);
    formData.set("notes", notes);
    startTransition(async () => {
      const result = await reviewApplication(formData);
      if (!result.ok) {
        setError(
          action === "approve"
            ? "Unable to approve application. Please try again."
            : "Unable to reject application. Please try again.",
        );
        return;
      }
      setConfirmation(null);
      const reviewStatus =
        action === "approve" && result.emailSent === false
          ? "approved-email-failed"
          : action === "approve"
            ? "approved"
            : "rejected";
      router.replace(
        `/admin/referral-program/applications?review=${reviewStatus}`,
      );
      router.refresh();
    });
  }

  const approving = isPending && confirmation === "approve";
  const rejecting = isPending && confirmation === "reject";

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <label className="sr-only" htmlFor={`notes-${applicationId}`}>
        Internal notes
      </label>
      <textarea
        id={`notes-${applicationId}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Internal notes"
        className="w-full rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError("");
            setConfirmation("approve");
          }}
          className="cursor-pointer rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {approving ? "Approving..." : "Approve Application"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError("");
            setConfirmation("reject");
          }}
          className="cursor-pointer rounded-xl border border-red-400/40 px-5 py-3 text-sm font-semibold text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rejecting ? "Rejecting..." : "Reject Application"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-300">
          {error}
        </p>
      ) : null}

      {confirmation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`review-title-${applicationId}`}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-6 shadow-2xl">
            <h2
              id={`review-title-${applicationId}`}
              className="text-xl font-semibold text-white"
            >
              {confirmation === "approve"
                ? "Approve this Referral Partner?"
                : "Reject Referral Partner Application?"}
            </h2>
            {confirmation === "approve" ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Approving this application will create or activate their Partner
                account, generate their referral code, and send their Partner
                access email.
              </p>
            ) : (
              <div className="mt-4">
                <label
                  htmlFor={`reject-notes-${applicationId}`}
                  className="text-sm font-medium text-white"
                >
                  Reason for rejection (optional internal note)
                </label>
                <textarea
                  id={`reject-notes-${applicationId}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white"
                />
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmation(null)}
                className="cursor-pointer rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => submit(confirmation)}
                className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${confirmation === "approve" ? "bg-green-600" : "bg-red-700"}`}
              >
                {approving
                  ? "Approving..."
                  : rejecting
                    ? "Rejecting..."
                    : confirmation === "approve"
                      ? "Approve Partner"
                      : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
