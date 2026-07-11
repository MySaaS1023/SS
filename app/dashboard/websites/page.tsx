import { MyWebsitesClient } from "@/components/builder/my-websites-client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function MyWebsitesPage() {
  return (
    <DashboardShell activeSection="websites">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">My Websites</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Manage your websites.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Edit, preview, and reopen the websites you create with Steady Start.
          </p>
        </div>
        <MyWebsitesClient />
      </section>
    </DashboardShell>
  );
}
