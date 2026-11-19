import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import {
  ClientWebsiteSlider,
  ExploreHeroMockup,
  WebsiteDesignGallery,
} from "@/components/explore/explore-gallery";
import { publicPageMetadata } from "@/lib/seo";
import styles from "./explore.module.css";

export const metadata = publicPageMetadata("/explore");

export default function ExplorePage() {
  return (
    <div className={styles.page}>
      <section className="explore-hero" aria-labelledby="explore-heading">
        <PageContainer>
          <div className="explore-hero-grid">
            <div>
              <p className="explore-kicker">
                REAL WORK. YOUR NEXT POSSIBILITY.
              </p>
              <h1 id="explore-heading">
                Explore Websites Built for <span>Every Business</span>
              </h1>
              <p className="explore-hero-description">
                Explore websites we&apos;ve built for real businesses and
                discover customizable designs that can bring your own ideas to
                life.
              </p>
              <a href="#website-designs" className="explore-button">
                Find Your Website Style <span aria-hidden="true">↓</span>
              </a>
            </div>
            <ExploreHeroMockup />
          </div>
        </PageContainer>
      </section>
      <section
        className="explore-section explore-client-section"
        aria-labelledby="client-websites-heading"
      >
        <PageContainer>
          <div className="explore-section-heading">
            <p className="explore-kicker">BUILT FOR REAL BUSINESSES</p>
            <h2 id="client-websites-heading">Websites We&apos;ve Built</h2>
            <p>
              Take a look at real websites we&apos;ve designed and developed for
              businesses.
            </p>
          </div>
          <ClientWebsiteSlider />
        </PageContainer>
      </section>
      <section
        id="website-designs"
        className="explore-section explore-library"
        aria-labelledby="website-designs-heading"
      >
        <PageContainer>
          <div className="explore-section-heading">
            <p className="explore-kicker">A STARTING POINT, MADE YOURS</p>
            <h2 id="website-designs-heading">Find Your Website Style</h2>
            <p>
              Browse website designs for different businesses and industries.
              Choose a style you love, and we&apos;ll customize it for your
              brand.
            </p>
            <p className="explore-library-disclosure">
              These original sample designs illustrate possibilities, not
              completed client projects or instant website installations.
            </p>
          </div>
          <WebsiteDesignGallery />
        </PageContainer>
      </section>
      <section
        className="explore-section explore-closing"
        aria-labelledby="explore-cta-heading"
      >
        <PageContainer>
          <div className="explore-closing-panel">
            <div>
              <p className="explore-kicker">LET&apos;S MAKE IT HAPPEN</p>
              <h2 id="explore-cta-heading">Ready to Build Your Website?</h2>
              <p>
                Choose a design, make it your own, or let us create something
                completely custom for your business.
              </p>
            </div>
            <Link href="/get-started" className="explore-button">
              Get a Free Quote <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
