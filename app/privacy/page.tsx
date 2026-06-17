import { PageContainer } from "@/components/page-container";

const sections = [
  {
    title: "Information We May Collect",
    body: "Steady Start may collect your name, email, phone number, business information, project details, form submissions, and payment-related information processed through third-party providers.",
  },
  {
    title: "How Information Is Used",
    body: "Information may be used to respond to inquiries, prepare quotes, provide business setup support, provide website or advanced web services, and improve the overall service experience.",
  },
  {
    title: "Project and Payment Handling",
    body: "Some payment-related data is handled through third-party payment processors. Steady Start uses submitted information only as needed to communicate, deliver services, manage project details, and support launch-related work.",
  },
];

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-20">
      <PageContainer className="max-w-4xl">
        <div className="glass-card p-8 sm:p-10">
          <p className="section-kicker">Privacy Policy</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">
            Privacy Policy
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
