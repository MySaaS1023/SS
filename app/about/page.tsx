import Link from "next/link";

import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

const founderStory = [
  "I know what it's like to have a business idea and not know where to start.",
  "Over the years, I've built multiple businesses, launched online stores, created websites, worked with branding, and helped turn ideas into real projects. Along the way, I learned that many entrepreneurs get stuck before they ever launch not because they lack motivation, but because the process feels overwhelming.",
  "That's why I created Steady Start.",
  "My goal is simple: help entrepreneurs move from idea to action.",
  "Whether you need help setting up your business foundation, launching a professional website, or building something more advanced, I want the process to feel clear, practical, and achievable.",
  "Steady Start was built for people who are ready to stop overthinking and start building.",
];

const founderSupportAreas = [
  "Business setup guidance",
  "Custom websites",
  "Website+ solutions",
  "Launch strategy and support",
  "Online business foundations",
];

export default function AboutPage() {
  return (
    <>
      <section className="py-14 sm:py-16">
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div className="glass-card relative overflow-hidden p-6 sm:p-8 lg:sticky lg:top-28">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-3rem] top-[-2rem] h-28 w-28 rounded-full bg-[#3B82F6]/18 blur-3xl" />
                <div className="absolute bottom-[-2rem] right-[-2rem] h-32 w-32 rounded-full bg-[#8B5CF6]/18 blur-3xl" />
              </div>
              <div className="relative">
                <p className="section-kicker">Meet The Founder</p>
                <div className="mt-6 flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(139,92,246,0.2))] shadow-[0_18px_40px_rgba(59,130,246,0.16)]">
                  <span className="text-3xl font-semibold tracking-[-0.06em] text-white">
                    C
                  </span>
                </div>
                <p className="mt-6 text-lg font-semibold text-white">Christine</p>
                <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--muted)]">
                  Founder of Steady Start and a builder who understands how easy it is
                  to get stuck between a good idea and an actual launch.
                </p>
                <div className="mt-8 rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
                    Founder Note
                  </p>
                  <p className="mt-3 text-base leading-8 text-white/90">
                    Steady Start was built to make launching feel less confusing and
                    more possible for people who are ready to move.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="max-w-3xl">
                <p className="section-kicker">Meet The Founder</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                  Hi, I&apos;m Christine.
                </h1>
              </div>

              <div className="space-y-5">
                {founderStory.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="glass-card p-6 sm:p-7">
                <p className="section-kicker">What I Help With</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {founderSupportAreas.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-7 text-white sm:text-base">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a78bfa]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/contact"
                className={`${primaryButtonClass} force-white-btn inline-flex text-sm shadow-[var(--shadow)]`}
              >
                Work With Me
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner kickerText="" />
    </>
  );
}
