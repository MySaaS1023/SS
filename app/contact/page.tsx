import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export default function ContactPage() {
  return (
    <section className="bg-[var(--surface-muted)] py-16 sm:py-20">
      <PageContainer>
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 text-center shadow-[var(--shadow)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
            Need help before you start?
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Reach out with questions about packages, fit, or your website goals and
            we&apos;ll point you in the right direction.
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className={`${primaryButtonClass} force-white-btn mt-8 text-sm shadow-[var(--shadow)]`}
          >
            {supportEmail}
          </a>
        </div>
      </PageContainer>
    </section>
  );
}
