import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PageContainer } from "@/components/page-container";
import { CustomerIntakeForm } from "@/components/referrals/customer-intake-form";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_VISITOR_COOKIE_NAME,
} from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect with Steady Start",
  description:
    "Share your information securely and explore Steady Start business services.",
  robots: { index: false, follow: false },
};

export default async function ReferralCustomerIntakePage() {
  const cookieStore = await cookies();
  const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
  const visitorKey = cookieStore.get(REFERRAL_VISITOR_COOKIE_NAME)?.value;
  const admin = createAdminSupabaseClient();
  const { data: attribution } =
    referralCode && visitorKey && /^[0-9a-f-]{36}$/i.test(visitorKey)
      ? await admin
          .from("referral_attributions")
          .select("partner_id,referral_code,expires_at")
          .eq("visitor_key", visitorKey)
          .eq("referral_code", referralCode)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle()
      : { data: null };
  const { data: partner } = attribution
    ? await admin
        .from("referral_partners")
        .select("first_name,last_name")
        .eq("id", attribution.partner_id)
        .eq("status", "approved")
        .maybeSingle()
    : { data: null };

  if (!partner)
    return (
      <section className="py-16">
        <PageContainer>
          <div className="glass-card mx-auto max-w-2xl p-8 text-center">
            <p className="section-kicker">Steady Start</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              This referral link is unavailable
            </h1>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Ask your Steady Start representative for a new link or contact
              support@steadystartco.com.
            </p>
          </div>
        </PageContainer>
      </section>
    );

  const partnerName = `${partner.first_name} ${partner.last_name}`.trim();
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-5 lg:sticky lg:top-28">
            <p className="section-kicker">Steady Start Referral</p>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              You&apos;re connecting with Steady Start through {partnerName}.
            </h1>
            <p className="text-base leading-8 text-[var(--muted)] sm:text-lg">
              Steady Start helps entrepreneurs with business setup, professional
              websites, and complete launch support. Your representative will be
              notified when your information is received.
            </p>
            <div className="rounded-2xl border border-[#3b82f6]/25 bg-[#3b82f6]/10 p-5 text-sm leading-7 text-[#dbeafe]">
              Your contact details are private. They are available only to
              Steady Start administrators and your authorized representative.
            </div>
          </div>
          <CustomerIntakeForm partnerName={partnerName} />
        </div>
      </PageContainer>
    </section>
  );
}
