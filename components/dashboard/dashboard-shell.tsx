import Link from "next/link";
import type { ReactNode } from "react";

import { dashboardSections } from "@/lib/saas/navigation";
import type { DashboardSectionKey } from "@/lib/saas/types";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type DashboardShellProps = {
  activeSection?: DashboardSectionKey;
  children: ReactNode;
};

export function DashboardShell({ activeSection = "home", children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-[var(--line)] bg-[rgba(7,11,20,0.9)] px-4 py-5 backdrop-blur-xl lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Steady Start</p>
              <p className="text-xs text-[var(--muted)]">Website Builder</p>
            </div>
            <Link href="/" className="text-xs font-medium text-[var(--muted)] hover:text-white">
              View site
            </Link>
          </div>

          <Link
            href="/dashboard/ai-builder"
            className={`${primaryButtonClass} force-white-btn mt-6 w-full justify-center text-sm`}
          >
            Create Website
          </Link>

          <nav className="mt-6 grid gap-1.5">
            {dashboardSections.map((section) => {
              const isActive = section.key === activeSection;

              return (
                <Link
                  key={section.key}
                  href={section.href}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[rgba(79,140,255,0.16)] text-white shadow-[0_0_24px_rgba(79,140,255,0.14)]"
                      : "text-[var(--muted)] hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(7,11,20,0.82)] px-5 py-4 backdrop-blur-xl sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                  Current organization
                </p>
                <h1 className="mt-1 text-lg font-semibold text-white">My Business</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard/billing" className={`${secondaryButtonClass} text-sm`}>
                  Upgrade
                </Link>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/8 text-sm font-semibold text-white"
                  aria-label="Account menu"
                >
                  SS
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-8 sm:px-8 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
