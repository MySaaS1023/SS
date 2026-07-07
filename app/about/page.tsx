import { CtaBanner } from "@/components/cta-banner";
import { PageContainer } from "@/components/page-container";

export default function AboutPage() {
  return (
    <>
      <section className="py-16 sm:py-20">
        <PageContainer className="max-w-4xl">
          <div className="space-y-8">
            <div className="max-w-3xl">
              <p className="section-kicker">About Steady Start</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                About Steady Start
              </h1>
            </div>

            <div className="space-y-6 text-base leading-8 text-[var(--muted)] sm:text-lg">
              <p>
                Steady Start was created to help local service businesses launch,
                organize, and grow with more confidence. The long-term vision is an
                AI-powered platform that brings websites, CRM, scheduling, projects,
                invoices, payments, customer portals, and automation into one place.
              </p>
              <p>
                Many contractors, cleaners, landscapers, property service providers,
                and small local teams are stuck juggling disconnected tools. Steady
                Start exists to bridge that gap with practical launch support today
                and a scalable software foundation for the future.
              </p>
              <p>
                Whether you&apos;re setting up the foundation, improving your online
                presence, or preparing for more advanced operations, Steady Start is
                focused on helping businesses move forward with clarity, systems, and
                confidence.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner kickerText="" />
    </>
  );
}
