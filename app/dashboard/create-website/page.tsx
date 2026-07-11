import { CreateWebsiteActions } from "@/components/builder/create-website-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function CreateWebsitePage() {
  return (
    <DashboardShell activeSection="create-website">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Create Website</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Choose how you want to start.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Generate your website with AI, customize a template, or begin with a
            blank canvas.
          </p>
        </div>

        <CreateWebsiteActions />
      </section>
    </DashboardShell>
  );
}
