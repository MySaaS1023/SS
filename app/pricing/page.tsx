import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { pricingPackages } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Choose the website package that fits your launch stage.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Every package is designed for a done-for-you website build with the final
            setup shaped around your business goals, offers, and launch needs.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPackages.map((pkg) => (
            <PricingCard key={pkg.name} tier={pkg} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-[var(--muted)]">
          Project scope depends on package selected and final business needs.
        </p>
      </PageContainer>
    </section>
  );
}
