import Link from "next/link";

import { CopyLinkButton } from "@/components/referrals/copy-link-button";
import { getSiteUrl } from "@/lib/referrals/config";
import { getApprovedPartner } from "@/lib/supabase/server";

export default async function PartnerDashboardPage() {
  const context = (await getApprovedPartner())!;
  const referralLink = `${getSiteUrl()}/ref/${context.partner.referral_code}`;
  const customerIntakeLink = `${referralLink}?landing=${encodeURIComponent("/referral-intake")}`;

  return (
    <div>
      <p className="section-kicker">Partner Portal</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">
        Welcome, {context.partner.first_name}
      </h1>
      <div id="my-referral-link" className="glass-card mt-6 p-5">
        <p className="text-sm font-semibold text-white">My Referral Link</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Share this link to connect businesses with Steady Start and track your
          referrals.
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-black/20 px-4 py-3 text-sm text-[#bfdbfe]">
            {referralLink}
          </code>
          <CopyLinkButton value={referralLink} label="Copy Referral Link" />
        </div>
      </div>
      <div className="glass-card mt-6 p-6">
        <p className="text-sm font-semibold text-white">Customer Intake Link</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Share this personalized link so a customer can provide their
          information.
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-black/20 px-4 py-3 text-sm text-[#bfdbfe]">
            {customerIntakeLink}
          </code>
          <CopyLinkButton
            value={customerIntakeLink}
            label="Copy Customer Intake Link"
          />
        </div>
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
