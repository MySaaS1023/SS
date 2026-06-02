import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "Services Covered",
    body: "Steady Start provides business setup guidance, custom website development, Website+ or advanced web solutions, and quote-based launch support based on the scope agreed to for each client.",
  },
  {
    title: "Client Information",
    body: "Clients are responsible for providing accurate business, contact, project, and content information so recommendations, setup guidance, and development work can be completed correctly.",
  },
  {
    title: "Approvals and Third Parties",
    body: "Steady Start does not guarantee government approval, banking approval, merchant approval, platform approval, or any other third-party acceptance related to your business setup or launch activities.",
  },
  {
    title: "Payment and Scope",
    body: "Payment terms depend on the service selected or quote provided. Any scope changes, added features, or expanded requirements may require additional fees and an updated agreement.",
  },
  {
    title: "Final Review",
    body: "Clients are responsible for reviewing final work, content, and setup details before launch or final delivery. Approval to move forward indicates that the client accepts the final version presented.",
  },
];

export default function TermsPage() {
  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-4xl">
        <div className="glass-card p-8 sm:p-10">
          <p className="section-kicker">Terms of Service</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">
            Terms of Service
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
