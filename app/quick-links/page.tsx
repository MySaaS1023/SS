import type { Metadata } from "next";
import Link from "next/link";

import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const links = [
  {
    href: "/wix-alternative",
    title: "Wix Alternative",
    description: "Compare a done-for-you website path with building inside Wix yourself.",
  },
  {
    href: "/shopify-alternative",
    title: "Shopify Alternative",
    description: "See when a custom website is a better fit than committing to Shopify.",
  },
  {
    href: "/squarespace-alternative",
    title: "Squarespace Alternative",
    description: "Learn why some businesses choose a custom site over a DIY builder.",
  },
  {
    href: "/custom-website-vs-wix",
    title: "Custom Website vs Wix",
    description: "A direct comparison for business owners deciding how to get online.",
  },
  {
    href: "/custom-website-vs-shopify",
    title: "Custom Website vs Shopify",
    description: "A simpler way to compare custom website builds against platform-first tools.",
  },
  {
    href: "/custom-website-vs-squarespace",
    title: "Custom Website vs Squarespace",
    description: "See the difference between a custom build and a template-led setup.",
  },
  {
    href: "/website-without-monthly-fees",
    title: "Website Without Monthly Fees",
    description: "Explore a cleaner website path without stacking more monthly platform costs.",
  },
];

export const metadata: Metadata = {
  title: "Quick Links | Steady Start",
  description:
    "Explore Steady Start comparison pages and quick resources for business owners choosing a done-for-you website.",
  alternates: {
    canonical: "https://www.steadystartco.com/quick-links",
  },
};

export default function QuickLinksPage() {
  return (
    <>
      <section className="py-14 sm:py-16">
        <PageContainer>
          <div className="max-w-4xl space-y-5">
            <p className="section-kicker">Quick Links</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              A simple hub for website comparison and launch resources.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              These pages are here for business owners researching alternatives to DIY
              platforms, comparing custom website options, or looking for a cleaner path
              to getting online.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-8 sm:py-10">
        <PageContainer>
          <div className="mx-auto max-w-4xl">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block border-b border-[rgba(255,255,255,0.08)] py-5 transition hover:border-[rgba(59,130,246,0.28)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-white transition group-hover:text-[#dbeafe]">
                      {link.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                      {link.description}
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 text-lg text-[#bfdbfe] transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-14">
        <PageContainer>
          <div className="mx-auto max-w-4xl glass-card p-6 sm:p-8">
            <p className="section-kicker">Next Step</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Ready to move from research to launch?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
              Use the links below to compare pricing, start your website request, or ask
              questions before moving forward.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
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
              <Link
                href="/contact"
                className={`${secondaryButtonClass} text-sm shadow-[var(--shadow)]`}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner buttonLabel="Start My Website" kickerText="" />
    </>
  );
}
