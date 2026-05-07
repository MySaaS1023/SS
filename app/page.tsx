import Link from "next/link";

import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { primaryButtonClass } from "@/lib/styles";
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
      <Hero />

      <section className="pb-4 sm:pb-6">
        <PageContainer>
          <div className="glass-card flex flex-col gap-5 rounded-[1.75rem] border border-[rgba(139,92,246,0.18)] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(59,130,246,0.08))] px-5 py-5 shadow-[0_18px_40px_rgba(59,130,246,0.12)] sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
                In honor of Mother&apos;s Day
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.9rem]">
                <span className="bg-[linear-gradient(90deg,#bfdbfe,#c4b5fd)] bg-clip-text text-transparent">
                  10% Off
                </span>{" "}
                All Website Packages This Month
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                A limited-time offer for business owners ready to skip the DIY route
                and launch with professional support.
              </p>
            </div>

            <div className="flex shrink-0 items-center">
              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn px-5 py-3 text-sm`}
              >
                Claim Offer
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

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

          <div className="mt-6 rounded-2xl border border-[rgba(59,130,246,0.18)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_12px_30px_rgba(59,130,246,0.08)] sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[#bfdbfe]">10% Off</span> all
                website packages this month.
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-[#c4b5fd]">
                In honor of Mother&apos;s Day
              </p>
            </div>
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
