"use client";
import { useActionState } from "react";
import type { ManagedSocialSettings } from "@/lib/social-settings-core";
import { saveSocialSettingsAction } from "./actions";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] focus:outline-2 focus:outline-[var(--primary)]";
export function SocialSettingsForm({
  value,
}: {
  value: ManagedSocialSettings;
}) {
  const [state, action, pending] = useActionState(saveSocialSettingsAction, {
    ok: false,
    message: "",
  });
  const fields = [
    ["facebook", "Facebook business URL"],
    ["youtube", "YouTube business URL"],
    ["instagram", "Instagram business URL"],
    ["tiktok", "TikTok business URL"],
    ["googleBusinessProfileUrl", "Google Business Profile URL"],
    ["googleReviewUrl", "Google official direct review URL"],
  ] as const;
  return (
    <form action={action} className="glass-card mt-6 p-5 sm:p-8">
      <input type="hidden" name="version" value={value.version} />
      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        Central review &amp; social settings
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
        These public links are shared by the homepage, footer, client handoffs
        and /connect. Leave an unavailable business account blank. A Google
        listing or sharing link is not an official direct review URL.
      </p>
      <fieldset
        disabled={pending}
        className="mt-5 space-y-5 disabled:opacity-60"
      >
        {fields.map(([name, label]) => (
          <label
            key={name}
            className="block text-sm font-medium text-[var(--muted)]"
          >
            {label}
            <input
              name={name}
              type="url"
              maxLength={2048}
              defaultValue={value.settings[name] ?? ""}
              className={fieldClass}
              placeholder="https://…"
            />
            <span className="mt-1 block text-xs text-[var(--muted)]">
              {value.settings[name]
                ? name === "googleReviewUrl" &&
                  !value.settings.googleBusinessProfileVerifiedEligible
                  ? "Configured — hidden until the official review URL is verified"
                  : name === "googleBusinessProfileUrl" &&
                      !value.settings.googleBusinessProfileVerified
                    ? "Configured — hidden until the business profile is verified"
                    : "Configured"
                : "Unconfigured — button unpublished"}
            </span>
          </label>
        ))}
        <label className="flex min-h-11 items-start gap-3 text-sm leading-7 text-[var(--muted)]">
          <input
            type="checkbox"
            name="googleBusinessProfileVerified"
            value="yes"
            defaultChecked={
              value.settings.googleBusinessProfileVerified ?? false
            }
            className="mt-1.5 h-5 w-5 accent-[var(--primary)]"
          />
          I verified that the Google Business Profile belongs to Steady Start
          LLC.
        </label>
        <label className="flex min-h-11 items-start gap-3 text-sm leading-7 text-[var(--muted)]">
          <input
            type="checkbox"
            name="googleBusinessProfileVerifiedEligible"
            value="yes"
            defaultChecked={
              value.settings.googleBusinessProfileVerifiedEligible
            }
            className="mt-1.5 h-5 w-5 accent-[var(--primary)]"
          />
          I verified this is the official direct review URL for Steady Start’s
          eligible Google Business Profile.
        </label>
        <label className="flex min-h-11 items-start gap-3 text-sm leading-7 text-[var(--muted)]">
          <input
            type="checkbox"
            name="businessAccountsConfirmed"
            value="yes"
            required
            className="mt-1.5 h-5 w-5 accent-[var(--primary)]"
          />
          I confirmed the social links are Steady Start business accounts, not
          personal profiles.
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save social settings"}
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
  );
}
