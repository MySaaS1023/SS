"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  RESOURCE_CATEGORIES,
  type PartnerResource,
} from "@/lib/partner-resources/types";

type Partner = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
};
export function ResourceForm({
  resource,
  partners,
}: {
  resource?: PartnerResource;
  partners: Partner[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget,
      payload = new FormData(form);
    setBusy(true);
    setMessage("");
    setOk(false);
    try {
      const response = await fetch("/api/partner-resources", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : "Document could not be saved.",
        );
      setOk(true);
      setMessage(
        "Document saved. Publication and audience settings are now active.",
      );
      if (!resource) form.reset();
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Document could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const field =
    "mt-2 w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--foreground)]";
  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="hidden" name="resourceId" value={resource?.id ?? ""} />
      <input type="hidden" name="revision" value={resource?.revision ?? 0} />
      <fieldset disabled={busy} className="min-w-0 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="min-w-0 text-sm text-[var(--muted)]">
            Document title
            <input
              className={field}
              name="title"
              required
              maxLength={160}
              defaultValue={resource?.title}
            />
          </label>
          <label className="min-w-0 text-sm text-[var(--muted)]">
            Category
            <select
              className={field}
              name="category"
              defaultValue={resource?.category ?? "Other Resources"}
            >
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm text-[var(--muted)]">
          Description
          <textarea
            className={field}
            name="description"
            rows={2}
            maxLength={2000}
            defaultValue={resource?.description}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="min-w-0 text-sm text-[var(--muted)]">
            Document privacy
            <select
              name="classification"
              className={field}
              defaultValue={resource?.classification ?? "general"}
              disabled={resource?.classification === "completed_tax"}
            >
              <option value="general">
                General resource or blank template
              </option>
              <option value="completed_tax">
                Completed tax document — one partner only
              </option>
            </select>
          </label>
          <label className="min-w-0 text-sm text-[var(--muted)]">
            Audience
            <select
              name="targetPartnerId"
              className={field}
              defaultValue={resource?.target_partner_id ?? ""}
              disabled={resource?.classification === "completed_tax"}
            >
              <option value="">All approved partners</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} — {p.email} ({p.status})
                </option>
              ))}
            </select>
          </label>
        </div>
        {resource?.classification === "completed_tax" ? (
          <>
            <input type="hidden" name="classification" value="completed_tax" />
            <input
              type="hidden"
              name="targetPartnerId"
              value={resource.target_partner_id ?? ""}
            />
            <p className="text-xs leading-6 text-amber-800">
              This tax document stays restricted to its original partner. Create
              a separate document for a different recipient.
            </p>
          </>
        ) : null}
        <p className="text-xs leading-6 text-[var(--muted)]">
          Completed tax documents require a named partner. Suspended or
          unapproved partners cannot download resources. Never publish completed
          tax documents as general resources.
        </p>
        <label className="block text-sm text-[var(--muted)]">
          {resource
            ? "Replace file (optional; creates a new version)"
            : "Document file"}
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,.txt"
            required={!resource}
            className={field}
          />
          <span className="mt-1 block text-xs text-[var(--muted)]">
            PDF, macro-free DOCX, or UTF-8 TXT; maximum 3 MB. Documents download
            privately as attachments.
          </span>
        </label>
        <label className="block text-sm text-[var(--muted)]">
          Version notes
          <textarea
            name="releaseNotes"
            rows={2}
            maxLength={1000}
            className={field}
            placeholder="What changed in this file?"
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            name="published"
            defaultChecked={resource?.published ?? false}
            className="h-5 w-5"
          />
          Publish to the selected audience
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            name="acknowledgmentRequired"
            defaultChecked={resource?.acknowledgment_required ?? false}
            className="h-5 w-5"
          />
          Request a receipt acknowledgment for this version
        </label>
        <p className="text-xs leading-6 text-[var(--muted)]">
          Acknowledgment records receipt only. It is not a legal signature,
          acceptance of terms, or a requirement for access. Use an
          owner-approved signature process for binding agreements.
        </p>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary)] disabled:opacity-50"
        >
          {busy ? "Saving document…" : "Save Document"}
        </button>
      </fieldset>
      {message ? (
        <p
          role={ok ? "status" : "alert"}
          className={ok ? "text-sm text-emerald-800" : "text-sm text-amber-800"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
