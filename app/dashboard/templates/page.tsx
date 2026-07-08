import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass } from "@/lib/styles";

const templates = [
  "Services",
  "Products",
  "Portfolio",
  "Restaurant",
  "Clothing",
  "Beauty",
  "Consulting",
  "Contractor",
  "Blank",
];

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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template} className="glass-card overflow-hidden">
              <div className="h-40 border-b border-[var(--line)] bg-[linear-gradient(135deg,rgba(20,115,255,0.24),rgba(255,255,255,0.08))]" />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  {template}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{template} Template</h2>
                <Link
                  href="/dashboard/websites?template=true"
                  className={`${primaryButtonClass} force-white-btn mt-5 w-full justify-center text-sm`}
                >
                  Use Template
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
