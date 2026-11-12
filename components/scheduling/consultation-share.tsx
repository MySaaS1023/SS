"use client";

import { useState, type FormEvent } from "react";
import {
  consultationInvitationSubject,
  consultationInvitationText,
  type ConsultationInvitationResult,
} from "@/lib/scheduling/invitation-shared";

const inputClass =
  "mt-2 w-full min-w-0 rounded-xl border border-white/20 bg-[#0f172a] px-4 py-3 text-white focus:outline-2 focus:outline-blue-300 disabled:opacity-50";
const buttonClass =
  "inline-flex min-h-11 max-w-full items-center justify-center rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2563eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:opacity-50";

export function ConsultationShare({
  bookingUrl,
  emailConfigured,
}: {
  bookingUrl: string;
  emailConfigured: boolean;
}) {
  const [recipient, setRecipient] = useState("");
  const [preview, setPreview] = useState<ConsultationInvitationResult | null>(
    null,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<ConsultationInvitationResult | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const locked = ["accepted", "duplicate", "indeterminate", "pending"].includes(
    result?.status ?? "",
  );

  async function request(action: "preview" | "send") {
    if (
      pending ||
      (action === "send" &&
        (!preview?.confirmationToken || !confirmed || locked))
    )
      return;
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/scheduling/invitations", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          recipient,
          ...(action === "send"
            ? { confirmed, confirmationToken: preview?.confirmationToken }
            : {}),
        }),
      });
      const data: ConsultationInvitationResult = await response.json();
      if (action === "preview") {
        setPreview(
          data.status === "preview" && data.confirmationToken ? data : null,
        );
        setConfirmed(false);
      }
      setResult(data);
    } catch {
      setResult({
        ok: false,
        status: action === "send" ? "indeterminate" : "setup",
        message:
          action === "send"
            ? "The request outcome is unknown. Do not resend automatically; check Resend history first. Inbox delivery is not confirmed."
            : "The invitation preview is unavailable. Nothing was sent. Copy Consultation Link remains available.",
      });
    } finally {
      setPending(false);
    }
  }
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void request("preview");
  }

  return (
    <section
      aria-labelledby="share-consultation-heading"
      className="glass-card my-6 min-w-0 p-5 sm:p-6"
    >
      <h2
        id="share-consultation-heading"
        className="text-xl font-semibold text-white"
      >
        Share consultation booking
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        Share the existing booking page. Customers choose from your configured
        availability; a request does not automatically confirm a meeting.
      </p>
      <label
        className="mt-4 block text-sm font-medium text-slate-200"
        htmlFor="consultation-share-link"
      >
        Consultation link
      </label>
      <input
        id="consultation-share-link"
        className={inputClass}
        value={bookingUrl}
        readOnly
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClass}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(bookingUrl);
              setCopyStatus("Consultation link copied.");
            } catch {
              setCopyStatus(
                "Copy was unavailable. Select the consultation link above and copy it manually.",
              );
            }
          }}
        >
          Copy Consultation Link
        </button>
        <a
          className="inline-flex min-h-11 items-center text-sm text-blue-200 underline"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open booking page
        </a>
      </div>
      {copyStatus ? (
        <p role="status" className="mt-2 text-sm text-slate-300">
          {copyStatus}
        </p>
      ) : null}
      <form
        method="post"
        action="/api/admin/scheduling/invitations"
        onSubmit={review}
        className="mt-6 min-w-0 border-t border-white/10 pt-5"
      >
        <h3 className="text-lg font-semibold text-white">
          Send Consultation Link
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Enter the intended recipient, review the message, and confirm before
          sending. Saving, opening this page, copying, and previewing never send
          an email.
        </p>
        {!emailConfigured ? (
          <p role="alert" className="mt-3 text-sm leading-6 text-amber-100">
            Email setup required: a general Resend key and verified Steady Start
            sender are not configured. Copy Consultation Link remains available.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Existing general sender settings are present; this does not confirm
            provider authorization. A blocked or rejected invitation will be
            reported accurately.
          </p>
        )}
        <label
          htmlFor="consultation-invite-recipient"
          className="mt-4 block text-sm font-medium text-slate-200"
        >
          Intended recipient email address
        </label>
        <input
          id="consultation-invite-recipient"
          name="recipient"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          className={inputClass}
          value={recipient}
          disabled={pending || locked}
          onChange={(event) => {
            setRecipient(event.target.value);
            setPreview(null);
            setConfirmed(false);
            setResult(null);
          }}
        />
        <button
          type="submit"
          className={`${buttonClass} mt-4`}
          disabled={pending || !emailConfigured || locked}
        >
          {pending && !preview ? "Preparing preview…" : "Review Invitation"}
        </button>
        <noscript>
          <p className="mt-3 text-sm text-slate-300">
            JavaScript is required for the preview and confirmation. Use the
            consultation link above to share it manually.
          </p>
        </noscript>
      </form>
      {preview?.confirmationToken ? (
        <div className="mt-5 min-w-0 rounded-xl border border-white/15 p-4">
          <h3 className="font-semibold text-white">
            Review consultation invitation
          </h3>
          <dl className="mt-3 text-sm leading-7 text-slate-300">
            <dt className="font-semibold">To</dt>
            <dd className="break-all">{preview.recipient}</dd>
            <dt className="mt-2 font-semibold">Subject</dt>
            <dd>{consultationInvitationSubject}</dd>
          </dl>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
            {consultationInvitationText(bookingUrl)}
          </p>
          <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-200">
            <input
              className="mt-1 h-4 w-4 shrink-0"
              type="checkbox"
              checked={confirmed}
              disabled={pending || locked}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            I confirm this is the intended recipient and authorize sending this
            consultation link.
          </label>
          <button
            type="button"
            className={`${buttonClass} mt-4`}
            disabled={!confirmed || pending || locked}
            onClick={() => void request("send")}
          >
            {pending ? "Sending…" : "Send Consultation Link"}
          </button>
        </div>
      ) : null}
      {result ? (
        <div
          role={result.ok ? "status" : "alert"}
          className="mt-4 text-sm leading-7 text-slate-300"
        >
          <p>{result.message}</p>
          {result.checkedAt ? (
            <p className="mt-1 text-xs text-slate-400">
              Status checked: {new Date(result.checkedAt).toLocaleString()}
            </p>
          ) : null}
          {result.providerId ? (
            <p className="mt-1 break-all text-xs text-slate-400">
              Provider reference: {result.providerId}
            </p>
          ) : null}
        </div>
      ) : null}
      {locked ? (
        <button
          type="button"
          disabled={pending}
          className="mt-3 inline-flex min-h-11 items-center text-sm text-blue-200 underline disabled:opacity-50"
          onClick={() => {
            setRecipient("");
            setPreview(null);
            setConfirmed(false);
            setResult(null);
          }}
        >
          Prepare an invitation for another recipient
        </button>
      ) : null}
    </section>
  );
}
