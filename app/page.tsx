import { CtaBanner } from "@/components/cta-banner";
import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { ProcessSection } from "@/components/process-section";
import { pricingPackages, valueProps } from "@/lib/site-data";

const featureCards = [
  "Custom-built website",
  "No DIY setup",
  "Fast launch",
  "Payment integration",
  "Booking or service setup",
  "Clean professional design",
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="py-6 sm:py-8">
        <PageContainer>
          <div className="glass-panel rounded-[1.75rem] border border-[rgba(255,255,255,0.1)] px-6 py-4 text-center shadow-[var(--shadow)]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#c7d2fe]">
              Trusted by small businesses and startups
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
              What You Get
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Everything you need to launch without piecing together a platform stack.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((item, index) => (
              <div
                key={item}
                className="glass-panel rounded-[1.8rem] border border-[rgba(255,255,255,0.1)] p-6 shadow-[var(--shadow)] transition duration-200 hover:-translate-y-1"
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
          <ProcessSection />
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#ddd6fe]">
                Pricing
              </p>
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
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
              Why Steady Start
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Built for founders who want a real website, not another learning curve.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="glass-panel rounded-[1.8rem] border border-[rgba(255,255,255,0.1)] p-6 shadow-[var(--shadow)] transition duration-200 hover:-translate-y-1"
              >
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <CtaBanner />
    </>
  );
}
