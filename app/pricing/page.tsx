import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { OceanHero } from "@/components/ocean-brand";
import { serviceOfferings } from "@/lib/site-data";

const packageOrder = [
  "standard-website",
  "premium-website",
  "business-setup",
  "complete-business-launch",
];

export default function PricingPage() {
  return (
    <div className="public-ocean-page board-pricing-page">
      <OceanHero
        eyebrow="Solutions"
        title="Choose the Right Solution for Your Business"
        description={
          <>
            Whether you&apos;re just getting started or need advanced web
            functionality, we have a solution built for you.
          </>
        }
      />
      <section className="ocean-content">
        <PageContainer>
          <div className="board-pricing-grid">
            {packageOrder
              .map((key) => serviceOfferings.find((pkg) => pkg.key === key)!)
              .map((pkg) => (
                <PricingCard key={pkg.name} tier={pkg} />
              ))}
          </div>
          <p className="board-pricing-note">
            Scope, pricing, and recommendations may vary based on your business
            goals, launch needs, and any advanced functionality required.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}
