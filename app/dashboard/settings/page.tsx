import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const settings = [
  "Account settings",
  "Organization settings",
  "Brand settings",
  "Team members",
  "Notifications",
];

export default function SettingsPage() {
  return (
    <DashboardShell activeSection="settings">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Settings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Manage your workspace.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Update your account, organization, brand, team, and notification preferences.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {settings.map((setting) => (
            <button
              key={setting}
              type="button"
              className="glass-card p-5 text-left transition hover:border-[rgba(79,140,255,0.45)]"
            >
              <span className="text-lg font-semibold text-white">{setting}</span>
              <span className="mt-2 block text-sm leading-7 text-[var(--muted)]">
                Configure {setting.toLowerCase()}.
              </span>
            </button>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
