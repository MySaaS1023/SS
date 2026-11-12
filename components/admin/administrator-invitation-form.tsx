"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { operationalWorkspaces } from "@/lib/admin-management/core";
import type { InvitationPreview } from "@/lib/admin-management/invitations-core";

type ListedInvitation = Omit<InvitationPreview, "expires_at"> & {
  expires_at?: string;
};
export function AdministratorInvitationForm({
  enabled,
  invitations,
}: {
  enabled: boolean;
  invitations: ListedInvitation[];
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<ListedInvitation | null>(null);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [approved, setApproved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"send" | "revoke" | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  function selectInvitation(row: ListedInvitation) {
    setPreview(row);
    setEmailConfirmation("");
    setApproved(false);
    setConfirmAction(null);
    setMessage("");
  }
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || busy) return;
    setBusy(true);
    setMessage("");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/management/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          role: "admin",
        }),
      });
      const result = await response.json();
      if (response.ok && result.invitation) {
        selectInvitation(result.invitation);
        router.refresh();
      }
      setMessage(
        result.message ?? result.error ?? "Invitation could not be prepared.",
      );
    } catch {
      setMessage(
        "Invitation preparation could not be confirmed. Reload its status before continuing.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function performAction() {
    if (
      !enabled ||
      !preview ||
      busy ||
      !confirmAction ||
      emailConfirmation !== preview.email ||
      (confirmAction === "send" && !approved)
    )
      return;
    const action = confirmAction;
    setBusy(true);
    setConfirmAction(null);
    setMessage("");
    try {
      const response = await fetch(
        `/api/admin/management/invitations/${encodeURIComponent(preview.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            confirmation: emailConfirmation,
            ownerConfirmed: approved,
          }),
        },
      );
      const result = await response.json();
      setMessage(
        result.message ??
          result.error ??
          "Operation could not be confirmed. Do not retry a send.",
      );
      setPreview({
        ...preview,
        status:
          action === "revoke" && response.ok
            ? "revoked"
            : action === "send"
              ? result.status === "accepted"
                ? "sent"
                : result.status === "failed"
                  ? "failed"
                  : "unknown"
              : preview.status,
      });
      router.refresh();
    } catch {
      setMessage(
        "Operation outcome is unknown. Do not retry a send; ask the owner to reconcile its audited history.",
      );
      if (action === "send") setPreview({ ...preview, status: "unknown" });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="space-y-4 rounded-xl border border-[var(--border)] p-4 sm:p-5"
      aria-labelledby="administrator-invitations-heading"
    >
      <h2
        id="administrator-invitations-heading"
        className="text-lg font-semibold"
      >
        Administrator invitations
      </h2>
      <p className="text-sm">
        Prepare and review an Admin invitation before explicitly confirming
        delivery. Saving or previewing never sends an email or activates access.
      </p>
      {!enabled && (
        <p
          role="status"
          className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-slate-800"
        >
          Local candidate only. Sending and acceptance remain disabled until the
          owner approves the migration, Auth verification, general email
          configuration and both activation gates.
        </p>
      )}
      <form onSubmit={prepare} className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Full name
          <input
            name="name"
            required
            maxLength={160}
            disabled={!enabled || busy}
            autoComplete="off"
            className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            disabled={!enabled || busy}
            autoComplete="off"
            className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
          />
        </label>
        <p className="text-sm sm:col-span-2">
          Role: Admin · {operationalWorkspaces.join(" · ")} · cannot manage
          administrators or protected security settings.
        </p>
        <button
          disabled={!enabled || busy}
          className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Prepare invitation for review
        </button>
      </form>
      {invitations.length > 0 && (
        <div>
          <h3 className="font-semibold">Saved invitation status</h3>
          <ul className="mt-2 space-y-2">
            {invitations.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 text-sm"
              >
                <span className="break-all">
                  {row.display_name} · {row.email} ·{" "}
                  {row.status.replaceAll("_", " ")}
                </span>
                {row.role === "admin" &&
                  !["accepted", "revoked"].includes(row.status) && (
                    <button
                      type="button"
                      disabled={!enabled || busy}
                      onClick={() => selectInvitation(row)}
                      className="min-h-11 px-2 underline underline-offset-4 disabled:opacity-50"
                    >
                      Review invitation
                    </button>
                  )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {preview && (
        <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
          <h3 className="font-semibold">Review invitation</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium">Recipient</dt>
              <dd className="break-all">
                {preview.display_name} · {preview.email}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Role and scope</dt>
              <dd>
                Admin · {operationalWorkspaces.join(", ")} · no
                administrator-management access.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Status</dt>
              <dd>{preview.status.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt className="font-medium">Email preview</dt>
              <dd>
                Hello {preview.display_name}, you have been invited as an Admin.
                The email will contain a secure one-hour invitation to review
                access and set your own password. No access is granted until
                verified acceptance.
              </dd>
            </div>
          </dl>
          {!["accepted", "revoked"].includes(preview.status) && (
            <>
              <label className="block text-sm font-medium">
                Type the exact recipient email to confirm
                <input
                  value={emailConfirmation}
                  onChange={(event) => setEmailConfirmation(event.target.value)}
                  type="email"
                  maxLength={254}
                  autoComplete="off"
                  className="mt-1 block min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                />
              </label>
              {["pending_approval", "approved"].includes(preview.status) && (
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(event) => setApproved(event.target.checked)}
                    className="mt-1"
                  />
                  I have explicit owner approval for this recipient, Admin role
                  and four-workspace access.
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                {["pending_approval", "approved"].includes(preview.status) && (
                  <button
                    type="button"
                    disabled={
                      !enabled ||
                      busy ||
                      !approved ||
                      emailConfirmation !== preview.email
                    }
                    onClick={() => setConfirmAction("send")}
                    className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Send invitation
                  </button>
                )}
                <button
                  type="button"
                  disabled={
                    !enabled || busy || emailConfirmation !== preview.email
                  }
                  onClick={() => setConfirmAction("revoke")}
                  className="min-h-11 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  Revoke invitation
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {confirmAction && preview && (
        <div
          role="alertdialog"
          aria-labelledby="invitation-confirm-heading"
          aria-describedby="invitation-confirm-description"
          className="space-y-3 rounded-lg border-2 border-[var(--accent)] p-4"
        >
          <h3 id="invitation-confirm-heading" className="font-semibold">
            Confirm{" "}
            {confirmAction === "send"
              ? "invitation delivery"
              : "invitation revocation"}
          </h3>
          <p id="invitation-confirm-description" className="break-all text-sm">
            {confirmAction === "send"
              ? `Send one Admin invitation to ${preview.display_name} at ${preview.email}? Acceptance requires their own verified account and grants the four listed operational workspaces only.`
              : `Revoke the invitation for ${preview.display_name} at ${preview.email}? The invitation becomes unusable; historical audit records are preserved.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={performAction}
              className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Confirm {confirmAction === "send" ? "Send" : "Revocation"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="min-h-11 px-4 py-2 text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
