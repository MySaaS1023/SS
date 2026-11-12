"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArchiveKind } from "@/lib/referrals/archival";

export function RecordArchiveForm({
  kind,
  recordId,
  label,
}: {
  kind: ArchiveKind;
  recordId: string;
  label: string;
}) {
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [archived, setArchived] = useState(false);
  const router = useRouter();
  return (
    <details className="record-archive-control">
      <summary>Archive record</summary>
      <p>
        Archive {label} ({recordId})? This is not permanent deletion. Original
        records, financial history and attribution are retained. Linked or
        ineligible records will be refused.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!confirmation || busy || archived) return;
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/admin/records/archive", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind,
                recordId,
                confirmation: `ARCHIVE ${recordId}`,
              }),
            });
            const result = await response.json();
            setMessage(
              result.message ||
                result.error ||
                "Archive could not be confirmed.",
            );
            if (response.ok && result.ok) {
              setArchived(true);
              router.refresh();
            }
          } catch {
            setMessage(
              "Archive result could not be confirmed. Reload before retrying.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          <input
            type="checkbox"
            checked={confirmation}
            onChange={(e) => setConfirmation(e.target.checked)}
            disabled={busy || archived}
          />{" "}
          I confirm archiving this specific record.
        </label>
        <button type="submit" disabled={!confirmation || busy || archived}>
          {archived
            ? "Archived"
            : busy
              ? "Checking dependencies…"
              : "Confirm Archive"}
        </button>
      </form>
      <p role="status">{message}</p>
    </details>
  );
}
