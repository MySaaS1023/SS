import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { pricingPlans } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export default function PricingPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Simple plans for building your website with AI.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Start small, customize your site, and upgrade when your website needs
            more pages, branding, and publishing tools.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`glass-card flex flex-col p-6 ${
                plan.featured
                  ? "border-[rgba(79,140,255,0.46)] shadow-[0_0_42px_rgba(20,115,255,0.18)]"
                  : ""
              }`}
            >
              {plan.featured ? (
                <span className="mb-5 w-fit rounded-full bg-[rgba(79,140,255,0.16)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">
                  Popular
                </span>
              ) : null}
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                {plan.price}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-white">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`${
                  plan.featured ? primaryButtonClass : secondaryButtonClass
                } force-white-btn mt-8 justify-center text-sm`}
              >
                {plan.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
