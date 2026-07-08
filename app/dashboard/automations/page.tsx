import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const automations = [
  "AI follow-up emails",
  "AI SEO suggestions",
  "AI content generator",
  "AI abandoned cart recovery",
  "AI booking reminders",
];

export default function AutomationsPage() {
  return (
    <DashboardShell activeSection="automations">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Automations</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Automate the work around your website.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Future AI automations will help your website follow up, improve SEO,
            create content, and recover missed opportunities.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {automations.map((automation) => (
            <div key={automation} className="glass-card p-5">
              <h2 className="text-lg font-semibold text-white">{automation}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Prepare this automation for your website workflow.
              </p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
