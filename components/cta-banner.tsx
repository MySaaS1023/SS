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
  title = "Ready to launch with clarity?",
  buttonLabel = "Request Quote",
  buttonHref = "/contact",
  kickerText = "",
}: CtaBannerProps) {
  return (
    <section className="py-10 sm:py-14">
      <PageContainer>
        <div className="glass-panel rounded-[2.25rem] border border-[rgba(170,140,117,0.34)] px-6 py-8 text-[#141212] shadow-[var(--shadow)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {kickerText ? (
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#AA6F78]">
                  {kickerText}
                </p>
              ) : null}
              <h2 className={`${kickerText ? "mt-3" : ""} text-3xl font-semibold tracking-[-0.03em] sm:text-4xl`}>
                {title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/74 sm:text-base">
                Whether you need business setup, a custom website, or a more advanced
                web solution, Steady Start can help you take the next step.
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
