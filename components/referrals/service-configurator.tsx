"use client";

import { useMemo } from "react";

import {
  type CustomerPreferences,
  recommendServiceFromPreferences,
} from "@/lib/referrals/customer-journey";
import type { ServiceKey } from "@/lib/site-data";

type Selection = ServiceKey | "recommend" | "";

const checkboxQuestions: Array<{
  key: keyof CustomerPreferences;
  label: string;
}> = [
  { key: "needsBusinessSetup", label: "I need help setting up my business" },
  { key: "needsBooking", label: "I need appointment booking" },
  { key: "needsCommerce", label: "I need a shopping cart" },
  { key: "needsAccounts", label: "Customers need secure accounts" },
  { key: "needsDashboard", label: "I need a customer dashboard" },
  { key: "needsDatabase", label: "The website needs a database" },
  { key: "needsCrm", label: "I need CRM integration" },
  { key: "needsPayments", label: "I need online payment integration" },
  { key: "needsAutomation", label: "I want to automate business tasks" },
  { key: "needsChatbot", label: "A chatbot may help my customers" },
  { key: "needsNotifications", label: "I need customer notifications" },
];

export function ServiceConfigurator({
  preferences,
  selectedService,
  onChange,
  onSelect,
}: {
  preferences: CustomerPreferences;
  selectedService: Selection;
  onChange: (preferences: CustomerPreferences) => void;
  onSelect: (selection: Selection) => void;
}) {
  const recommendation = useMemo(
    () => recommendServiceFromPreferences(preferences),
    [preferences],
  );
  const showWebsiteQuestions =
    selectedService === "standard-website" ||
    selectedService === "premium-website" ||
    selectedService === "complete-business-launch";
  const showBusinessSetupQuestions =
    selectedService === "business-setup" ||
    selectedService === "complete-business-launch" ||
    preferences.needsBusinessSetup === true;

  function setPreference(
    key: keyof CustomerPreferences,
    value: string | boolean | string[],
  ) {
    onChange({ ...preferences, [key]: value });
  }

  return (
    <section className="mt-8 rounded-3xl border border-[rgba(79,140,255,0.24)] bg-[rgba(79,140,255,0.07)] p-5 sm:p-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
        Smart Service Guide
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Tell us what your business needs
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        These choices help match your project to the published Steady Start
        packages. You can still choose any service yourself.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {checkboxQuestions.map((question) => (
          <label
            key={question.key}
            className="flex cursor-pointer gap-3 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(255,255,255,0.04)] p-3 text-sm leading-6 text-white"
          >
            <input
              type="checkbox"
              checked={preferences[question.key] === true}
              onChange={(event) =>
                setPreference(question.key, event.target.checked)
              }
              className="mt-1 h-4 w-4 shrink-0 accent-[#3B82F6]"
            />
            <span>{question.label}</span>
          </label>
        ))}
      </div>

      {showWebsiteQuestions ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-white">
            Website type
            <select
              value={String(preferences.websiteType ?? "")}
              onChange={(event) =>
                setPreference("websiteType", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white"
            >
              <option value="">Select one</option>
              <option value="service">Service business</option>
              <option value="store">Online store</option>
              <option value="portfolio">Portfolio or informational site</option>
              <option value="membership">Membership or customer portal</option>
            </select>
          </label>
          <label className="text-sm font-medium text-white">
            Branding readiness
            <select
              value={String(preferences.hasBranding ?? "")}
              onChange={(event) =>
                setPreference("hasBranding", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white"
            >
              <option value="">Select one</option>
              <option value="yes">I have a logo and brand direction</option>
              <option value="partial">I have some brand materials</option>
              <option value="no">I need help with branding</option>
            </select>
          </label>
          <label className="text-sm font-medium text-white">
            Pages needed
            <input
              value={String(preferences.pagesNeeded ?? "")}
              onChange={(event) =>
                setPreference("pagesNeeded", event.target.value)
              }
              placeholder="Example: Home, About, Services, Contact"
              maxLength={240}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)]"
            />
          </label>
          <label className="text-sm font-medium text-white">
            Important integrations
            <input
              value={String(preferences.integrations ?? "")}
              onChange={(event) =>
                setPreference("integrations", event.target.value)
              }
              placeholder="Example: calendar, CRM, email platform"
              maxLength={240}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)]"
            />
          </label>
          <label className="text-sm font-medium text-white">
            Search visibility priority
            <select
              value={String(preferences.seoPriority ?? "")}
              onChange={(event) =>
                setPreference("seoPriority", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white"
            >
              <option value="">Select one</option>
              <option value="basic">Basic search setup</option>
              <option value="local">Local search visibility</option>
              <option value="advanced">Expanded SEO support</option>
            </select>
          </label>
          <label className="text-sm font-medium text-white">
            Scheduling tools
            <input
              value={String(preferences.needsScheduling ?? "")}
              onChange={(event) =>
                setPreference("needsScheduling", event.target.value)
              }
              placeholder="Example: Calendly or Acuity"
              maxLength={240}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)]"
            />
          </label>
        </div>
      ) : null}

      {showBusinessSetupQuestions ? (
        <div className="mt-5">
          <label className="text-sm font-medium text-white">
            Business formation state
            <input
              value={String(preferences.businessState ?? "")}
              onChange={(event) =>
                setPreference("businessState", event.target.value)
              }
              placeholder="Example: Colorado"
              maxLength={80}
              className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-[var(--muted)] sm:max-w-md"
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            State requirements and pricing are confirmed by Steady Start. This
            guide does not provide legal or formation guarantees.
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-[rgba(147,197,253,0.22)] bg-[#0b1224] p-4">
        <p className="text-sm font-semibold text-[#bfdbfe]">Recommendation</p>
        <p className="mt-2 text-sm leading-6 text-white">
          {recommendation.reason}
        </p>
        {recommendation.service !== "recommend" ? (
          <button
            type="button"
            onClick={() => onSelect(recommendation.service)}
            className="mt-4 text-sm font-semibold text-[#93c5fd] transition hover:text-white"
          >
            Select this recommendation
          </button>
        ) : null}
      </div>
    </section>
  );
}
