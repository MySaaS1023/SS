import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";

export function Hero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-heading">
      <PageContainer className="home-hero-grid">
        <div className="home-hero-copy">
          <p className="section-kicker">Websites that work for your business</p>
          <h1 id="home-hero-heading">
            Launch Your
            <br className="hidden sm:block" /> Business Online{" "}
            <span>With Confidence</span>
          </h1>
          <p className="home-hero-description">
            From custom websites to AI automation, we create a professional
            online presence that helps your business grow, save time, and bring
            in more customers.
          </p>
          <div className="home-hero-actions">
            <Link
              href="/get-started"
              className="home-button home-button-primary"
            >
              Start Your Project <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/#services"
              className="home-button home-button-secondary"
            >
              Learn More <span aria-hidden="true">↓</span>
            </Link>
          </div>
        </div>
        <div
          className="home-hero-visual"
          role="img"
          aria-label="Professional laptop displaying Steady Start branding against a blue-lit background"
        >
          <div className="home-hero-orbit" />
          <div className="home-laptop">
            <div className="home-laptop-screen">
              <div className="home-laptop-camera" />
              <Image src="/logo.png" alt="" width={160} height={160} priority />
              <p>
                Steady Start<span>LLC</span>
              </p>
            </div>
            <div className="home-laptop-keyboard" />
            <div className="home-laptop-base" />
          </div>
          <div className="home-visual-caption">
            <span aria-hidden="true" />
            Your next chapter starts here.
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
