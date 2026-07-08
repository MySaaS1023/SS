import Link from "next/link";

import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { PricingCard } from "@/components/pricing-card";
import { serviceOfferings, whyChooseItems } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const platformHighlights = [
  "AI Website Builder",
  "Business Dashboard",
  "Marketing Automation",
  "Customer Management",
  "Scheduling",
  "Invoices",
  "Payments",
  "AI Assistant",
  "Templates",
];

const testimonials = [
  {
    quote:
      "Steady Start is being built for the reality of small business: too many moving pieces, not enough time, and a need for tools that actually guide you.",
    author: "Early platform direction",
  },
  {
    quote:
      "The goal is one workspace where a business can launch, sell, schedule, invoice, communicate, and improve with AI support.",
    author: "Product vision",
  },
];

const faqs = [
  {
    question: "Is Steady Start trying to replace Shopify or Squarespace?",
    answer:
      "No. Steady Start is not a clone of either platform. The mission is to create an AI operating system for small businesses that brings website, CRM, marketing, products, services, payments, and operations together.",
  },
  {
    question: "Will it support both products and services?",
    answer:
      "Yes. The architecture supports service businesses, product businesses, and businesses that offer both.",
  },
  {
    question: "Is the full SaaS app live today?",
    answer:
      "The foundation is being built incrementally. Public intake and existing workflows remain compatible while authenticated platform modules are added behind a protected dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="features" className="pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-10">
        <PageContainer>
          <div className="max-w-3xl">
            <p className="section-kicker">Platform</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              One AI-powered workspace for the business you are building.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Steady Start is designed to bring the core pieces of a modern
              business into one clean platform, whether you sell services,
              products, or both.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platformHighlights.map((item) => (
              <div
                key={item}
                className="glass-card rounded-2xl px-5 py-4 text-sm font-semibold text-white"
              >
                {item}
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="pricing" className="pt-8 pb-8 sm:pt-10 sm:pb-10 lg:pt-12 lg:pb-10">
        <PageContainer>
          <div className="max-w-3xl">
            <p className="section-kicker">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Start with the right foundation.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Early offers help entrepreneurs prepare their business foundation
              while the full SaaS platform is built behind the scenes.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {serviceOfferings.map((solution) => (
              <PricingCard key={solution.key} tier={solution} />
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(148,163,184,0.14)] bg-[rgba(15,23,42,0.72)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.26)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">Advanced Custom Work</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Need Something More Advanced?
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                  We also support custom web projects like booking systems,
                  dashboards, client portals, membership sites, AI workflows, and
                  custom business applications.
                </p>
              </div>

              <div className="flex shrink-0">
                <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
                  Request a Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="pt-2 pb-10 sm:pt-4 sm:pb-14 lg:pt-4 lg:pb-16">
        <PageContainer>
          <div className="rounded-[1.8rem] border border-[rgba(148,163,184,0.14)] bg-[rgba(15,23,42,0.72)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.26)] sm:px-8 sm:py-8">
            <div className="max-w-2xl">
              <p className="section-kicker">Why Steady Start</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Why Choose Steady Start?
              </h2>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {whyChooseItems.map((reason) => (
                <div key={reason.title} className="flex flex-col">
                  <p className="text-xl font-semibold text-white">{reason.title}</p>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/start-free"
                className={`${primaryButtonClass} force-white-btn text-sm`}
              >
                Start Free
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section id="demo" className="py-10 sm:py-14">
        <PageContainer>
          <div className="glass-panel rounded-[2rem] border border-[rgba(148,163,184,0.18)] p-6 shadow-[var(--shadow)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="section-kicker">Demo Preview</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                  From onboarding to AI-generated business foundation.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
                  The first-login experience will ask conversational questions,
                  then generate starter pages, navigation, SEO, brand direction,
                  business information, and editable layouts.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/6 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Business name",
                    "Products, services, or both",
                    "Brand colors",
                    "Logo upload",
                    "Business hours",
                    "Domain",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl bg-white/6 px-4 py-3 text-sm text-white">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="glass-card p-6 sm:p-8">
              <p className="section-kicker">Templates</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                Templates that become smarter with AI.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                Templates will help businesses launch faster, while AI adapts
                copy, sections, styles, FAQs, SEO, products, services, and calls
                to action around each organization.
              </p>
            </div>
            <div className="glass-card p-6 sm:p-8">
              <p className="section-kicker">Testimonials</p>
              <div className="mt-5 space-y-4">
                {testimonials.map((item) => (
                  <blockquote key={item.quote} className="rounded-2xl border border-[var(--line)] bg-white/6 p-4">
                    <p className="text-sm leading-7 text-[var(--muted)]">“{item.quote}”</p>
                    <footer className="mt-3 text-sm font-semibold text-white">{item.author}</footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Built for the next version of small business software.
            </h2>
          </div>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="glass-card p-5">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </>
  );
}
