import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { pricingPackages, valueProps } from "@/lib/site-data";

const featureCards = [
  "Custom-built website",
  "No DIY setup",
  "Fast launch",
  "Payment integration",
  "Product or service setup",
  "Clean professional design",
];

export default function HomePage() {
  return (
    <>
      <section className="pt-5 sm:pt-6">
        <PageContainer>
          <div className="mx-auto max-w-5xl">
            <div className="glass-card relative overflow-hidden rounded-[1.8rem] border border-[rgba(244,114,182,0.22)] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(236,72,153,0.08),rgba(139,92,246,0.08))] px-4 py-3.5 shadow-[0_20px_48px_rgba(139,92,246,0.14)] sm:px-6 sm:py-4 lg:px-7">
              <div className="pointer-events-none absolute -left-8 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[rgba(244,114,182,0.18)] blur-2xl" />
              <div className="pointer-events-none absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[rgba(139,92,246,0.16)] blur-2xl" />

              <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(244,114,182,0.22)] bg-[linear-gradient(135deg,rgba(244,114,182,0.12),rgba(139,92,246,0.12))] text-base shadow-[0_0_28px_rgba(244,114,182,0.12)] sm:h-11 sm:w-11 sm:text-lg">
                    <span aria-hidden="true">♡</span>
                  </div>

                  <div className="max-w-3xl">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f9a8d4]">
                      In honor of Mother&apos;s Day
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6 text-white sm:text-lg sm:leading-7">
                      Mother&apos;s Day Special{" "}
                      <span className="font-semibold text-[#f9a8d4]">
                        — 20% off business website packages this month.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 items-center sm:w-auto">
                  <div className="w-full rounded-2xl border border-[rgba(244,114,182,0.24)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 shadow-[0_10px_24px_rgba(139,92,246,0.12)] sm:w-auto sm:px-4 sm:py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9a8d4]">
                      Code
                    </p>
                    <p className="mt-1 break-words font-mono text-sm font-semibold tracking-[0.14em] text-white sm:text-base sm:tracking-[0.16em]">
                      MOTHERSDAY
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <Hero />

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="section-kicker">What You Get</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Everything you need to launch without piecing together a platform stack.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((item, index) => (
              <div
                key={item}
                className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(59,130,246,0.26)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.12)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(59,130,246,0.15)] font-mono text-sm font-semibold text-[#bfdbfe]">
                  0{index + 1}
                </span>
                <p className="mt-5 text-xl font-semibold text-white">{item}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Steady Start handles the setup work so your launch feels clear,
                  credible, and ready for real business use.
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker">Pricing</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Choose the level of build support your launch needs.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--muted)]">
              Start small, go bigger, or hand off the full launch. The core goal stays
              the same: get online without the DIY bottleneck.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {pricingPackages.map((pkg) => (
              <PricingCard key={pkg.key} tier={pkg} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="section-kicker">Why Steady Start</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Built for founders who want a real website, not another learning curve.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(139,92,246,0.22)] hover:shadow-[0_18px_40px_rgba(139,92,246,0.12)]"
              >
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
