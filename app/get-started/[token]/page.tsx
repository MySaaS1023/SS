import { notFound } from "next/navigation";

import { CustomerOptions } from "@/components/referrals/customer-options";
import { IntakeForm } from "@/components/intake-form";
import { PageContainer } from "@/components/page-container";
import { hashCustomerAccessToken } from "@/lib/referrals/customer-handoff";
import { labelStatus } from "@/lib/referrals/config";
import {
  createPartnerNotification,
  referralDisplayName,
} from "@/lib/referrals/notifications";
import {
  resolveServiceKey,
  serviceLabel,
  serviceOfferings,
} from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerGetStartedPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ service?: string }>;
}) {
  const { token } = await params;
  const query = searchParams ? await searchParams : undefined;
  const selectedPackage = resolveServiceKey(query?.service);
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) notFound();
  const admin = createAdminSupabaseClient();
  const { data: referral } = await admin
    .from("referrals")
    .select(
      "id,partner_id,business_name,customer_first_name,customer_last_name,customer_email,customer_phone,service_interest,status,customer_access_token_expires_at,customer_first_viewed_at",
    )
    .eq("customer_access_token_hash", hashCustomerAccessToken(token))
    .maybeSingle();
  if (!referral) notFound();
  if (
    !referral.customer_access_token_expires_at ||
    new Date(referral.customer_access_token_expires_at) <= new Date()
  ) {
    return (
      <section className="py-16">
        <PageContainer>
          <div className="glass-card mx-auto max-w-2xl p-8 text-center">
            <p className="section-kicker">Steady Start</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              This private link has expired
            </h1>
            <p className="mt-4 text-[var(--muted)]">
              Ask your Referral Partner to resend the invitation, or contact
              support@steadystartco.com.
            </p>
          </div>
        </PageContainer>
      </section>
    );
  }
  const { data: partner } = await admin
    .from("referral_partners")
    .select("first_name")
    .eq("id", referral.partner_id)
    .single();
  if (!partner) notFound();
  const now = new Date().toISOString();
  const firstView = !referral.customer_first_viewed_at;
  await admin
    .from("referrals")
    .update({
      customer_first_viewed_at: referral.customer_first_viewed_at ?? now,
      customer_last_viewed_at: now,
      customer_last_activity_at: now,
    })
    .eq("id", referral.id);
  await admin.from("referral_audit_log").insert({
    action: firstView ? "customer_invite_opened" : "customer_page_viewed",
    entity_type: "referral",
    entity_id: referral.id,
    after_data: { viewed_at: now },
  });
  if (firstView)
    await createPartnerNotification({
      admin,
      partnerId: referral.partner_id,
      type: "customer_viewed",
      title: "Customer Viewed Services",
      message: `${referralDisplayName(referral)} viewed their Steady Start options.`,
      eventKey: `customer_viewed:${referral.id}`,
      referralId: referral.id,
    });
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <p className="section-kicker">Steady Start</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
            Welcome, {referral.customer_first_name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
            {partner.first_name} referred you to Steady Start. Based on your
            referral, you may be interested in{" "}
            <strong className="text-white">
              {serviceLabel(referral.service_interest) ===
              referral.service_interest
                ? labelStatus(referral.service_interest)
                : serviceLabel(referral.service_interest)}
            </strong>
            .
          </p>
          <h2 className="mt-12 text-3xl font-semibold text-white">
            Explore Your Options
          </h2>
          <CustomerOptions token={token} services={serviceOfferings} />
          {selectedPackage ? (
            <div id="intake" className="scroll-mt-28 pt-14">
              <IntakeForm
                selectedPackage={selectedPackage}
                customerHandoffToken={token}
                initialValues={{
                  fullName: [
                    referral.customer_first_name,
                    referral.customer_last_name,
                  ]
                    .filter(Boolean)
                    .join(" "),
                  businessName: referral.business_name ?? "",
                  email: referral.customer_email ?? "",
                  phone: referral.customer_phone ?? "",
                }}
              />
            </div>
          ) : null}
          <p className="mt-8 text-sm text-[var(--muted)]">
            There is no obligation to purchase.
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
