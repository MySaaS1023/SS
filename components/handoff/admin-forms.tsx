"use client";

import { useActionState, useState } from "react";
import {
  createHandoffAction,
  deactivateHandoffAction,
} from "@/app/admin/(protected)/handoffs/actions";
import type { HandoffActionState } from "@/app/admin/(protected)/handoffs/actions";

const initialState: HandoffActionState = { ok: false, message: "" };
const inputClass =
  "mt-2 w-full rounded-xl border border-white/20 bg-[#0f172a] px-4 py-3 text-white focus:outline-2 focus:outline-blue-300 disabled:opacity-50";
const buttonClass =
  "min-h-11 rounded-xl bg-[#3b82f6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2563eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:opacity-50";

export function CreateHandoffForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(
    createHandoffAction,
    initialState,
  );
  return (
    <form action={action} className="glass-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white">
        Create a client handoff
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        One link, ready for your client. Use only information you intend the
        recipient to see.
      </p>
      <fieldset
        disabled={disabled || pending}
        className="mt-5 space-y-4 disabled:opacity-60"
      >
        <legend className="sr-only">Client website details</legend>
        <label className="block text-sm font-medium text-slate-200">
          Business name
          <input
            name="businessName"
            required
            maxLength={120}
            autoComplete="organization"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-slate-200">
          Completed website URL
          <input
            name="websiteUrl"
            type="url"
            required
            maxLength={2048}
            placeholder="https://www.example.com"
            aria-describedby="website-help"
            className={inputClass}
          />
        </label>
        <p id="website-help" className="text-xs leading-6 text-slate-400">
          Use the complete public HTTPS address. Avoid login links, passwords,
          or private URLs.
        </p>
        <label className="block text-sm font-medium text-slate-200">
          Personalized message{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <textarea
            name="message"
            maxLength={1500}
            rows={5}
            aria-describedby="message-help"
            className={inputClass}
          />
        </label>
        <p id="message-help" className="text-xs leading-6 text-slate-400">
          Up to 1,500 characters. Do not include passwords, billing information,
          or other sensitive details.
        </p>
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
          className={`mt-4 text-sm leading-7 ${state.ok ? "text-[#bfdbfe]" : "text-red-200"}`}
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
        <p role="status" className="text-sm text-slate-300">
          {state.message}
        </p>
      ) : (
        <>
          {confirming ? (
            <p className="mb-3 text-sm leading-6 text-slate-300">
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
                  className="min-h-11 rounded-xl border border-red-300/40 px-4 py-2 text-sm text-red-200 hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-red-200 disabled:opacity-50"
                >
                  {pending ? "Deactivating…" : "Confirm deactivation"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setConfirming(false)}
                  className="min-h-11 rounded-xl px-4 py-2 text-sm text-slate-300 focus-visible:outline-2 focus-visible:outline-blue-300"
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
                className="min-h-11 rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-300"
              >
                Deactivate link
              </button>
            )}
          </div>
          {state.message ? (
            <p role="alert" className="mt-3 text-sm text-red-200">
              {state.message}
            </p>
          ) : null}
        </>
      )}
    </form>
  );
}
