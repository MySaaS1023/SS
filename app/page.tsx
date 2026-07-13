import Link from "next/link";

import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { serviceOfferings, whyChooseItems } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="services" className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-3xl">
            <p className="section-kicker">Services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Choose The Right Solution For Your Business
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Whether you&apos;re just getting started or need advanced web
              functionality, we have a solution built for you.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {serviceOfferings.map((solution) => (
              <PricingCard key={solution.key} tier={solution} />
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">Advanced Custom Work</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Need Something More Advanced?
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                  We also support custom web projects like booking systems,
                  dashboards, client portals, membership sites, and custom business
                  applications.
                </p>
              </div>

              <div className="flex shrink-0">
                <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
                  Request a Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pt-2 pb-10 sm:pt-4 sm:pb-14 lg:pt-4 lg:pb-16">
        <PageContainer>
          <div className="rounded-[1.8rem] border border-[rgba(148,163,184,0.14)] bg-[rgba(15,23,42,0.72)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.26)] sm:px-8 sm:py-8">
            <div className="max-w-2xl">
              <p className="section-kicker">Why Steady Start</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Why Choose Steady Start?
              </h2>
            </div>

            <div className="mt-8 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
              {whyChooseItems.map((reason) => (
                <div
                  key={reason.title}
                  className="glass-card flex h-full flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(139,92,246,0.22)] hover:shadow-[0_18px_40px_rgba(139,92,246,0.12)]"
                >
                  <p className="text-xl font-semibold text-white">{reason.title}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn text-sm`}
              >
                Start Your Business
              </Link>
              <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
                Get Business Setup Help
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
