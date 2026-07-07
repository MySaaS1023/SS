import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function DashboardCard({ title, description, children }: DashboardCardProps) {
  return (
    <section className="glass-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
