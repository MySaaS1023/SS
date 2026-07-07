import Link from "next/link";
import type { ReactNode } from "react";

import { dashboardSections } from "@/lib/saas/navigation";
import type { DashboardSectionKey } from "@/lib/saas/types";
import { primaryButtonClass } from "@/lib/styles";

type DashboardShellProps = {
  activeSection?: DashboardSectionKey;
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardShell({
  activeSection = "home",
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="glass-card h-fit p-3 lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Business Platform
            </p>
            <Link href="/" className="text-xs font-medium text-[var(--muted)] hover:text-white">
              Site
            </Link>
          </div>
          <nav className="mt-2 grid gap-1">
            {dashboardSections.map((section) => {
              const isActive = section.key === activeSection;

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[rgba(79,140,255,0.14)] text-white shadow-[0_0_24px_rgba(79,140,255,0.12)]"
                      : "text-[var(--muted)] hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/get-started"
            className={`${primaryButtonClass} force-white-btn mt-3 w-full justify-center text-sm`}
          >
            New Request
          </Link>
        </aside>

        <main className="min-w-0">
          <div className="glass-card p-6 sm:p-8">
            <p className="section-kicker">Organization Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {description}
            </p>
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
