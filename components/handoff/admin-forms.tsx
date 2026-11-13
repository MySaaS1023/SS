"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createHandoffAction,
  deactivateHandoffAction,
  searchHandoffClientsAction,
  sendHandoffEmailAction,
  refreshHandoffDeliveryAction,
  checkHandoffEmailConfigurationAction,
} from "@/app/admin/(protected)/handoffs/actions";
import type {
  HandoffActionState,
  HandoffDeliveryActionState,
} from "@/app/admin/(protected)/handoffs/actions";
import type { HandoffClientMatch } from "@/lib/handoff/clients";
import { handoffEmailMessage, handoffSmsMessage } from "@/lib/handoff/messages";
import type { HandoffEmailDiagnostic } from "@/lib/handoff/email-diagnostics-core";

const initialState: HandoffActionState = { ok: false, message: "" };
const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] focus:outline-2 focus:outline-[var(--primary)] disabled:opacity-50";
const buttonClass =
  "min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] disabled:opacity-50";

export function CheckHandoffEmailConfigurationForm() {
  const [result, action, pending] = useActionState<
    HandoffEmailDiagnostic | null,
    FormData
  >(checkHandoffEmailConfigurationAction, null);
  return (
    <form action={action} className="glass-card mt-6 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        Handoff email configuration
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Check the existing general Resend key and Steady Start sending domain.
        This read-only check never sends email or changes credentials. Referral
        email settings remain unchanged.
      </p>
      <button
        type="submit"
        disabled={pending}
        className={`${buttonClass} mt-4`}
      >
        {pending ? "Checking…" : "Check handoff email configuration"}
      </button>
      {result ? (
        <div
          role={result.ok ? "status" : "alert"}
          className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]"
        >
          <p>{result.message}</p>
          {result.outcome !== "unauthorized" ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted)]">Provider HTTP status</dt>
                <dd>{result.httpStatus ?? "No HTTP response"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Sanitized provider code</dt>
                <dd>{result.errorCode ?? "None"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Steady Start domain</dt>
                <dd>{result.domainStatus.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Domain sending capability</dt>
                <dd>{result.sending}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export function CreateHandoffForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(
    createHandoffAction,
    initialState,
  );
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [matches, setMatches] = useState<HandoffClientMatch[]>([]);
  const [selected, setSelected] = useState<HandoffClientMatch | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, startSearch] = useTransition();

  useEffect(() => {
    if (businessName.trim().length < 2 || selected) {
      setMatches([]);
      return;
    }
    const timer = window.setTimeout(() => {
      startSearch(async () => {
        const found = await searchHandoffClientsAction(businessName);
        setMatches(found);
        setSearchOpen(found.length > 0);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [businessName, selected]);

  function chooseClient(match: HandoffClientMatch) {
    setSelected(match);
    setBusinessName(match.businessName);
    setBusinessPhone(match.businessPhone);
    setBusinessEmail(match.businessEmail);
    setContactName(match.contactName);
    setWebsiteUrl(match.websiteUrl);
    setSearchOpen(false);
  }

  return (
    <div className="space-y-6">
      <form action={action} className="glass-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Create a client handoff
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
          Search existing authorized client records or enter the details
          manually. Contact information is never placed in the public link.
        </p>
        <fieldset
          disabled={disabled || pending}
          className="mt-5 space-y-4 disabled:opacity-60"
        >
          <legend className="sr-only">Client website details</legend>
          <div className="relative">
            <label className="block text-sm font-medium text-[var(--muted)]">
              Business name
              <input
                name="businessName"
                required
                maxLength={120}
                autoComplete="off"
                value={businessName}
                onChange={(event) => {
                  setBusinessName(event.target.value);
                  setSelected(null);
                }}
                onFocus={() => setSearchOpen(matches.length > 0)}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={searchOpen}
                aria-controls="handoff-client-matches"
                className={inputClass}
              />
            </label>
            {searching ? (
              <p className="mt-2 text-xs text-[var(--muted)]">Searching clients…</p>
            ) : null}
            {searchOpen ? (
              <div
                id="handoff-client-matches"
                role="listbox"
                className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--primary)] p-2 shadow-2xl"
              >
                {matches.map((match) => (
                  <button
                    key={`${match.source}:${match.sourceId}`}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => chooseClient(match)}
                    className="w-full rounded-lg px-3 py-3 text-left hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                  >
                    <span className="block font-medium text-[var(--foreground)]">
                      {match.businessName}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {[match.contactName, match.businessEmail]
                        .filter(Boolean)
                        .join(" · ") || "Existing authorized record"}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--muted)]">
              Business phone number
              <input
                name="businessPhone"
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                value={businessPhone}
                onChange={(event) => setBusinessPhone(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--muted)]">
              Business email address
              <input
                name="businessEmail"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={businessEmail}
                onChange={(event) => setBusinessEmail(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-[var(--muted)]">
            Point of contact — full name
            <input
              name="contactName"
              required
              maxLength={160}
              autoComplete="name"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--muted)]">
            Finished website URL / Live site
            <input
              name="websiteUrl"
              type="url"
              required
              maxLength={2048}
              pattern="https://.*"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://www.example.com"
              aria-describedby="website-help"
              className={inputClass}
            />
          </label>
          <p id="website-help" className="text-xs leading-6 text-[var(--muted)]">
            Use the complete public HTTPS address. Avoid login links, passwords,
            or private URLs.
          </p>
          <label className="block text-sm font-medium text-[var(--muted)]">
            Personalized message{" "}
            <span className="font-normal text-[var(--muted)]">(optional)</span>
            <textarea
              name="message"
              maxLength={1500}
              rows={5}
              aria-describedby="message-help"
              className={inputClass}
            />
          </label>
          <p id="message-help" className="text-xs leading-6 text-[var(--muted)]">
            Up to 1,500 characters. Do not include passwords, billing
            information, or other sensitive details.
          </p>
          <input type="hidden" name="source" value={selected?.source ?? ""} />
          <input
            type="hidden"
            name="sourceReferralId"
            value={selected?.source === "referral" ? selected.sourceId : ""}
          />
          <input
            type="hidden"
            name="sourceUpdatedAt"
            value={selected?.sourceUpdatedAt ?? ""}
          />
          {selected?.source === "referral" ? (
            <label className="flex gap-3 rounded-xl border border-[var(--line)] p-4 text-sm leading-6 text-[var(--muted)]">
              <input
                type="checkbox"
                name="saveClientCorrections"
                value="yes"
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>
                Save these edited contact and website details back to the
                selected client record. Leave unchecked to use them only for
                this handoff.
              </span>
            </label>
          ) : null}
          <button
            type="submit"
            disabled={pending || disabled}
            className={`${buttonClass} w-full sm:w-auto`}
          >
            {pending ? "Creating…" : "Create handoff link"}
          </button>
        </fieldset>
        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`mt-4 text-sm leading-7 ${state.ok ? "text-[var(--primary)]" : "text-red-800"}`}
          >
            {state.message}
          </p>
        ) : null}
      </form>
      {state.ok && state.handoff ? (
        <GeneratedHandoffActions
          key={state.handoff.id}
          handoff={state.handoff}
        />
      ) : null}
    </div>
  );
}

export function GeneratedHandoffActions({
  handoff,
}: {
  handoff: NonNullable<HandoffActionState["handoff"]>;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const [email, setEmail] = useState(handoff.businessEmail);
  const [phone, setPhone] = useState(handoff.businessPhone);
  const emailPreview = handoffEmailMessage(handoff);
  const smsPreview = handoffSmsMessage(handoff);
  const initialDelivery: HandoffDeliveryActionState = {
    ok: false,
    status: "idle",
    message: "",
  };
  const [delivery, emailAction, emailPending] = useActionState(
    sendHandoffEmailAction,
    initialDelivery,
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(handoff.url);
      setCopyStatus("Handoff link copied.");
    } catch {
      setCopyStatus("Copy is unavailable. Select and copy the link manually.");
    }
  }

  return (
    <section
      className="glass-card p-5 sm:p-6"
      aria-labelledby="delivery-heading"
    >
      <h2 id="delivery-heading" className="text-xl font-semibold text-[var(--foreground)]">
        Handoff ready
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        Review the handoff and confirm a delivery method. Saving and previewing
        do not send messages. Check the delivery history for earlier attempts.
      </p>
      <a
        href={`/admin/handoffs/${handoff.id}/preview`}
        className="mt-3 inline-flex min-h-11 items-center text-[var(--primary)] underline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        Preview client-facing page
      </a>
      <label className="mt-5 block text-sm font-medium text-[var(--muted)]">
        Secure handoff link
        <input
          readOnly
          value={handoff.url}
          onFocus={(event) => event.currentTarget.select()}
          className={inputClass}
        />
      </label>
      <button
        type="button"
        onClick={() => void copyLink()}
        className={`${buttonClass} mt-3`}
      >
        Copy Link
      </button>
      <p role="status" className="mt-2 min-h-6 text-sm text-[var(--primary)]">
        {copyStatus}
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <details className="rounded-2xl border border-[var(--line)] p-4">
          <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
            Send to Email
          </summary>
          <form action={emailAction} className="mt-4 space-y-4">
            <input type="hidden" name="handoffId" value={handoff.id} />
            <label className="block text-sm text-[var(--muted)]">
              Recipient email
              <input
                name="destination"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">Email preview</p>
              <p className="mt-2">
                <strong>Subject:</strong> {emailPreview.subject}
              </p>
              <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-xs leading-6 text-[var(--muted)]">
                {emailPreview.text}
              </pre>
            </div>
            <label className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
              <input
                type="checkbox"
                name="confirmRecipient"
                value="yes"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
              />
              <span>I confirm this is the intended recipient.</span>
            </label>
            <button
              type="submit"
              disabled={emailPending}
              className={`${buttonClass} w-full`}
            >
              {emailPending ? "Sending…" : "Confirm and Send Email"}
            </button>
            {delivery.message ? (
              <p
                role={delivery.ok ? "status" : "alert"}
                className={`text-sm leading-6 ${delivery.ok ? "text-[var(--primary)]" : "text-red-800"}`}
              >
                {delivery.message}
              </p>
            ) : null}
          </form>
        </details>

        <details className="rounded-2xl border border-[var(--line)] p-4">
          <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
            Send to Text
          </summary>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-[var(--muted)]">
              Recipient phone
              <input
                type="tel"
                maxLength={40}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--foreground)]">SMS preview</p>
              <p className="mt-3 break-words text-xs leading-6">{smsPreview}</p>
            </div>
            <button type="button" disabled className={`${buttonClass} w-full`}>
              Send to Text — Setup Required
            </button>
            <p role="status" className="text-sm leading-6 text-amber-800">
              SMS is disabled because no approved provider, registration, or
              consent workflow is configured. No text was sent.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}

export function RefreshHandoffDeliveryForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    refreshHandoffDeliveryAction,
    {
      ok: false,
      status: "idle",
      message: "",
    } satisfies HandoffDeliveryActionState,
  );
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="deliveryId" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
      >
        {pending ? "Checking…" : "Check provider status"}
      </button>
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className="mt-2 text-sm text-[var(--muted)]"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function DeactivateHandoffForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(
    deactivateHandoffAction,
    initialState,
  );
  const [confirming, setConfirming] = useState(false);
  return (
    <form action={action} className="mt-4">
      <input type="hidden" name="id" value={id} />
      {state.ok ? (
        <p role="status" className="text-sm text-[var(--muted)]">
          {state.message}
        </p>
      ) : (
        <>
          {confirming ? (
            <p className="mb-3 text-sm leading-6 text-[var(--muted)]">
              Deactivate this handoff link? Anyone with the link will lose
              access to the completion page. The client&apos;s website stays
              online.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {confirming ? (
              <>
                <button
                  key="confirm-deactivation"
                  type="submit"
                  disabled={pending}
                  className="min-h-11 rounded-xl border border-red-300/40 px-4 py-2 text-sm text-red-800 hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-red-800 disabled:opacity-50"
                >
                  {pending ? "Deactivating…" : "Confirm deactivation"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirming(false)}
                  className="min-h-11 rounded-xl px-4 py-2 text-sm text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                key="request-deactivation"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setConfirming(true);
                }}
                className="min-h-11 rounded-xl border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              >
                Deactivate link
              </button>
            )}
          </div>
          {state.message ? (
            <p role="alert" className="mt-3 text-sm text-red-800">
              {state.message}
            </p>
          ) : null}
        </>
      )}
    </form>
  );
}
