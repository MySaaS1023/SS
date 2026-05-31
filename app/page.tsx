import Link from "next/link";

import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";
import { valueProps } from "@/lib/site-data";

const serviceIntroCards = [
  {
    title: "Business Setup Support",
    description:
      "Help organizing your business idea, setup steps, brand direction, domain, email, and launch checklist.",
  },
  {
    title: "Website Design & Launch",
    description:
      "Custom mobile-friendly websites built to help your business look professional online.",
  },
  {
    title: "Complete Launch Support",
    description:
      "Business setup and website launch together for entrepreneurs who want guidance from idea to online presence.",
  },
];

const launchBundles = [
  {
    title: "Business Setup Bundle",
    price: "Starting at $249",
    description:
      "Perfect for new entrepreneurs who need help getting their business foundation in place.",
    features: [
      "Business launch guidance",
      "Business idea and offer organization",
      "Domain and email setup assistance",
      "Branding direction",
      "Launch checklist",
      "Resource guidance",
    ],
    cta: "Get Started",
    href: "/get-started",
    featured: false,
  },
  {
    title: "Complete Launch Bundle",
    price: "Starting at $999",
    description:
      "Everything you need to set up your business foundation and launch with a professional website.",
    features: [
      "Everything in the Business Setup Bundle",
      "Custom website design",
      "Mobile-friendly website",
      "Contact form setup",
      "Basic SEO setup",
      "Service/product sections",
      "Website launch support",
    ],
    cta: "Launch My Business",
    href: "/get-started",
    featured: true,
  },
  {
    title: "Website Bundle",
    price: "Starting at $699",
    description:
      "For businesses that already have their foundation but need a professional online presence.",
    features: [
      "Custom website design",
      "Mobile responsive layout",
      "Contact forms",
      "Basic SEO setup",
      "Professional branding integration",
      "Launch-ready website layout",
    ],
    cta: "Build My Website",
    href: "/get-started",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="pt-5 sm:pt-6">
        <PageContainer>
          <div className="mx-auto max-w-5xl">
            <div className="glass-card relative overflow-hidden rounded-[1.8rem] border border-[rgba(244,114,182,0.22)] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(236,72,153,0.08),rgba(139,92,246,0.08))] px-4 py-3.5 shadow-[0_20px_48px_rgba(139,92,246,0.14)] sm:px-6 sm:py-4 lg:px-7">
              <div className="pointer-events-none absolute -left-8 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-[rgba(244,114,182,0.18)] blur-2xl" />
              <div className="pointer-events-none absolute -right-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-[rgba(139,92,246,0.16)] blur-2xl" />

              <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(244,114,182,0.22)] bg-[linear-gradient(135deg,rgba(244,114,182,0.12),rgba(139,92,246,0.12))] text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(244,114,182,0.12)] sm:h-11 sm:w-11 sm:text-sm">
                    MD
                  </div>

                  <div className="max-w-3xl">
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f9a8d4]">
                      In honor of Mother&apos;s Day
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6 text-white sm:text-lg sm:leading-7">
                      Mother&apos;s Day Special{" "}
                      <span className="font-semibold text-[#f9a8d4]">
                        - 20% off business website packages this month.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex w-full shrink-0 items-center sm:w-auto">
                  <div className="w-full rounded-2xl border border-[rgba(244,114,182,0.24)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 shadow-[0_10px_24px_rgba(139,92,246,0.12)] sm:w-auto sm:px-4 sm:py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9a8d4]">
                      Code
                    </p>
                    <p className="mt-1 break-words font-mono text-sm font-semibold tracking-[0.14em] text-white sm:text-base sm:tracking-[0.16em]">
                      MOTHERSDAY
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <Hero />

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="section-kicker">Everything You Need</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Everything You Need to Start Strong
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Steady Start gives new entrepreneurs practical launch help, professional
              website support, and clear next steps so the whole process feels less
              overwhelming.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {serviceIntroCards.map((card, index) => (
              <div
                key={card.title}
                className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(59,130,246,0.26)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.12)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(59,130,246,0.15)] font-mono text-sm font-semibold text-[#bfdbfe]">
                  0{index + 1}
                </span>
                <p className="mt-5 text-xl font-semibold text-white">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker">Launch Bundles</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Choose Your Launch Bundle
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-[var(--muted)]">
              Start with the support you need now, and grow from there.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {launchBundles.map((bundle) => (
              <div
                key={bundle.title}
                className={`glass-card relative flex h-full flex-col p-7 transition duration-200 hover:-translate-y-1 ${
                  bundle.featured
                    ? "scale-[1.02] border-[rgba(59,130,246,0.3)] shadow-[0_22px_48px_rgba(59,130,246,0.16)] ring-1 ring-[rgba(139,92,246,0.22)]"
                    : "hover:border-[rgba(59,130,246,0.22)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.1)]"
                }`}
              >
                {bundle.featured ? (
                  <div className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                    Most Popular
                  </div>
                ) : null}

                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">
                    {bundle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {bundle.description}
                  </p>
                </div>

                <div className="mt-8">
                  <p className="text-4xl font-semibold tracking-[-0.03em] text-white">
                    {bundle.price}
                  </p>
                </div>

                <ul className="mt-8 flex-1 space-y-3 text-sm leading-6 text-white">
                  {bundle.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-3 shadow-sm"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={bundle.href}
                  className={`${primaryButtonClass} force-white-btn mt-8 text-sm shadow-[var(--shadow)]`}
                >
                  {bundle.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">Custom Projects</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                  Need Something More Advanced?
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                  We also support custom web projects like booking systems,
                  dashboards, client portals, membership sites, and custom business
                  applications.
                </p>
              </div>

              <div className="flex shrink-0">
                <Link
                  href="/contact"
                  className={`${secondaryButtonClass} text-sm`}
                >
                  Request a Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="section-kicker">Why Steady Start</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Built for entrepreneurs who want a strong foundation before they go
              live.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(139,92,246,0.22)] hover:shadow-[0_18px_40px_rgba(139,92,246,0.12)]"
              >
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className={`${primaryButtonClass} force-white-btn text-sm`}
            >
              Start Your Launch
            </Link>
            <Link href="/pricing" className={`${secondaryButtonClass} text-sm`}>
              Choose Your Bundle
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
