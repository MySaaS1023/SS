import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const highlights = [
  "Custom website build",
  "Payment and booking setup",
  "Launch support without DIY tools",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-18 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-10 h-56 w-56 rounded-full bg-[#3B82F6]/25 blur-[90px]" />
        <div className="absolute right-[-4rem] top-8 h-64 w-64 rounded-full bg-[#8B5CF6]/22 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-[#3B82F6]/12 blur-[100px]" />
      </div>

      <PageContainer className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-7">
          <span className="glass-panel inline-flex rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#c7d2fe] shadow-sm">
            Launch-ready websites for small businesses
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.9rem]">
              Launch Your Business Website Without the DIY Stress
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              We build custom, launch-ready websites so you don&apos;t have to deal
              with Wix, Shopify, or anything technical.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className={`${primaryButtonClass} force-white-btn text-sm`}
            >
              Get Started
            </Link>
            <Link href="/pricing" className={`${secondaryButtonClass} text-sm`}>
              View Packages
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="glass-panel rounded-[1.4rem] border border-[rgba(255,255,255,0.1)] px-4 py-4 text-sm font-medium text-white shadow-[var(--shadow)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px]">
          <div className="absolute right-6 top-0 h-24 w-24 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="absolute left-8 top-12 h-24 w-24 rounded-full bg-[#3B82F6]/25 blur-3xl" />

          <div className="glass-panel absolute left-0 top-16 w-[72%] rounded-[1.8rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c7d2fe]">
                  Payment Card
                </p>
                <p className="mt-3 text-lg font-semibold text-white">$200 secured</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Business package ready to move into build.
                </p>
              </div>
              <span className="rounded-full bg-[#3B82F6]/20 px-3 py-1 text-xs font-semibold text-[#bfdbfe]">
                Paid
              </span>
            </div>
          </div>

          <div className="glass-panel absolute right-0 top-0 w-[68%] rounded-[1.9rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ddd6fe]">
              Website Preview
            </p>
            <div className="mt-4 rounded-[1.4rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-6 w-3/4 rounded-full bg-white/10" />
                <div className="h-20 rounded-[1rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.22))]" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-14 rounded-[1rem] bg-white/8" />
                  <div className="h-14 rounded-[1rem] bg-white/8" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel absolute bottom-4 right-10 w-[56%] rounded-[1.8rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c7d2fe]">
              Analytics
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>Launch progress</span>
                  <span>86%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[86%] rounded-full bg-[#3B82F6]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-14 rounded-[1rem] bg-white/8" />
                <div className="h-20 rounded-[1rem] bg-[#8B5CF6]/16" />
                <div className="h-10 rounded-[1rem] bg-white/8" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
