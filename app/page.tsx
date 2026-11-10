import Link from "next/link";
import { Hero } from "@/components/hero";
import { HomeConnectSection } from "@/components/connect/home-connect-section";
import { HomeServicePreview } from "@/components/home-service-preview";
import { HomeIcon } from "@/components/home-icon";
import { PageContainer } from "@/components/page-container";
import { serviceOfferings, whyChooseItems } from "@/lib/site-data";
import { getSocialSettings } from "@/lib/social-settings";

export default async function HomePage() {
  const socialSettings = await getSocialSettings();
  const setup = serviceOfferings.find(
    (service) => service.key === "business-setup",
  )!;
  return (
    <div className="home-redesign">
      <Hero />
      <section
        id="services"
        className="home-services"
        aria-labelledby="home-services-heading"
      >
        <PageContainer>
          <div className="home-section-heading">
            <p className="section-kicker">Our Services</p>
            <h2 id="home-services-heading">
              Choose the Right Solution for Your Business
            </h2>
            <p>
              Professional websites, powerful features, and business solutions
              built to help you grow.
            </p>
          </div>
          <div className="home-service-grid">
            {serviceOfferings
              .filter((service) => service.key !== "business-setup")
              .map((service) => (
                <HomeServicePreview key={service.key} service={service} />
              ))}
          </div>
          <div className="home-setup-option">
            <HomeIcon kind="business" />
            <div>
              <h3>
                {setup.name} <span>— {setup.price}</span>
              </h3>
              <p>{setup.subtitle}</p>
            </div>
            <Link href={setup.href} className="home-text-link">
              Request a Quote <span aria-hidden="true">→</span>
            </Link>
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
          <div className="home-section-heading">
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
