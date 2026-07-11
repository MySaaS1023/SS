import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { pricingPlans } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const services = [
  {
    title: "Business Setup Support",
    description:
      "Get practical help with launch steps like EIN guidance, domain setup, business phone setup, business address planning, and launch organization.",
  },
  {
    title: "Custom Website Design",
    description:
      "Launch with a professional, mobile-friendly website built around your services, products, brand, contact flow, and business goals.",
  },
  {
    title: "Website+ Solutions",
    description:
      "Add advanced functionality like payments, portals, databases, integrations, automations, and scalable web tools when your business needs more.",
  },
  {
    title: "Branding Direction",
    description:
      "Clarify your visual direction, offer language, and launch presentation so your business feels professional from the beginning.",
  },
  {
    title: "Marketing Launch Support",
    description:
      "Prepare the essentials for getting seen online, including basic SEO setup, launch messaging, contact flow, and conversion-focused structure.",
  },
];

const process = [
  "Tell us what you need",
  "We map the right solution",
  "Your setup or website is built",
  "You launch with clarity",
];

const reasons = [
  {
    title: "Beginner Friendly",
    description: "Clear guidance for entrepreneurs who know what they want but need help getting it organized.",
  },
  {
    title: "Built Around Real Launch Needs",
    description: "Support can include setup, websites, forms, payments, integrations, and launch essentials.",
  },
  {
    title: "Professional Without Agency Overwhelm",
    description: "A practical path for small businesses that need quality work without confusing processes.",
  },
  {
    title: "Ready For Growth",
    description: "Start with the foundation you need now and expand into advanced tools when the time is right.",
  },
];

const testimonials = [
  {
    quote:
      "Steady Start helped turn a scattered business idea into something I could actually launch. The process felt clear and doable.",
    name: "New business owner",
  },
  {
    quote:
      "I did not want to fight with a DIY website builder. Steady Start gave me a professional online presence without the stress.",
    name: "Local service provider",
  },
  {
    quote:
      "The biggest help was having someone organize the next steps. I knew what needed to happen and what could wait.",
    name: "First-time entrepreneur",
  },
];

const faqs = [
  {
    question: "Do you only build websites?",
    answer:
      "No. Steady Start supports business setup, custom websites, branding direction, marketing launch basics, and advanced web solutions.",
  },
  {
    question: "Can you help if I am just starting?",
    answer:
      "Yes. The service is built for entrepreneurs who have an idea but need help organizing the foundation and getting online.",
  },
  {
    question: "Do I need to use Wix, Shopify, or Squarespace?",
    answer:
      "No. Steady Start focuses on custom website solutions and guided launch support instead of leaving you stuck inside a DIY platform.",
  },
  {
    question: "How do I know which package I need?",
    answer:
      "Start with the request form or book a consultation. We will review your goals and recommend the best path.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[#1473ff]/20 blur-[110px]" />
          <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-[#8b5cf6]/18 blur-[120px]" />
        </div>
        <PageContainer className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="section-kicker">Business Launch Support</p>
              <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Launch Your Business With Confidence
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                From business setup to custom websites and advanced web solutions,
                Steady Start helps entrepreneurs get organized, get online, and
                start strong.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href="/get-started" className={`${primaryButtonClass} force-white-btn text-sm`}>
                  Start Your Business
                </Link>
                <Link href="/services" className={`${secondaryButtonClass} text-sm`}>
                  View Services
                </Link>
              </div>
            </div>

            <div className="glass-card p-5 sm:p-7">
              <div className="rounded-[1.6rem] border border-[var(--line)] bg-[rgba(7,11,20,0.72)] p-5">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                </div>
                <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,rgba(20,115,255,0.3),rgba(139,92,246,0.22))] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfdbfe]">
                    Launch Plan
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                    Business foundation + professional web presence
                  </h2>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {["Business setup", "Website build", "Payment setup", "Launch checklist"].map(
                    (item) => (
                      <div key={item} className="rounded-2xl border border-[var(--line)] bg-white/6 p-4 text-sm font-semibold text-white">
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Support for the foundation, website, and launch.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Choose the level of help your business needs now, then grow from there.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="glass-card p-7">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Packages</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Choose the right support for your launch.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--muted)]">
              Start with business setup, a custom website, or a complete launch
              package that brings the pieces together.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`glass-card flex flex-col p-6 ${
                  plan.featured
                    ? "border-[rgba(79,140,255,0.46)] shadow-[0_0_42px_rgba(20,115,255,0.18)]"
                    : ""
                }`}
              >
                {plan.featured ? (
                  <span className="mb-5 w-fit rounded-full bg-[rgba(79,140,255,0.16)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">
                    Featured
                  </span>
                ) : null}
                <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                  {plan.price}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-white">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`${
                    plan.featured ? primaryButtonClass : secondaryButtonClass
                  } force-white-btn mt-8 justify-center text-sm`}
                >
                  {plan.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)] sm:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                A clear path from idea to launch.
              </h2>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-4">
              {process.map((step, index) => (
                <div key={step} className="rounded-2xl border border-[var(--line)] bg-white/6 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(79,140,255,0.14)] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Why Steady Start</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Practical support for new entrepreneurs.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason) => (
              <article key={reason.title} className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white">{reason.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Testimonials</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Built for people starting from scratch.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="glass-card p-6">
                <p className="text-base leading-8 text-white">“{testimonial.quote}”</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                  {testimonial.name}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Questions before you get started?
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-14 sm:py-18">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Ready to launch with clarity?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              Tell us what you are building and we will help you choose the right
              setup, website, or launch solution.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/get-started" className={`${primaryButtonClass} force-white-btn text-sm`}>
                Work With Me
              </Link>
              <Link href="/contact" className={`${secondaryButtonClass} text-sm`}>
                Book a Consultation
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
