import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";

export default function HandoffNotFound() {
  return (
    <section className="py-16 sm:py-24">
      <PageContainer>
        <div className="glass-card mx-auto max-w-2xl p-6 text-center sm:p-10">
          <p className="section-kicker">Client handoff</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            This handoff link is unavailable
          </h1>
          <p className="mt-5 leading-8 text-slate-300">
            Please check the link you received, or ask Steady Start for a
            current handoff link.
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-white/20 px-5 py-3 text-[#bfdbfe] focus-visible:outline-2 focus-visible:outline-blue-300"
          >
            Contact Steady Start
          </a>
        </div>
      </PageContainer>
    </section>
  );
}
