import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass } from "@/lib/styles";

export default function MyWebsitesPage() {
  return (
    <DashboardShell activeSection="websites">
      <section className="mx-auto max-w-5xl">
        <div className="glass-card p-8 text-center sm:p-12">
          <p className="section-kicker">My Websites</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Your websites will appear here.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
            Create your first website with AI, start from a template, or open a
            blank canvas.
          </p>
          <Link
            href="/dashboard/ai-builder"
            className={`${primaryButtonClass} force-white-btn mt-8 text-sm`}
          >
            Create Website
          </Link>
        </div>
      </section>
    </DashboardShell>
  );
}
