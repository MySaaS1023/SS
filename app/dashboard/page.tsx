import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { dashboardSections, foundationModules } from "@/lib/saas/navigation";

const currentWorkflowAreas = [
  "Contact requests",
  "Consultation scheduling",
  "Email automation",
  "Project workflow",
  "Vendor management",
  "Availability scheduling",
];

export default function DashboardHomePage() {
  return (
    <DashboardShell
      title="Steady Start Dashboard"
      description="The SaaS foundation for local service businesses: CRM, scheduling, projects, invoices, customer portal, website tools, marketing, and AI support."
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <DashboardCard
          title="Phase 1 foundation"
          description="These platform pieces are now modeled as organization-scoped modules so existing workflows can move into the dashboard without losing production compatibility."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {foundationModules.map((module) => (
              <div
                key={module.title}
                className="rounded-2xl border border-[var(--line)] bg-white/6 p-4"
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  {module.status}
                </span>
                <h3 className="mt-2 text-base font-semibold text-white">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Existing workflows stay intact"
          description="Current admin-style and intake functionality should be migrated into business modules incrementally, not removed."
        >
          <ul className="grid gap-2 text-sm text-white sm:grid-cols-2 xl:grid-cols-1">
            {currentWorkflowAreas.map((area) => (
              <li
                key={area}
                className="rounded-xl border border-[var(--line)] bg-white/6 px-3 py-2.5"
              >
                {area}
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Business management modules"
        description="Each section is designed to be scoped to the signed-in organization account."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dashboardSections.slice(1).map((section) => (
            <Link
              key={section.key}
              href={section.href}
              className="rounded-2xl border border-[var(--line)] bg-white/6 p-4 transition hover:border-[rgba(79,140,255,0.45)] hover:bg-[rgba(79,140,255,0.1)]"
            >
              <h3 className="text-base font-semibold text-white">{section.label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </DashboardShell>
  );
}
