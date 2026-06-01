import Link from "next/link";

import { Hero } from "@/components/hero";
import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type StandardSolution = {
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  featured: false;
};

type CompleteLaunchSolution = {
  title: string;
  price: string;
  subtitle: string;
  options: Array<{
    title: string;
    features: string[];
  }>;
  cta: string;
  href: string;
  featured: true;
};

const solutions: Array<StandardSolution | CompleteLaunchSolution> = [
  {
    title: "Business Setup",
    price: "Custom Quote",
    subtitle: "Pricing varies by state requirements and business needs.",
    features: [
      "EIN setup assistance",
      "Domain setup",
      "Business phone setup",
      "Business address setup",
      "Business bank account guidance",
      "DUNS registration guidance",
    ],
    cta: "Request Quote",
    href: "/contact",
    featured: false,
  },
  {
    title: "Custom Website Bundle",
    price: "$319",
    subtitle: "Front-End Only",
    features: [
      "Home Page",
      "About Page",
      "Services/Product Page",
      "Pricing Page",
      "Contact Page",
      "FAQ Page",
      "Disclaimer Page",
      "Links Page",
      "Booking or Cart Integration",
      "Mobile Responsive Design",
    ],
    cta: "Get Started",
    href: "/get-started",
    featured: false,
  },
  {
    title: "Custom Website+ Bundle",
    price: "$599",
    subtitle: "",
    features: [
      "Backend development",
      "Database setup",
      "Payment integration",
      "Admin portals",
      "Client portals",
      "Patient portals",
      "API integrations",
      "SEO optimization",
      "AI workflows",
      "Automation and bots",
    ],
    cta: "Get Started",
    href: "/get-started",
    featured: false,
  },
  {
    title: "Complete Business Launch Packages",
    price: "Custom Quote",
    subtitle:
      "Bundle your business setup with a website solution for a complete launch experience.",
    options: [
      {
        title: "Business Setup + Basic Website",
        features: ["Business Setup", "Custom Website Bundle"],
      },
      {
        title: "Business Setup + Website+",
        features: ["Business Setup", "Custom Website+ Bundle"],
      },
    ],
    cta: "Request Quote",
    href: "/contact",
    featured: true,
  },
];

const reasons = [
  {
    title: "Affordable Solutions",
    description:
      "Helping entrepreneurs launch without agency-level pricing.",
  },
  {
    title: "Beginner Friendly",
    description: "Simple guidance every step of the way.",
  },
  {
    title: "Built For Growth",
    description: "Start small and expand as your business grows.",
  },
  {
    title: "Real Support",
    description: "Personalized assistance and communication.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="services" className="py-10 sm:py-14 lg:py-16">
        <PageContainer>
          <div className="max-w-3xl">
            <p className="section-kicker">Services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Choose The Right Solution For Your Business
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Whether you&apos;re just getting started or need advanced web
              functionality, we have a solution built for you.
            </p>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className={`glass-card relative flex h-full flex-col p-6 sm:p-7 transition duration-200 hover:-translate-y-1 ${
                  solution.featured
                    ? "xl:col-span-2 border-[rgba(59,130,246,0.32)] shadow-[0_24px_52px_rgba(59,130,246,0.16)] ring-1 ring-[rgba(139,92,246,0.22)] xl:scale-[1.01]"
                    : "hover:border-[rgba(59,130,246,0.22)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.1)]"
                }`}
              >
                {solution.featured ? (
                  <div className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
                    Most Popular
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">
                      {solution.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {solution.subtitle}
                    </p>
                  </div>
                  <p className="shrink-0 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    {solution.price}
                  </p>
                </div>

                {"options" in solution ? (
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {solution.options.map((option) => (
                      <div
                        key={option.title}
                        className="rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5"
                      >
                        <p className="text-lg font-semibold text-white">{option.title}</p>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-white">
                          {option.features.map((feature) => (
                            <li key={feature} className="flex gap-3">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a78bfa]" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-8 space-y-3 text-sm leading-6 text-white">
                    {solution.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-3"
                      >
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#60a5fa]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8">
                  <Link
                    href={solution.href}
                    className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
                  >
                    {solution.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-6 py-6 shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="section-kicker">Advanced Custom Work</p>
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
                <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
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
              Why Choose Steady Start?
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reasons.map((reason) => (
              <div
                key={reason.title}
                className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(139,92,246,0.22)] hover:shadow-[0_18px_40px_rgba(139,92,246,0.12)]"
              >
                <p className="text-xl font-semibold text-white">{reason.title}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/get-started"
              className={`${primaryButtonClass} force-white-btn text-sm`}
            >
              Start Your Business
            </Link>
            <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
              Get Business Setup Help
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
