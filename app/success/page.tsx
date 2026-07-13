import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

type SuccessPageProps = {
  searchParams?: Promise<{ type?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const successType = params?.type === "payment" ? "payment" : "request";

  const content =
    successType === "payment"
      ? {
          eyebrow: "PAYMENT RECEIVED",
          headline: "Payment received.",
          body: "Your website project has been secured. We’ll review your details and follow up with next steps.",
        }
      : {
          eyebrow: "REQUEST RECEIVED",
          headline: "Request received.",
          body: "Your project details have been submitted successfully. We’ll review your information and follow up with next steps.",
        };

  return (
    <section className="bg-[var(--surface-cream)] py-16 sm:py-20">
      <PageContainer>
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {content.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {content.headline}
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">
            {content.body}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              Back to Home
            </Link>
            <Link
              href="/contact"
              className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)]`}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
