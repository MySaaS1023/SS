import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardSection, dashboardSections } from "@/lib/saas/navigation";
import { primaryButtonClass } from "@/lib/styles";

type DashboardSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

const sectionActions: Record<string, string> = {
  products: "Add Product",
  services: "Add Service",
  domains: "Connect Domain",
  branding: "Edit Brand",
  media: "Upload Media",
  analytics: "View Insights",
};

export function generateStaticParams() {
  return dashboardSections
    .filter((section) => section.key !== "home")
    .map((section) => ({ section: section.key }));
}

export default async function DashboardSectionPage({ params }: DashboardSectionPageProps) {
  const { section: rawSection } = await params;
  const section = getDashboardSection(rawSection);

  if (!section || section.key === "home") {
    notFound();
  }

  return (
    <DashboardShell activeSection={section.key}>
      <section className="mx-auto max-w-5xl">
        <div className="glass-card p-6 sm:p-8">
          <p className="section-kicker">{section.label}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            {section.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
            {section.description}
          </p>
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-white/6 p-8 text-center">
            <p className="text-sm leading-7 text-[var(--muted)]">
              This area is ready for your website builder content.
            </p>
            <Link
              href="/dashboard/ai-builder"
              className={`${primaryButtonClass} force-white-btn mt-5 text-sm`}
            >
              {sectionActions[section.key] ?? "Create Website"}
            </Link>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
