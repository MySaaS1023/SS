import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

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
          headline: "Plan activated.",
          body: "Your website builder plan is active. Log in to continue building your website.",
        }
      : {
          eyebrow: "REQUEST RECEIVED",
          headline: "Website intake received.",
          body: "Your website details were submitted successfully. Create an account or log in to continue.",
        };

  return (
    <section className="py-16 sm:py-20">
      <PageContainer>
        <div className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-12">
          <p className="section-kicker">{content.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">
            {content.headline}
          </h1>
          <p className="mt-5 text-base leading-8 text-[var(--muted)]">{content.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/login" className={`${primaryButtonClass} force-white-btn text-sm`}>
              Log In
            </Link>
            <Link href="/" className={`${secondaryButtonClass} text-sm`}>
              Back to Home
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
