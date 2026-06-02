import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";
import { aboutCards } from "@/lib/site-data";

export default function AboutPage() {
  return (
    <>
      <section className="py-14 sm:py-16">
        <PageContainer>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-xl">
              <p className="section-kicker">About Steady Start</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                Business launch support for entrepreneurs who want it done right.
              </h1>
            </div>

            <div className="space-y-5">
              {aboutCards.map((point) => (
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

      <CtaBanner kickerText="" />
    </>
  );
}
