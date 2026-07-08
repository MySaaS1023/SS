import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { serviceOfferings } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#a5b4fc]">
            Solutions
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Choose The Right Foundation For Your Business
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Start with setup, website, or advanced systems support while Steady
            Start grows into the all-in-one platform for service and product businesses.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {serviceOfferings.map((pkg) => (
            <PricingCard key={pkg.name} tier={pkg} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm leading-6 text-[var(--muted)]">
          Scope, pricing, and recommendations may vary based on your operating
          needs, launch stage, and any advanced platform functionality required.
        </p>
      </PageContainer>
    </section>
  );
}
