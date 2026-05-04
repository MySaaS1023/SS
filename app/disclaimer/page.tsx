import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "General Information",
    body: "Information on this website is provided for general service information and does not guarantee a fixed scope, timeline, or final feature set until a project is reviewed.",
  },
  {
    title: "Project Fit",
    body: "Recommendations, integrations, and website functionality depend on your business needs, the package selected, and whether the requested work fits the service offering.",
  },
  {
    title: "No Guarantees",
    body: "Steady Start aims to provide thoughtful, high-quality website work, but business results may vary based on your offer, operations, and market conditions.",
  },
];

export default function DisclaimerPage() {
  return (
    <section className="bg-[var(--surface-cream)] py-16 sm:py-20">
      <PageContainer className="max-w-4xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Disclaimer
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Disclaimer
          </h1>
          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-muted)] p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-[var(--foreground)]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
