"use client";

import { useState } from "react";

export function CopyMessage({ url }: { url: string }) {
  const [status, setStatus] = useState("");
  async function copy(label: string) {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(`${label} copied.`);
    } catch {
      setStatus(
        "Copy is unavailable. Select the link below and copy it manually.",
      );
    }
  }
  const button =
    "min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300";
  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        className={button}
        onClick={() => void copy("Handoff link")}
      >
        Copy link
      </button>
      <details className="rounded-xl border border-white/10 p-3">
        <summary className="min-h-11 cursor-pointer content-center text-sm text-[#bfdbfe] focus-visible:outline-2 focus-visible:outline-blue-300">
          Ready-to-send client text
        </summary>
        <p className="mt-2 text-xs leading-6 text-slate-400">
          Paste this personalized link into your client&apos;s text
          conversation. No extra links or customer details are included.
        </p>
        <label className="mt-3 block text-sm text-slate-300">
          Client text message
          <textarea
            readOnly
            value={url}
            rows={3}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 w-full resize-y rounded-lg border border-white/20 bg-[#0f172a] p-3 text-sm text-white focus:outline-2 focus:outline-blue-300"
          />
        </label>
        <button
          type="button"
          className={`${button} mt-3`}
          onClick={() => void copy("Client text")}
        >
          Copy client text
        </button>
      </details>
      <p
        role="status"
        aria-live="polite"
        className="min-h-6 text-sm text-[#bfdbfe]"
      >
        {status}
      </p>
    </div>
  );
}
