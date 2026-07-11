import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export default function AboutPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <p className="section-kicker">About Steady Start</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Business launch support for entrepreneurs who want it done right.
          </h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
            <p>
              Steady Start was created to help entrepreneurs launch their businesses
              with confidence. From business setup support to custom websites and
              advanced web solutions, the goal is to make the process simpler,
              clearer, and less overwhelming.
            </p>
            <p>
              Many people have great business ideas but get stuck figuring out
              where to begin. Steady Start helps bridge that gap by providing
              practical support, professional websites, and solutions designed to
              help businesses establish a strong foundation.
            </p>
            <p>
              Whether you are starting your first business, improving your online
              presence, or building something more advanced, Steady Start is focused
              on helping you move forward with clarity and confidence.
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/get-started" className={`${primaryButtonClass} force-white-btn text-sm`}>
              Work With Me
            </Link>
            <Link href="/services" className={`${secondaryButtonClass} text-sm`}>
              View Services
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
