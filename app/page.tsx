import { CtaBanner } from "@/components/cta-banner";
import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { ProcessSection } from "@/components/process-section";
import { pricingPackages, valueProps } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="bg-[var(--surface-cream)] py-8 sm:py-12">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Why Steady Start
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
              Built for business owners who want real support, not more setup work.
            </h2>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm"
              >
                <p className="text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-[var(--surface-muted)] py-8 sm:py-12">
        <PageContainer>
          <ProcessSection />
        </PageContainer>
      </section>

      <section className="bg-white py-8 sm:py-12">
        <PageContainer>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Pricing Preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
                Clear packages for getting your business online faster.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
              Project scope depends on package selected and final business needs.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {pricingPackages.map((pkg) => (
              <PricingCard key={pkg.name} tier={pkg} />
            ))}
          </div>
        </PageContainer>
      </section>

      <CtaBanner />
    </>
  );
}
