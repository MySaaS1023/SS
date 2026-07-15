import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { PortfolioAlbumGrid } from "@/components/portfolio-carousel";
import { ecommerceSlides, serviceBusinessSlides } from "@/lib/portfolio-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export default function PortfolioPage() {
  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24">
        <PageContainer>
          <div className="portfolio-heading mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              PORTFOLIO
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Selected Work
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Explore custom websites created for service-based and e-commerce
              businesses.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16 sm:pb-20 lg:pb-24">
        <PortfolioAlbumGrid
          ecommerceSlides={ecommerceSlides}
          serviceSlides={serviceBusinessSlides}
        />
      </section>

      <section className="pb-16 sm:pb-20 lg:pb-24">
        <PageContainer>
          <div className="mx-auto max-w-[760px] border-t border-[rgba(148,163,184,0.14)] pt-12 text-center sm:pt-14">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Ready for a Website Built Around Your Business?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Whether you&apos;re launching a service business, selling products, or
              refreshing your online presence, I&apos;d love to help bring your vision
              to life.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
              >
                Work With Me
              </Link>
              <Link
                href="/pricing"
                className={`${secondaryButtonClass} text-sm shadow-[var(--shadow)]`}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
