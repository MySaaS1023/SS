import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

type CtaBannerProps = {
  title?: string;
  buttonLabel?: string;
  buttonHref?: string;
  kickerText?: string;
};

export function CtaBanner({
  title = "Stop planning. Start your business.",
  buttonLabel = "Start Your Website",
  buttonHref = "/get-started",
  kickerText = "Final CTA",
}: CtaBannerProps) {
  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="glass-panel rounded-[2.25rem] border border-[rgba(255,255,255,0.12)] px-6 py-8 text-white shadow-[var(--shadow)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#c7d2fe]">
                {kickerText}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/74 sm:text-base">
                If you are ready to stop sitting in research mode and actually launch,
                Steady Start gives you a cleaner, faster path forward.
              </p>
            </div>
            <Link
              href={buttonHref}
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
