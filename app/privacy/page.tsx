import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "Information We Collect",
    body: "Steady Start may collect the details you share through contact and project inquiry forms, including your name, email, phone number, business name, and website goals.",
  },
  {
    title: "How Information Is Used",
    body: "Information is used to review your project, communicate about scope, and prepare next steps for your website build service.",
  },
  {
    title: "Data Handling",
    body: "Steady Start aims to handle inquiry information carefully and only uses it for business communication, planning, and service delivery related to your project.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="bg-[var(--surface-muted)] py-16 sm:py-20">
      <PageContainer className="max-w-4xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[var(--shadow)] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            Privacy Policy
          </h1>
          <div className="mt-8 space-y-6">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-cream)] p-6 shadow-sm"
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
