import Link from "next/link";

import { CopyLinkButton } from "@/components/referrals/copy-link-button";
import { formatMoney, getSiteUrl } from "@/lib/referrals/config";
import {
  createAdminSupabaseClient,
  getApprovedPartner,
} from "@/lib/supabase/server";
import { replaceLegacyServiceNames } from "@/lib/site-data";

export default async function PartnerDashboardPage() {
  const context = (await getApprovedPartner())!;
  const admin = createAdminSupabaseClient();
  const [
    { data: referrals },
    { data: commissions },
    { count: linkVisits },
    { data: notifications },
  ] = await Promise.all([
    admin
      .from("referrals")
      .select("id,status,source")
      .eq("partner_id", context.partner.id),
    admin
      .from("referral_commissions")
      .select("status,commission_amount_cents")
      .eq("partner_id", context.partner.id),
    admin
      .from("referral_attributions")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", context.partner.id)
      .eq("source", "referral_link"),
    admin
      .from("partner_notifications")
      .select("id,title,message,created_at")
      .eq("partner_id", context.partner.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const referralList = referrals ?? [];
  const commissionList = commissions ?? [];
  const sum = (statuses: string[]) =>
    commissionList
      .filter((item) => statuses.includes(item.status))
      .reduce((total, item) => total + item.commission_amount_cents, 0);
  const cards = [
    ["Referral Link Visits", linkVisits ?? 0],
    [
      "Qualified Leads",
      referralList.filter((item) => item.source === "referral_link").length,
    ],
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
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Share this link with businesses that may need Steady Start services.
          When someone uses it, Steady Start automatically tracks the referral
          for you. You do not need to manually enter the customer if they
          complete a Steady Start form through your link.
        </p>
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
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-white">
          Recent Referral Activity
        </h2>
        <div className="mt-4 space-y-3">
          {(notifications ?? []).length ? (
            notifications!.map((item) => (
              <article key={item.id} className="glass-card p-4">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {replaceLegacyServiceNames(item.message)}
                </p>
              </article>
            ))
          ) : (
            <p className="glass-card p-5 text-sm text-[var(--muted)]">
              No referral-link activity yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
