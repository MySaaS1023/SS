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
  title = "Ready to build with more control?",
  buttonLabel = "Request Quote",
  buttonHref = "/contact",
  kickerText = "",
}: CtaBannerProps) {
  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="glass-panel rounded-[2.25rem] border border-[rgba(148,163,184,0.18)] px-6 py-8 text-white shadow-[var(--shadow)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {kickerText ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#a5b4fc]">
                  {kickerText}
                </p>
              ) : null}
              <h2 className={`${kickerText ? "mt-3" : ""} text-3xl font-semibold tracking-[-0.03em] sm:text-4xl`}>
                {title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/74 sm:text-base">
                Whether you need launch support today or a stronger operating system
                tomorrow, Steady Start is building the platform to help service
                and product businesses manage work with clarity.
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
