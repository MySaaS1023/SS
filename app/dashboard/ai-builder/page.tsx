import { AiBuilderForm } from "@/components/builder/ai-builder-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AiBuilderPage() {
  return (
    <DashboardShell activeSection="ai-builder">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="section-kicker">AI Builder</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Generate your website with AI.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Give Steady Start the details and generate a complete editable website
            foundation.
          </p>
        </div>

        <AiBuilderForm />
      </section>
    </DashboardShell>
  );
}
