import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

type CtaBannerProps = {
  title?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export function CtaBanner({
  title = "Ready to launch your website without building it yourself?",
  buttonLabel = "Start Your Project",
  buttonHref = "/get-started",
}: CtaBannerProps) {
  return (
    <section className="py-8 sm:py-12">
      <PageContainer>
        <div className="rounded-[2rem] border border-[rgba(37,99,235,0.14)] bg-[linear-gradient(135deg,var(--navy),#12233f)] px-6 py-8 text-white shadow-[var(--shadow)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#93C5FD]">
                Start Strong
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {title}
              </h2>
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
