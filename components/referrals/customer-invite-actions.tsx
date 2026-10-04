"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerInviteActions({
  referralId,
  hasInvite,
}: {
  referralId: string;
  hasInvite: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function resend() {
    if (!window.confirm("Resend the Steady Start invitation to this customer?"))
      return;
    setBusy(true);
    setMessage("");
    const response = await fetch(
      `/api/partner/referrals/${referralId}/invite`,
      { method: "POST" },
    );
    const result = await response.json();
    setMessage(
      response.ok
        ? "Customer invitation sent."
        : (result.error ?? "Customer Invite Failed"),
    );
    setBusy(false);
    router.refresh();
  }
  async function copy() {
    setBusy(true);
    const response = await fetch(
      `/api/partner/referrals/${referralId}/customer-link`,
    );
    const result = await response.json();
    if (response.ok) {
      await navigator.clipboard.writeText(result.url);
      setMessage("Customer link copied.");
    } else setMessage(result.error ?? "Unable to copy customer link.");
    setBusy(false);
  }
  async function view() {
    setBusy(true);
    const response = await fetch(
      `/api/partner/referrals/${referralId}/customer-link`,
    );
    const result = await response.json();
    if (response.ok) window.open(result.url, "_blank", "noopener,noreferrer");
    else setMessage(result.error ?? "Unable to open customer page.");
    setBusy(false);
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={resend}
        className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {hasInvite ? "Resend Customer Invite" : "Send Customer Invite"}
      </button>
      {hasInvite ? (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={view}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            View Customer Page
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={copy}
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Copy Customer Link
          </button>
        </>
      ) : null}
      {message ? (
        <p className="w-full text-xs text-[#bfdbfe]">{message}</p>
      ) : null}
    </div>
  );
}
