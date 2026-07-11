import { TemplateGallery } from "@/components/builder/template-gallery";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { websiteTemplates } from "@/lib/builder/templates";

export default function TemplatesPage() {
  return (
    <DashboardShell activeSection="templates">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Templates</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Choose a starting point.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Pick a professionally designed layout and customize it for your business.
          </p>
        </div>

        <TemplateGallery templates={websiteTemplates} />
      </section>
    </DashboardShell>
  );
}
