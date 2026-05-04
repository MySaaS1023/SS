import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { pricingPackages } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <section className="bg-[var(--surface-muted)] py-16 sm:py-20">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
            Choose the package that matches your next stage.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Every package is designed for a done-for-you website build, with the final
            project shaped around your business goals.
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
