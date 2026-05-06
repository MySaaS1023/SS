import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";

const points = [
  "Steady Start exists because many business owners want a website built for them instead of spending weeks inside a DIY builder.",
  "The service is designed around real business needs, so each project starts with what the business actually needs to communicate, sell, or support.",
  "Everything is built with a practical, supportive approach shaped by founder experience and a clear understanding of what makes small businesses feel credible online.",
];

export default function AboutPage() {
  return (
    <>
      <section className="py-14 sm:py-16">
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-xl">
              <p className="section-kicker">About Steady Start</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                Founder-built website support for businesses that want it done right.
              </h1>
            </div>

            <div className="space-y-5">
              {points.map((point) => (
                <div
                  key={point}
                  className="glass-card p-6"
                >
                  <p className="text-base leading-8 text-[var(--muted)]">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner buttonLabel="Hire Us" kickerText="" />
    </>
  );
}
