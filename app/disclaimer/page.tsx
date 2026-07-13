import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "Nature of Services",
    body: "Steady Start provides business setup support, website development, and digital launch services intended to help entrepreneurs move forward with more clarity and structure.",
  },
  {
    title: "What Steady Start Is Not",
    body: "Steady Start is not a law firm, CPA or accounting firm, financial advisor, or government agency. Business setup support is guidance and assistance only.",
  },
  {
    title: "Client Responsibility",
    body: "Clients are responsible for final decisions, filings, compliance, taxes, banking requirements, legal obligations, and confirming that any actions taken are appropriate for their specific situation.",
  },
  {
    title: "No Business Outcome Guarantees",
    body: "Website, automation, and launch services do not guarantee sales, income, traffic, rankings, approvals, or overall business success. Results depend on many factors outside Steady Start's control.",
  },
];

export default function DisclaimerPage() {
  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-4xl">
        <div className="glass-card p-8 sm:p-10">
          <p className="section-kicker">Disclaimer</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">
            Disclaimer
          </h1>
          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <div key={section.title} className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
