import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { pricingPlans } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export default function BillingPage() {
  return (
    <DashboardShell activeSection="billing">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Plans & Billing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Manage your website builder plan.
          </h1>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold text-white">Current Plan</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Starter preview
            </p>
            <button className={`${secondaryButtonClass} mt-6 text-sm`} type="button">
              Manage subscription
            </button>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-2xl font-semibold text-white">Upgrade options</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div key={plan.name} className="rounded-2xl border border-[var(--line)] bg-white/6 p-4">
                  <p className="font-semibold text-white">{plan.name}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{plan.price}</p>
                </div>
              ))}
            </div>
            <button className={`${primaryButtonClass} force-white-btn mt-6 text-sm`} type="button">
              Upgrade
            </button>
          </div>
        </div>

        <div className="mt-5 glass-card p-6">
          <h2 className="text-2xl font-semibold text-white">Billing history</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Billing history will appear here once subscription payments are connected.
          </p>
        </div>
      </section>
    </DashboardShell>
  );
}
