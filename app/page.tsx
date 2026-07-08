import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const howItWorks = [
  "Create your account",
  "Choose template or AI-generated site",
  "Customize your website",
  "Publish when ready",
];

const builderOptions = [
  {
    title: "Customize with Templates",
    description:
      "Start with a clean website template, adjust your sections, add your content, and make it your own.",
  },
  {
    title: "AI Generated Website",
    description:
      "Tell Steady Start about your business and let AI create a starter website you can edit before publishing.",
  },
];

const features = [
  "Templates",
  "AI copy",
  "Colors and branding",
  "Mobile-friendly pages",
  "Contact forms",
  "Easy publishing",
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[#1473ff]/20 blur-[110px]" />
          <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-[#4f8cff]/18 blur-[120px]" />
        </div>
        <PageContainer className="relative">
          <div className="mx-auto max-w-4xl text-center">
            <p className="section-kicker">AI Website Builder</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Build Your Website with AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Choose a template, customize it yourself, or let AI generate your
              website for you in minutes.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/start-free"
                className={`${primaryButtonClass} force-white-btn text-sm`}
              >
                Build Your Website
              </Link>
              <Link href="/pricing" className={`${secondaryButtonClass} text-sm`}>
                View Pricing
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">How It Works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              From idea to website in a few clear steps.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {howItWorks.map((step, index) => (
              <div key={step} className="glass-card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(79,140,255,0.14)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{step}</h3>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Website Builder Options</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Pick the path that fits how you like to build.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {builderOptions.map((option) => (
              <article key={option.title} className="glass-card p-7 sm:p-8">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {option.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {option.description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-12 sm:py-16">
        <PageContainer>
          <div className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)] sm:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-kicker">Features</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                Everything you need to start a clean website.
              </h2>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-[var(--line)] bg-white/6 px-5 py-4 text-sm font-semibold text-white"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-14 sm:py-18">
        <PageContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Ready to build your website?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              Start with a template or let AI generate the first version for you.
            </p>
            <Link
              href="/start-free"
              className={`${primaryButtonClass} force-white-btn mt-8 text-sm`}
            >
              Build Your Website
            </Link>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
