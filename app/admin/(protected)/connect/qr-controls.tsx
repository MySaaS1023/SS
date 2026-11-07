"use client";
import { useState } from "react";
const connectUrl = "https://www.steadystartco.com/connect";
export function ConnectQrControls() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-5">
      <label className="block text-sm text-slate-200">
        Permanent page link
        <input
          aria-label="Permanent connect page link"
          readOnly
          value={connectUrl}
          className="mt-2 w-full rounded-xl border border-white/20 bg-[#0f172a] px-4 py-3 text-white"
          onFocus={(event) => event.currentTarget.select()}
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(connectUrl);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
          className="min-h-11 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-blue-300"
        >
          Copy Page Link
        </button>
        <a
          href="/connect-qr.png"
          download="steady-start-connect.png"
          className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-3 text-sm text-blue-200 focus-visible:outline-2 focus-visible:outline-blue-300"
        >
          Download PNG
        </a>
        <a
          href="/connect-qr.svg"
          download="steady-start-connect.svg"
          className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-3 text-sm text-blue-200 focus-visible:outline-2 focus-visible:outline-blue-300"
        >
          Download SVG
        </a>
      </div>
      <p role="status" className="mt-3 text-sm text-slate-400">
        {copied
          ? "Page link copied."
          : "You can also select and copy the page link above."}
      </p>
    </div>
  );
}
