import type { Metadata } from "next";
import Link from "next/link";

import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";
import type { SeoLandingPageContent } from "@/lib/seo-pages";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const baseUrl = "https://www.steadystartco.com";

export function buildSeoMetadata(page: SeoLandingPageContent): Metadata {
  const url = `${baseUrl}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: "Steady Start",
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Steady Start custom business websites",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export function SeoLandingPage({ page }: { page: SeoLandingPageContent }) {
  return (
    <>
      <section className="py-14 sm:py-16">
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-5">
              <p className="section-kicker">Steady Start Guide</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                {page.h1}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {page.intro}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/pricing"
                  className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
                >
                  See Pricing
                </Link>
                <Link
                  href="/get-started"
                  className={`${secondaryButtonClass} text-sm shadow-[var(--shadow)]`}
                >
                  Start My Website
                </Link>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-7">
              <p className="section-kicker">Quick Links</p>
              <div className="mt-4 space-y-3">
                <Link
                  href="/pricing"
                  className="block rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-4 text-sm text-white transition hover:border-[rgba(59,130,246,0.28)]"
                >
                  Compare packages and pricing
                </Link>
                <Link
                  href="/get-started"
                  className="block rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-4 text-sm text-white transition hover:border-[rgba(59,130,246,0.28)]"
                >
                  Start a done-for-you website build
                </Link>
                <Link
                  href="/contact"
                  className="block rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-4 text-sm text-white transition hover:border-[rgba(59,130,246,0.28)]"
                >
                  Ask questions before you choose
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-8 sm:py-10">
        <PageContainer>
          <div className="glass-card p-6 sm:p-8">
            <p className="section-kicker">{page.comparisonTitle}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {page.comparisonPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-4"
                >
                  <p className="text-sm leading-7 text-[var(--muted)]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-8 sm:py-10">
        <PageContainer>
          <div className="glass-card p-6 sm:p-8">
            <p className="section-kicker">{page.benefitsTitle}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {page.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-4"
                >
                  <p className="text-sm leading-7 text-[var(--muted)]">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-8 sm:py-10">
        <PageContainer>
          <div className="glass-card p-6 sm:p-8">
            <p className="section-kicker">Next Step</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              {page.ctaTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
              {page.ctaText}
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/get-started"
                className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
              >
                Start My Website
              </Link>
              <Link
                href="/contact"
                className={`${secondaryButtonClass} text-sm shadow-[var(--shadow)]`}
              >
                Contact Steady Start
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner buttonLabel="Start My Website" kickerText="" />
    </>
  );
}
