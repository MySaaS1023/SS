"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Administrator } from "@/lib/admin-management/core";

export function AdministratorRecords({ members }: { members: Administrator[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>, member: Administrator) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/management", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.user_id, role: form.get("role"), status: form.get("status"), version: member.version, confirmation: form.get("confirmation") }),
      });
      const result = await response.json();
      setMessage(result.message ?? result.error ?? "Unable to change administrator access.");
      if (response.ok) router.refresh();
    } catch { setMessage("Request failed. Reload to check the current status before retrying."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2">
    {members.map(member => <details key={member.user_id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]">
      <summary className="cursor-pointer p-3 text-sm"><strong>{member.display_name}</strong> · {member.email} · {member.role === "super_admin" ? "Super Admin" : "Admin"} · {member.status}</summary>
      <form onSubmit={event => submit(event, member)} className="space-y-3 border-t border-[var(--line)] p-4 text-sm">
        <p>Change access for <strong>{member.email}</strong>. Disable or revoke prevents administrator operations; no account or historical records are deleted. The final active Super Admin is protected.</p>
        <label className="block">Role <select name="role" defaultValue={member.role} className="ml-2 rounded border border-[var(--line)] p-2"><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></label>
        <label className="block">Status <select name="status" defaultValue={member.status} className="ml-2 rounded border border-[var(--line)] p-2"><option value="active">Active</option><option value="disabled">Disabled</option><option value="revoked">Revoked</option></select></label>
        <label className="block">Confirm by entering this administrator&apos;s exact email address<input name="confirmation" type="email" required autoComplete="off" className="mt-1 block w-full rounded border border-[var(--line)] p-2" /></label>
        <button disabled={busy} className="rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Confirm access change"}</button>
      </form>
    </details>)}
    <p role="status" aria-live="polite" className="text-sm">{message}</p>
  </div>;
}
