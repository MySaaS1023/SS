"use client";

import { useState } from "react";

export function CopyLinkButton({
  value,
  label = "Copy Referral Link",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      type="button"
      className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary)]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
