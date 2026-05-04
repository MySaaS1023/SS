import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

export default function NotFound() {
  return (
    <section className="py-20 sm:py-28">
      <PageContainer>
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--line)] bg-white/90 p-8 text-center shadow-[var(--shadow)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            404
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
            This page took a wrong turn.
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            The page you&apos;re looking for isn&apos;t here, but your website project can
            still move forward.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              Go Home
            </Link>
            <Link
              href="/pricing"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
