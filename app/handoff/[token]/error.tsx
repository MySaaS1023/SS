"use client";

import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";

export default function HandoffErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer>
        <div className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10">
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            We couldn&apos;t load your handoff
          </h1>
          <p className="mt-5 leading-8 text-[var(--muted)]">
            Please try again shortly. If you need help, contact Steady Start.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={reset}
              className="min-h-11 rounded-xl bg-[var(--primary)] px-5 py-3 text-white focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              Try again
            </button>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex min-h-11 items-center px-5 py-3 text-[var(--primary)] underline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              Contact Steady Start
            </a>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
