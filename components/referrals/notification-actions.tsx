"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotificationActions({ id }: { id?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function update() {
    setBusy(true);
    await fetch("/api/partner/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: id ? "mark_read" : "mark_all_read", id }),
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={update}
      className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
    >
      {id ? "Mark read" : "Mark all read"}
    </button>
  );
}
