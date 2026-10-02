import Link from "next/link";

import { CopyLinkButton } from "@/components/referrals/copy-link-button";
import { formatMoney, getSiteUrl } from "@/lib/referrals/config";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";

export default async function PartnerDashboardPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const [{ data: referrals }, { data: commissions }] = await Promise.all([
    admin
      .from("referrals")
      .select("id,status")
      .eq("partner_id", context.partner.id),
    admin
      .from("referral_commissions")
      .select("status,commission_amount_cents")
      .eq("partner_id", context.partner.id),
  ]);
  const referralList = referrals ?? [];
  const commissionList = commissions ?? [];
  const sum = (statuses: string[]) =>
    commissionList
      .filter((item) => statuses.includes(item.status))
      .reduce((total, item) => total + item.commission_amount_cents, 0);
  const cards = [
    ["Total Referrals", referralList.length],
    [
      "Active Referrals",
      referralList.filter(
        (item) => !["payment_confirmed", "closed"].includes(item.status),
      ).length,
    ],
    [
      "Customers Converted",
      referralList.filter((item) =>
        ["customer", "payment_pending", "payment_confirmed"].includes(
          item.status,
        ),
      ).length,
    ],
    ["Pending Commission", formatMoney(sum(["pending", "eligible"]))],
    ["Approved Commission", formatMoney(sum(["approved"]))],
    ["Total Paid", formatMoney(sum(["paid"]))],
  ];
  const referralLink = `${getSiteUrl()}/ref/${context.partner.referral_code}`;

  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Welcome, {context.partner.first_name}
      </h1>
      <div className="glass-card mt-8 p-6">
        <p className="text-sm font-semibold text-white">My Referral Link</p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-black/20 px-4 py-3 text-sm text-[#bfdbfe]">
            {referralLink}
          </code>
          <CopyLinkButton value={referralLink} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="glass-card p-5">
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/partner/referrals/new"
          className="rounded-xl bg-[#3b82f6] px-5 py-3 text-center text-sm font-semibold text-white"
        >
          Submit a Referral
        </Link>
        <Link
          href="/partner/referrals"
          className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white"
        >
          View My Referrals
        </Link>
      </div>
    </div>
  );
}
