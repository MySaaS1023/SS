import { formatMoney } from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

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
      referralRows.filter((item) => item.source === "referral_link").length,
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
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="glass-card p-5">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-5 text-sm leading-7 text-[#fde68a]">
        Phase 1 uses administrator-confirmed payments and manual payouts.
        Automatic Stripe webhook confirmation is intentionally not enabled until
        checkout sessions carry a durable lead/customer identifier.
      </div>
    </div>
  );
}
