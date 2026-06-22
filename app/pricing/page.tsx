import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { serviceOfferings } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#A78D80]">
            Solutions
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Choose The Right Solution For Your Business
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Whether you&apos;re just getting started or need advanced web functionality,
            we have a solution built for you.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {serviceOfferings.map((pkg) => (
            <PricingCard key={pkg.name} tier={pkg} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-[var(--muted)]">
          Scope, pricing, and recommendations may vary based on your business goals,
          launch needs, and any advanced functionality required.
        </p>
      </PageContainer>
    </section>
  );
}
