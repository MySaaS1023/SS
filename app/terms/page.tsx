import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "Service-Based Website Work",
    body: "Steady Start provides service-based website work tailored to the package selected and the business information provided during intake.",
  },
  {
    title: "Project Scope",
    body: "Final scope depends on the chosen package, project complexity, and the specific needs of your business.",
  },
  {
    title: "Payment and Project Terms",
    body: "Payment and project terms may apply before work begins, including timeline expectations, revision boundaries, and setup requirements.",
  },
  {
    title: "Backend and Integrations",
    body: "Backend features, integrations, and advanced functionality depend on package level and final approved scope.",
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
              <div
                key={section.title}
                className="glass-card p-6"
              >
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
