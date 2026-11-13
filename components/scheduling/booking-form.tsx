"use client";
import { useActionState, useEffect, useState } from "react";
import {
  createConsultationAction,
  lookupSchedulingClientsAction,
  type SchedulingActionState,
} from "@/app/admin/(protected)/scheduling/actions";
import type { HandoffClientMatch } from "@/lib/handoff/clients";
import { SlotPicker, schedulingInputClass as input } from "./slot-picker";
export function BookingForm({
  businessTimeZone,
  admin = false,
}: {
  businessTimeZone: string;
  admin?: boolean;
}) {
  const [state, action, pending] = useActionState<
    SchedulingActionState,
    FormData
  >(createConsultationAction, { ok: false, message: "" });
  const [key, setKey] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [timeZone, setTimeZone] = useState(businessTimeZone);
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<HandoffClientMatch | null>(null);
  const [search, setSearch] = useState("");
  const [matches, setMatches] = useState<HandoffClientMatch[]>([]);
  const [lookupMessage, setLookupMessage] = useState("");
  const [publicResult, setPublicResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setKey(crypto.randomUUID());
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  async function submitPublic(form: FormData) {
    setSubmitting(true);
    setPublicResult("");
    try {
      const response = await fetch("/api/scheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json();
      setPublicResult(result.message || "The request could not be submitted.");
    } catch {
      setPublicResult(
        "The result could not be confirmed. Retry with this same form to avoid duplicate requests.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="glass-card min-w-0 p-5 sm:p-7">
      {admin ? (
        <div className="mb-6 border-b border-[var(--line)] pb-5">
          <label className="block text-sm text-[var(--muted)]">
            Find an existing client
            <input
              className={input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={80}
              placeholder="Business name"
            />
          </label>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl border border-[var(--line)] px-4 text-sm text-[var(--foreground)]"
            onClick={async () => {
              try {
                setMatches(await lookupSchedulingClientsAction(search));
                setLookupMessage(
                  "Select a matching client to prefill. Existing customer records are never edited here.",
                );
              } catch {
                setLookupMessage("Client lookup is unavailable.");
              }
            }}
          >
            Search clients
          </button>
          <p role="status" className="mt-2 text-sm text-[var(--muted)]">
            {lookupMessage}
          </p>
          <ul>
            {matches.map((m) => (
              <li key={`${m.source}-${m.sourceId}`}>
                <button
                  type="button"
                  className="min-h-11 text-left text-sm text-[var(--primary)] underline"
                  onClick={() => {
                    setSource(m);
                    setBusinessName(m.businessName);
                    setFullName(m.contactName);
                    setEmail(m.businessEmail);
                    setPhone(m.businessPhone);
                    setMatches([]);
                  }}
                >
                  {m.businessName} —{" "}
                  {m.contactName || m.businessEmail || "Select client"}
                </button>
              </li>
            ))}
          </ul>
          {source ? (
            <p className="mt-2 text-xs text-emerald-800">
              Linked to existing {source.source} record.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => setSource(null)}
              >
                Remove association
              </button>
            </p>
          ) : null}
        </div>
      ) : null}
      <form action={admin ? action : submitPublic} className="space-y-5">
        <fieldset
          disabled={pending || submitting}
          className="min-w-0 space-y-5"
        >
          <legend className="text-xl font-semibold text-[var(--foreground)]">
            {admin ? "Create booking request" : "Request a launch consultation"}
          </legend>
          <input type="hidden" name="requestKey" value={key} />
          <input type="hidden" name="startsAt" value={startsAt} />
          {admin ? (
            <>
              <input
                type="hidden"
                name="sourceKind"
                value={source?.source ?? ""}
              />
              <input
                type="hidden"
                name="sourceId"
                value={source?.sourceId ?? ""}
              />
            </>
          ) : null}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="text-sm text-[var(--muted)]">
              Business name
              <input
                className={input}
                name="businessName"
                required
                maxLength={120}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoComplete="organization"
              />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Full name
              <input
                className={input}
                name="fullName"
                required
                maxLength={160}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Email
              <input
                className={input}
                name="email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="text-sm text-[var(--muted)]">
              Phone
              <input
                className={input}
                name="phone"
                type="tel"
                required
                maxLength={40}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </label>
          </div>
          <label className="block text-sm text-[var(--muted)]">
            Consultation purpose
            <textarea
              className={input}
              name="purpose"
              required
              maxLength={500}
              rows={3}
              placeholder="Business goals, website requirements, branding or project scope"
            />
          </label>
          <label className="block text-sm text-[var(--muted)]">
            Your time zone
            <input
              className={input}
              name="timeZone"
              required
              maxLength={80}
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              list="consultation-time-zones"
            />
            <datalist id="consultation-time-zones">
              {[
                "America/Phoenix",
                "America/Denver",
                "America/Los_Angeles",
                "America/Chicago",
                "America/New_York",
                "Europe/London",
                "UTC",
              ].map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </label>
          <SlotPicker
            businessTimeZone={businessTimeZone}
            timeZone={timeZone}
            value={startsAt}
            onChange={setStartsAt}
          />
          <label className="block text-sm text-[var(--muted)]">
            Additional notes <span className="text-[var(--muted)]">(optional)</span>
            <textarea
              className={input}
              name="notes"
              maxLength={1500}
              rows={3}
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              Do not include passwords, payment information or sensitive
              documents.
            </span>
          </label>
          {!admin ? (
            <div className="sr-only" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          ) : null}
          <p className="text-sm leading-7 text-[var(--muted)]">
            Submitting reserves a requested time for review. The consultation is
            confirmed only after Steady Start reviews it.
            {admin
              ? " Saving never sends an email or creates a Zoom meeting automatically."
              : " We will follow up with your meeting details."}
          </p>
          <button
            disabled={!key || !startsAt}
            className="min-h-12 rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white hover:bg-[var(--primary)] disabled:opacity-50"
          >
            {pending || submitting ? "Saving…" : "Submit booking request"}
          </button>
        </fieldset>
        {state.message || publicResult ? (
          <p role="status" className="text-sm leading-7 text-[var(--primary)]">
            {admin ? state.message : publicResult}
          </p>
        ) : null}
      </form>
    </div>
  );
}
