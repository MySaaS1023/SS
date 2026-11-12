import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/page-container";
import { OceanMesh, OceanWave } from "@/components/ocean-brand";

export function Hero() {
  return (
    <section
      className="home-hero board-home-hero"
      aria-labelledby="home-hero-heading"
    >
      <OceanMesh />
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
        <div className="home-hero-emblem-visual" aria-hidden="true">
          <Image
            className="home-hero-geometric-emblem"
            src="/brand/home-hero-geometric-emblem.svg"
            width={512}
            height={512}
            alt=""
            priority
            unoptimized
          />
        </div>
      </PageContainer>
      <OceanWave />
    </section>
  );
}
