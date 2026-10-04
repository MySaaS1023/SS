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
      className="rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
