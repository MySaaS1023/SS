import { formatMoney } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icon";

export default async function ReferralProgramOverviewPage() {
  const admin = createAdminSupabaseClient();
  const [
    applications,
    partners,
    referrals,
    commissions,
    payouts,
    attributions,
  ] = await Promise.all([
    admin.from("referral_partner_applications").select("status"),
    admin
      .from("referral_partners")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    admin.from("referrals").select("id,status,source"),
    admin.from("referral_commissions").select("status,commission_amount_cents"),
    admin.from("referral_payouts").select("id", { count: "exact", head: true }),
    admin
      .from("referral_attributions")
      .select("id", { count: "exact", head: true })
      .eq("source", "referral_link"),
  ]);
  const applicationRows = applications.data ?? [];
  const referralRows = referrals.data ?? [];
  const commissionRows = commissions.data ?? [];
  const cards = [
    [
      "Pending Applications",
      applicationRows.filter((item) => item.status === "pending").length,
    ],
    [
      "Approved Applications",
      applicationRows.filter((item) => item.status === "approved").length,
    ],
    [
      "Rejected Applications",
      applicationRows.filter((item) => item.status === "rejected").length,
    ],
    ["Active Partners", partners.count ?? 0],
    ["Total Referrals", referralRows.length],
    ["Referral Link Visits", attributions.count ?? 0],
    [
      "Qualified Leads from Links",
      referralRows.filter(
        (item) => item.source === "referral_link" && item.status !== "partial",
      ).length,
    ],
    [
      "Link Conversions",
      referralRows.filter(
        (item) =>
          item.source === "referral_link" &&
          ["customer", "payment_pending", "payment_confirmed"].includes(
            item.status,
          ),
      ).length,
    ],
    [
      "Converted Customers",
      referralRows.filter((item) =>
        ["customer", "payment_pending", "payment_confirmed"].includes(
          item.status,
        ),
      ).length,
    ],
    [
      "Eligible Commissions",
      commissionRows.filter((item) => item.status === "eligible").length,
    ],
    [
      "Approved Commissions",
      commissionRows.filter((item) => item.status === "approved").length,
    ],
    [
      "Total Commissions Paid",
      formatMoney(
        commissionRows
          .filter((item) => item.status === "paid")
          .reduce((sum, item) => sum + item.commission_amount_cents, 0),
      ),
    ],
    ["Payouts", payouts.count ?? 0],
  ];
  const primaryIndexes = [0, 1, 2, 3, 4, 5, 6, 11];
  const primaryIcons: AdminIconName[] = [
    "clipboard",
    "check",
    "close",
    "people",
    "link",
    "rocket",
    "layers",
    "coins",
  ];
  const additionalCards = cards.filter(
    (_, index) => !primaryIndexes.includes(index),
  );
  const quickActions = [
    {
      href: "/admin/referral-program/applications",
      label: "Review Applications",
      icon: "clipboard",
    },
    {
      href: "/admin/referral-program/partners",
      label: "Manage Partners",
      icon: "people",
    },
    {
      href: "/admin/referral-program/resources",
      label: "Upload Partner Resource",
      icon: "folder",
    },
  ] as const;
  return (
    <div className="min-w-0">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)]">
        <section
          aria-labelledby="referral-overview-heading"
          className="relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-blue-400/70 bg-gradient-to-br from-blue-600/75 via-blue-950 to-slate-950 p-5 sm:p-6"
        >
          <div className="shrink-0 rounded-2xl bg-blue-500/40 p-3 text-white shadow-[inset_0_1px_0_#ffffff33]">
            <AdminIcon name="people" className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <div className="relative z-10 min-w-0">
            <h2
              id="referral-overview-heading"
              className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              Referral Program Overview
            </h2>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              A quick look at your program&apos;s current activity and results.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-5 bottom-0 flex h-24 items-end gap-2 opacity-15"
          >
            {["h-8", "h-12", "h-16", "h-24"].map((height) => (
              <span
                key={height}
                className={`w-5 rounded-t bg-blue-400 ${height}`}
              />
            ))}
          </div>
        </section>
        <aside
          aria-labelledby="quick-actions-heading"
          className="rounded-2xl border border-slate-600/80 bg-gradient-to-br from-slate-800/70 to-slate-950 p-4"
        >
          <h2
            id="quick-actions-heading"
            className="mb-3 text-lg font-semibold text-white"
          >
            Quick Actions
          </h2>
          <div className="grid gap-2">
            {quickActions.map(({ href, label, icon }, index) => (
              <a
                key={href}
                href={href}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 ${index === 0 ? "border-sky-300/60 bg-gradient-to-br from-sky-500 to-blue-700 hover:brightness-110" : "border-slate-500 bg-slate-900/40 hover:border-blue-300 hover:bg-slate-800"}`}
              >
                <AdminIcon name={icon} className="h-5 w-5 shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </aside>
      </div>
      <section
        aria-label="Referral program metrics"
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {primaryIndexes.map((index, position) => {
          const [label, value] = cards[index];
          return (
            <div
              key={String(label)}
              className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-600/70 bg-gradient-to-br from-slate-800/70 to-slate-950 px-4 py-5"
            >
              <span className="shrink-0 rounded-xl bg-blue-400/15 p-2.5 text-blue-200">
                <AdminIcon name={primaryIcons[position]} className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-slate-200">{label}</p>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </section>
      <details className="group mt-4 rounded-2xl border border-slate-700 bg-slate-900/40">
        <summary className="cursor-pointer rounded-2xl px-5 py-4 text-sm font-semibold text-slate-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300">
          Additional Metrics
        </summary>
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {additionalCards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-4"
            >
              <p className="text-sm text-slate-300">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </details>
      <div
        role="note"
        className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-300/10 to-amber-300/[0.03] p-4 text-sm leading-6 text-amber-100 sm:p-5"
      >
        <span className="shrink-0 rounded-xl bg-amber-200/10 p-2 text-amber-300">
          <AdminIcon name="info" className="h-7 w-7" />
        </span>
        <div>
          <h2 className="font-semibold">Payment &amp; Payout Notice</h2>
          <p className="mt-1">
            Phase 1 uses administrator-confirmed payments and manual payouts.
            Automatic Stripe webhook confirmation is intentionally not enabled
            until checkout sessions carry a durable lead/customer identifier.
          </p>
        </div>
      </div>
    </div>
  );
}
