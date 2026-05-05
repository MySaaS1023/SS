import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export default function ContactPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="glass-card mx-auto max-w-3xl p-8 text-center sm:p-12">
          <p className="section-kicker">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
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
