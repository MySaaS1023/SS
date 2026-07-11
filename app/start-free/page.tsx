import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";

export default function StartFreePage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="section-kicker">Request Consultation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Tell us what you are launching.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Share the basics so Steady Start can recommend the right business setup,
            website, or advanced web solution.
          </p>
        </div>
        <IntakeForm />
      </PageContainer>
    </section>
  );
}
