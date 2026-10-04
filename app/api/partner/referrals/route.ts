import { NextResponse } from "next/server";

import { adminEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/referrals/config";
import {
  missingReferralEmailConfiguration,
  sendReferralEmail,
  sendReferralProgramEmail,
} from "@/lib/referrals/email";
import { isSelfReferral } from "@/lib/referrals/rules";
import {
  normalizeText,
  rateLimit,
  requirePartnerApi,
  validEmail,
  writeAudit,
} from "@/lib/referrals/server";
import { serviceOfferings } from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requirePartnerApi();
  if (auth instanceof NextResponse) return auth;
  if (!rateLimit(`referral:${auth.partner.id}`, 12, 60 * 60_000))
    return NextResponse.json(
      { error: "Referral submission limit reached. Try again later." },
      { status: 429 },
    );
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = normalizeText(body.customerEmail, 254).toLowerCase();
    const serviceInterest = normalizeText(body.serviceInterest, 100);
    const firstName = normalizeText(body.customerFirstName, 120);
    const lastName = normalizeText(body.customerLastName, 120);
    const phone = normalizeText(body.customerPhone, 60);
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !validEmail(email) ||
      !serviceOfferings.some((service) => service.key === serviceInterest) ||
      body.permissionConfirmed !== "yes"
    ) {
      return NextResponse.json(
        {
          error:
            "Complete all required fields and confirm customer permission.",
        },
        { status: 400 },
      );
    }
    if (isSelfReferral(auth.partner.email, email))
      return NextResponse.json(
        { error: "Self-referrals are not eligible." },
        { status: 400 },
      );

    const admin = createAdminSupabaseClient();
    const [{ data: existingReferral }, { data: existingLeads }] =
      await Promise.all([
        admin
          .from("referrals")
          .select("id,partner_id")
          .ilike("customer_email", email)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
        admin
          .from("hire_us_submissions")
          .select("*")
          .ilike("email", email)
          .limit(1),
      ]);
    const existingLead = existingLeads?.[0];
    const duplicate = Boolean(existingReferral || existingLead);
    const referralPayload = {
      partner_id: auth.partner.id,
      lead_id: existingLead?.id != null ? String(existingLead.id) : null,
      business_name: normalizeText(body.businessName, 160) || null,
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_email: email,
      customer_phone: phone,
      website: normalizeText(body.website, 500) || null,
      service_interest: serviceInterest,
      notes: normalizeText(body.notes) || null,
      source: "partner_portal",
      permission_confirmed: true,
      duplicate_review: duplicate,
    };
    const { data: referral, error } = await admin
      .from("referrals")
      .insert(referralPayload)
      .select("*")
      .single();
    if (error) throw error;

    if (!existingLead) {
      const { data: lead, error: leadError } = await admin
        .from("hire_us_submissions")
        .insert({
          full_name: `${firstName} ${lastName}`,
          email,
          phone,
          selected_package: serviceInterest,
          website_goals:
            normalizeText(body.notes) ||
            `Partner referral${referralPayload.business_name ? ` for ${referralPayload.business_name}` : ""}`,
          referral_partner_id: auth.partner.id,
          referral_code: auth.partner.referral_code,
          referral_id: referral.id,
          referral_source: "partner_portal",
          referral_attributed_at: new Date().toISOString(),
        })
        .select("*")
        .single();
      if (leadError) throw leadError;
      await admin
        .from("referrals")
        .update({ lead_id: String(lead.id) })
        .eq("id", referral.id);
    }

    await writeAudit({
      actorUserId: auth.user.id,
      action: duplicate ? "duplicate_referral_flagged" : "referral_submitted",
      entityType: "referral",
      entityId: referral.id,
      after: { partner_id: auth.partner.id, email },
    });
    const businessName =
      referralPayload.business_name || `${firstName} ${lastName}`;
    const notifications: Promise<unknown>[] = [
      sendReferralEmail(auth.partner.email, {
        kind: "new_referral",
        firstName: auth.partner.first_name,
        businessName,
        portalUrl: `${getSiteUrl()}/partner/referrals`,
      }),
    ];
    if (!missingReferralEmailConfiguration().length)
      notifications.push(
        sendReferralProgramEmail({
          to: adminEmail,
          subject: duplicate
            ? "Partner referral requires duplicate review"
            : "New Partner referral received",
          text: `${auth.partner.first_name} ${auth.partner.last_name} submitted ${businessName}.\n\nReview in the Referral Program admin area.`,
        }),
      );
    await Promise.allSettled(notifications);
    return NextResponse.json(
      { success: true, referralId: referral.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("PARTNER_REFERRAL_ERROR", error);
    return NextResponse.json(
      { error: "Unable to submit this referral." },
      { status: 500 },
    );
  }
}
