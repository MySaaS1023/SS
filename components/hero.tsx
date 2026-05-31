import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-18 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-10 h-56 w-56 rounded-full bg-[#3B82F6]/25 blur-[90px]" />
        <div className="absolute right-[-4rem] top-8 h-64 w-64 rounded-full bg-[#8B5CF6]/22 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-[#3B82F6]/12 blur-[100px]" />
      </div>

      <PageContainer className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="glass-panel inline-flex rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#c7d2fe] shadow-sm">
            Beginner-friendly support for launching with clarity
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.9rem]">
              Launch Your Business With Confidence
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              From business setup to a professional website, Steady Start helps new
              entrepreneurs build a strong foundation and get online with clarity.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className={`${primaryButtonClass} force-white-btn text-sm`}
            >
              Start Your Launch
            </Link>
            <Link href="/pricing" className={`${secondaryButtonClass} text-sm`}>
              View Bundles
            </Link>
          </div>
        </div>

        <div className="relative min-h-[470px]">
          <div className="absolute right-6 top-0 h-24 w-24 rounded-full bg-[#8B5CF6]/20 blur-3xl" />
          <div className="absolute left-8 top-12 h-24 w-24 rounded-full bg-[#3B82F6]/25 blur-3xl" />

          <div className="glass-panel absolute left-0 top-24 z-10 w-[62%] rounded-[1.8rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c7d2fe]">
                  Client Project
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  Launch plan mapped and ready
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Business setup, website direction, and next launch steps are in
                  place.
                </p>
              </div>
              <span className="rounded-full bg-[#3B82F6]/20 px-3 py-1 text-xs font-semibold text-[#bfdbfe]">
                Ready
              </span>
            </div>
          </div>

          <div className="glass-panel absolute right-0 top-0 w-[72%] rounded-[1.9rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#ddd6fe]">
              Website Preview
            </p>

            <div className="relative mt-4 rounded-[1.4rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="h-2.5 w-12 rounded-full bg-white/30" />
                  <div className="flex gap-2">
                    <div className="h-2.5 w-8 rounded-full bg-white/18" />
                    <div className="h-2.5 w-8 rounded-full bg-white/18" />
                    <div className="h-2.5 w-8 rounded-full bg-white/18" />
                  </div>
                </div>

                <div className="mt-4 rounded-[1rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.22))] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      Your Business, Built Right
                    </p>
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      Live
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-3/4 rounded-full bg-white/20" />
                  <div className="mt-2 h-2.5 w-1/2 rounded-full bg-white/16" />
                  <div className="mt-4 inline-flex rounded-full bg-white/14 px-3 py-1.5 text-[11px] font-medium text-white">
                    Start Launch
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-[1.08fr_0.92fr] gap-3">
                  <div className="rounded-[1rem] bg-white/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#dbeafe]">
                      Setup
                    </p>
                    <div className="mt-3 space-y-2.5">
                      <div className="h-2.5 w-2/3 rounded-full bg-white/22" />
                      <div className="h-10 rounded-[0.8rem] bg-white/10" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 rounded-[0.8rem] bg-white/10" />
                        <div className="h-10 rounded-[0.8rem] bg-white/10" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1rem] bg-white/8 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ddd6fe]">
                      Launch Path
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-[0.8rem] border border-dashed border-white/15 bg-white/6 p-2">
                        <div className="h-2 w-8 rounded-full bg-white/20" />
                        <div className="mt-2 h-7 rounded-[0.65rem] bg-white/8" />
                      </div>
                      <div className="rounded-[0.8rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.2))] p-2">
                        <div className="h-2 w-10 rounded-full bg-white/28" />
                        <div className="mt-2 h-7 rounded-[0.65rem] bg-white/12" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[0.95rem] bg-white/8 p-3">
                    <div className="h-2.5 w-1/2 rounded-full bg-white/22" />
                    <div className="mt-3 h-12 rounded-[0.8rem] bg-white/10" />
                  </div>
                  <div className="rounded-[0.95rem] bg-white/8 p-3">
                    <div className="h-2.5 w-1/2 rounded-full bg-white/22" />
                    <div className="mt-3 h-12 rounded-[0.8rem] bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel absolute bottom-3 right-10 w-[58%] rounded-[1.8rem] border border-[rgba(255,255,255,0.12)] p-5 shadow-[var(--shadow)]">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c7d2fe]">
              Website Launch
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white">Live and ready for customers</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Published, branded, and visible online
                </p>
              </div>

              <div className="rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-[52%] rounded-[0.9rem] bg-white/8 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-white/35" />
                      <span className="h-2 w-2 rounded-full bg-white/18" />
                      <span className="h-2 w-2 rounded-full bg-white/18" />
                    </div>
                    <div className="mt-3 h-2.5 w-3/4 rounded-full bg-white/28" />
                    <div className="mt-2 h-7 rounded-[0.7rem] bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.2))]" />
                  </div>

                  <div className="flex flex-1 items-center justify-center px-2">
                    <div className="relative h-8 w-14">
                      <div className="absolute left-0 top-1/2 h-0.5 w-10 -translate-y-1/2 bg-[#bfdbfe]" />
                      <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-[#bfdbfe]" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(59,130,246,0.12)] shadow-[0_0_24px_rgba(59,130,246,0.18)]">
                      <span className="text-lg font-semibold text-white/90">G</span>
                    </div>
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#dbeafe]">
                      Google
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
                  <span>Launch support ready</span>
                  <span>90%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[90%] rounded-full bg-[#3B82F6]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
