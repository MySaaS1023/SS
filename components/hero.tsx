import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

const highlights = [
  "Custom structure and design",
  "Payment-ready setup",
  "Built around your business goals",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14">
      <PageContainer>
        <div className="max-w-4xl space-y-6">
          <span className="inline-flex rounded-full border border-[rgba(37,99,235,0.12)] bg-[var(--surface)] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent-strong)] shadow-sm">
            Done-for-you websites for serious small businesses
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Get a custom website built for your business.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Steady Start helps business owners launch online with professionally built
              websites, payment setup, and the right functionality without figuring it
              all out alone.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/pricing"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              View Pricing
            </Link>
            <Link
              href="/get-started"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              Get Started
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,251,255,0.95))] px-4 py-4 text-sm font-medium text-[var(--foreground)] shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
