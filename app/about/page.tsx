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
                Steady Start was created to help entrepreneurs launch their businesses
                with confidence. From business setup support to custom websites and
                advanced web solutions, the goal is to make the process simpler,
                clearer, and less overwhelming.
              </p>
              <p>
                Many people have great business ideas but get stuck figuring out where
                to begin. Steady Start exists to help bridge that gap by providing
                practical support, professional websites, and solutions designed to help
                businesses establish a strong foundation.
              </p>
              <p>
                Whether you&apos;re starting your first business, improving your online
                presence, or building something more advanced, Steady Start is focused
                on helping you move forward with clarity and confidence.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      <CtaBanner kickerText="" />
    </>
  );
}
