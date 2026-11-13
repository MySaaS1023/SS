import { publicPageMetadata, organizationStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/structured-data";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeConnectSection } from "@/components/connect/home-connect-section";
import { HomeIcon } from "@/components/home-icon";
import { PageContainer } from "@/components/page-container";
import { serviceOfferings, whyChooseItems } from "@/lib/site-data";
import { getSocialSettings } from "@/lib/social-settings";
import { OceanEmblem } from "@/components/ocean-brand";
import { PricingCard } from "@/components/pricing-card";

export const metadata = publicPageMetadata("/");


const packageOrder = [
  "standard-website",
  "premium-website",
  "business-setup",
  "complete-business-launch",
];

const categories = [
  {
    title: "Custom Websites",
    kind: "monitor",
    href: "/pricing",
    description:
      "Professional, mobile-friendly websites built for your business.",
  },
  {
    title: "Booking & Integrations",
    kind: "calendar",
    href: "/consultation",
    description: "Scheduling, payments, and tools that keep you organized.",
  },
  {
    title: "Automation & AI Tools",
    kind: "automation",
    href: "/get-started",
    description: "Save time and simplify your daily operations.",
  },
  {
    title: "Business Setup",
    kind: "growth",
    href: "/get-started",
    description: "A complete online setup to help you launch and grow.",
  },
];

export default async function HomePage() {
  const socialSettings = await getSocialSettings();
  const setup = serviceOfferings.find(
    (service) => service.key === "business-setup",
  )!;
  return (
    <div className="home-redesign">
      <StructuredData value={organizationStructuredData()} />
      <Hero />
      <section
        className="home-packages"
        aria-labelledby="home-packages-heading"
      >
        <PageContainer>
          <div className="home-section-heading">
            <h2 id="home-packages-heading">
              Choose the Right Solution for Your Business
            </h2>
          </div>
          <div className="home-packages-grid">
            {packageOrder.map((key) => {
              const tier = serviceOfferings.find(
                (service) => service.key === key,
              )!;
              return <PricingCard key={tier.key} tier={tier} compact />;
            })}
          </div>
          <div className="home-pricing-details">
            <Link href="/pricing" className="home-text-link">
              Compare All Packages <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </section>
      <section
        id="services"
        className="home-services"
        aria-labelledby="home-services-heading"
      >
        <PageContainer>
          <div className="home-section-heading">
            <h2 id="home-services-heading">Our Services</h2>
            <p>Practical digital solutions to help your business grow.</p>
          </div>
          <div className="board-category-grid">
            {categories.map((category) => (
              <Link
                key={category.title}
                href={
                  category.title === "Business Setup"
                    ? setup.href
                    : category.href
                }
                className="board-category-card"
              >
                <HomeIcon kind={category.kind} />
                <h3>{category.title}</h3>
              </Link>
            ))}
          </div>
          <div className="home-pricing-details">
            <Link href="/pricing" className="home-text-link">
              Compare all packages &amp; complete inclusions{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </section>
      <section className="home-why" aria-labelledby="home-why-heading">
        <PageContainer>
          <div className="home-section-heading board-why-title">
            <OceanEmblem />
            <p className="section-kicker">Why Steady Start</p>
            <h2 id="home-why-heading">A Partner in Your Business Growth</h2>
          </div>
          <div className="home-benefits">
            {whyChooseItems.map((reason, index) => (
              <div className="home-benefit" key={reason.title}>
                <HomeIcon
                  kind={["bolt", "people", "growth", "support"][index]}
                />
                <div>
                  <h3>{reason.title.replace("For", "for")}</h3>
                  <p>{reason.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
      <HomeConnectSection settings={socialSettings} />
    </div>
  );
}
