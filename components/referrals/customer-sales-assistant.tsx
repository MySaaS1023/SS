"use client";

import { useState } from "react";

import type { CustomerPreferences } from "@/lib/referrals/customer-journey";
import type { ServiceKey } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

type AssistantResponse = {
  reply: string;
  recommendedService: ServiceKey | "recommend";
  reason: string;
  followUpQuestions: string[];
  escalate: boolean;
};

export function CustomerSalesAssistant({
  token,
  customerFirstName,
  representativeName,
  preferences,
  onRecommendation,
}: {
  token: string;
  customerFirstName?: string;
  representativeName?: string;
  preferences: CustomerPreferences;
  onRecommendation?: (service: ServiceKey | "recommend") => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (loading || !question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/customer-journey/${encodeURIComponent(token)}/assistant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, preferences }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as Partial<
        AssistantResponse & { error: string }
      >;
      if (!response.ok || !result.reply || !result.recommendedService) {
        setError(
          result.error ??
            "AI assistance is temporarily unavailable. You can continue with the form or contact Steady Start.",
        );
        return;
      }
      setAnswer(result as AssistantResponse);
    } catch {
      setError(
        "AI assistance is temporarily unavailable. You can continue with the form or contact Steady Start.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-card mt-8 p-6 sm:p-8">
      <p className="section-kicker">Optional AI Assistance</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        {customerFirstName
          ? `${customerFirstName}, ask about Steady Start services`
          : "Ask about Steady Start services"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Ask a service question or describe what you want to build. The standard
        form below remains available at all times. Never enter card information,
        passwords, or sensitive identifiers here.
      </p>
      {representativeName ? (
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your Referral Partner is {representativeName}.
        </p>
      ) : null}
      <label className="mt-5 block text-sm font-medium text-white">
        What would you like help choosing?
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value.slice(0, 1_000))}
          rows={3}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)]"
          placeholder="Example: I need a website with customer accounts and appointment scheduling."
        />
      </label>
      <button
        type="button"
        disabled={loading || !question.trim()}
        onClick={() => void ask()}
        className={`${primaryButtonClass} force-white-btn mt-4 disabled:pointer-events-none disabled:opacity-60`}
      >
        {loading ? "Reviewing your needs..." : "Ask Steady Start AI"}
      </button>
      {error ? <p className="mt-4 text-sm text-[#fca5a5]">{error}</p> : null}
      {answer ? (
        <div className="mt-5 rounded-2xl border border-[rgba(79,140,255,0.24)] bg-[rgba(79,140,255,0.07)] p-5">
          <p className="text-sm leading-7 text-white">{answer.reply}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {answer.reason}
          </p>
          {answer.recommendedService !== "recommend" ? (
            <button
              type="button"
              onClick={() => onRecommendation?.(answer.recommendedService)}
              className="mt-4 text-sm font-semibold text-[#93c5fd] hover:text-white"
            >
              Use this recommendation
            </button>
          ) : null}
          {answer.followUpQuestions.length ? (
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {answer.followUpQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {answer.escalate ? (
            <p className="mt-4 text-sm text-white">
              This request needs human review. Email{" "}
              <a
                className="font-semibold text-[#93c5fd]"
                href="mailto:support@steadystartco.com"
              >
                support@steadystartco.com
              </a>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
