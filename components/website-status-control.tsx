"use client";

import { useActionState } from "react";

import {
  updateWebsiteStatusAction,
  type WebsiteStatusActionState,
} from "@/app/admin/(protected)/website-status/actions";

export function WebsiteStatusControl({ online }: { online: boolean }) {
  const initialState: WebsiteStatusActionState = { ok: false, message: "" };
  const [state, action, pending] = useActionState(
    updateWebsiteStatusAction,
    initialState,
  );
  const displayedOnline = state.online ?? online;
  return (
    <form action={action} className="glass-card p-5 sm:p-6">
      <fieldset disabled={pending}>
        <legend className="text-lg font-semibold text-white">
          Website Status
        </legend>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Current status: {displayedOnline ? "Online" : "Temporarily Offline"}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            name="websiteStatus"
            value="online"
            aria-pressed={displayedOnline}
            className={`min-h-12 rounded-xl border px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:opacity-50 ${displayedOnline ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-100" : "border-white/15 text-slate-200 hover:bg-white/10"}`}
          >
            Online
          </button>
          <button
            type="submit"
            name="websiteStatus"
            value="offline"
            aria-pressed={!displayedOnline}
            className={`min-h-12 rounded-xl border px-5 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:opacity-50 ${!displayedOnline ? "border-amber-300/60 bg-amber-300/15 text-amber-100" : "border-white/15 text-slate-200 hover:bg-white/10"}`}
          >
            Temporarily Offline
          </button>
        </div>
      </fieldset>
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`mt-4 text-sm ${state.ok ? "text-blue-200" : "text-red-200"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
