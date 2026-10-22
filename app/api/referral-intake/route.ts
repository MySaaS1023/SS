import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_CUSTOMER_CONSENT_VERSION,
  REFERRAL_VISITOR_COOKIE_NAME,
  getSiteUrl,
} from "@/lib/referrals/config";
import {
  type CustomerInviteReferral,
  deliverCustomerInvite,
} from "@/lib/referrals/customer-handoff";
import { sendReferralEmail } from "@/lib/referrals/email";
import { createPartnerNotification } from "@/lib/referrals/notifications";
import {
  normalizeText,
  rateLimit,
  validEmail,
  writeAudit,
} from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

type IntakeRpcResult = {
  created: boolean;
  accepted: boolean;
  send_email: boolean;
  referral: CustomerInviteReferral & {
    business_name?: string | null;
    customer_last_name?: string | null;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (normalizeText(body.companyWebsite, 200))
      return NextResponse.json({ success: true }, { status: 201 });

    const startedAt = Number(body.startedAt);
    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 1_500 ||
      Date.now() - startedAt > 86_400_000
    )
      return NextResponse.json(
        { error: "Please reload the page and try again." },
        { status: 400 },
      );

    const fullName = normalizeText(body.fullName, 240);
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts.shift() ?? "";
    const lastName = nameParts.join(" ");
    const email = normalizeText(body.email, 254).toLowerCase();
    const phone = normalizeText(body.phone, 60);
    const businessName = normalizeText(body.businessName, 160);
    const consent = body.consent === true;
    if (
      !firstName ||
      !lastName ||
      !validEmail(email) ||
      phone.replace(/\D/g, "").length < 7 ||
      !businessName ||
      !consent
    )
      return NextResponse.json(
        { error: "Complete all required fields and provide email consent." },
        { status: 400 },
      );

    const cookieStore = await cookies();
    const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
    const visitorKey = cookieStore.get(REFERRAL_VISITOR_COOKIE_NAME)?.value;
    if (!referralCode || !visitorKey || !/^[0-9a-f-]{36}$/i.test(visitorKey))
      return NextResponse.json(
        { error: "This referral link is unavailable or expired." },
        { status: 410 },
      );
    if (!rateLimit(`customer-intake:${visitorKey}`, 5, 60 * 60_000))
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );

    const admin = createAdminSupabaseClient();
    const { data: attribution } = await admin
      .from("referral_attributions")
      .select("partner_id,referral_code")
      .eq("visitor_key", visitorKey)
      .eq("referral_code", referralCode)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (!attribution)
      return NextResponse.json(
        { error: "This referral link is unavailable or expired." },
        { status: 410 },
      );
    const { data: partner } = await admin
      .from("referral_partners")
      .select("id,first_name,last_name,email,referral_code")
      .eq("id", attribution.partner_id)
      .eq("referral_code", attribution.referral_code)
      .eq("status", "approved")
      .maybeSingle();
    if (!partner)
      return NextResponse.json(
        { error: "This referral link is unavailable or expired." },
        { status: 410 },
      );

    const consentAt = new Date().toISOString();
    const { data, error } = await admin.rpc("upsert_referral_customer_intake", {
      p_partner_id: partner.id,
      p_referral_code: partner.referral_code,
      p_visitor_key: visitorKey,
      p_business_name: businessName,
      p_customer_first_name: firstName,
      p_customer_last_name: lastName,
      p_customer_email: email,
      p_customer_phone: phone,
      p_consent_version: REFERRAL_CUSTOMER_CONSENT_VERSION,
      p_consent_at: consentAt,
    });
    if (error || !data) {
      console.error("REFERRAL_CUSTOMER_INTAKE_STORE_ERROR", {
        code: error?.code,
      });
      return NextResponse.json(
        {
          error: error?.message?.includes("ownership conflict")
            ? "This email is already connected to a Steady Start referral. Contact support if you need help."
            : "We couldn't save your information. Please try again in a moment.",
        },
        { status: error?.message?.includes("ownership conflict") ? 409 : 500 },
      );
    }
    const result = data as IntakeRpcResult;
    const referral = result.referral;
    if (!result.accepted)
      return NextResponse.json({ success: true }, { status: 200 });
    await writeAudit({
      action: result.created
        ? "partial_referral_created"
        : "partial_referral_duplicate_prevented",
      entityType: "referral",
      entityId: referral.id,
      after: {
        partner_id: partner.id,
        consent_version: REFERRAL_CUSTOMER_CONSENT_VERSION,
      },
    });
    await createPartnerNotification({
      admin,
      partnerId: partner.id,
      type: "partial_referral",
      title: "New Customer Inquiry",
      message:
        "A customer shared their contact information through your customer intake link.",
      eventKey: `partial_referral:${referral.id}`,
      referralId: referral.id,
    });
    if (result.created)
      await sendReferralEmail(partner.email, {
        kind: "new_referral",
        firstName: partner.first_name,
        portalUrl: `${getSiteUrl()}/partner/referrals`,
      }).catch(() =>
        console.error("PARTIAL_REFERRAL_PARTNER_EMAIL_FAILED", {
          referralId: referral.id,
        }),
      );

    const invitation = result.send_email
      ? await deliverCustomerInvite({
          admin,
          referral,
          partnerFirstName: partner.first_name,
          partnerName: `${partner.first_name} ${partner.last_name}`.trim(),
          messageKind: "customer_intake",
        })
      : {
          sent:
            referral.customer_invite_status === "sent" ||
            Boolean(referral.customer_invite_sent_at),
          reason: "email_not_claimed",
        };
    if (result.send_email && !invitation.sent)
      await admin
        .from("referrals")
        .update({ customer_intake_email_claimed_at: null })
        .eq("id", referral.id);
    if (invitation.sent)
      await createPartnerNotification({
        admin,
        partnerId: partner.id,
        type: "customer_email_sent",
        title: "Customer Email Sent",
        message:
          "Steady Start sent the customer a secure link to explore services.",
        eventKey: `customer_email_sent:${referral.id}`,
        referralId: referral.id,
      });

    return NextResponse.json(
      {
        success: true,
        emailDelivery: invitation.sent ? "sent" : "failed",
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    console.error("REFERRAL_CUSTOMER_INTAKE_ERROR", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      {
        error:
          "We couldn't save your information. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
