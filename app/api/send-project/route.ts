import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  adminEmail,
  businessEmail,
  formatCustomerConfirmationEmail,
  formatProjectRequestEmail,
  getResendClient,
  isValidSimpleEmail,
  senderEmail,
  type ProjectRequestPayload,
} from "@/lib/email";
import { hireUsSubmissionsTable } from "@/lib/supabase";
import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_VISITOR_COOKIE_NAME,
  getSiteUrl,
} from "@/lib/referrals/config";
import { sendReferralEmail } from "@/lib/referrals/email";
import { writeAudit } from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

function buildSuccessResponse() {
  return NextResponse.json({
    success: true,
    delivered: true,
    message:
      "Your project details were sent successfully. Please continue to secure your package.",
  });
}

function buildGenericErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Something went wrong while submitting your request. Please try again in a moment.",
    },
    { status: 500 },
  );
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const fullName = normalizeString(body.fullName);
    const email = normalizeString(body.email);
    const selectedPackage = normalizeString(body.selectedPackage);

    if (!fullName || !email || !selectedPackage) {
      console.error("INTAKE_VALIDATION_ERROR", {
        fullName,
        email,
        selectedPackage,
        body,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Please complete your name, email, and package selection.",
        },
        { status: 400 },
      );
    }

    if (!isValidSimpleEmail(email)) {
      console.error("INTAKE_EMAIL_VALIDATION_ERROR", { email });
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const insertData: Record<string, unknown> = {
      full_name: fullName,
      email,
      phone: normalizeString(body.phone),
      selected_package: selectedPackage,
      website_goals: normalizeString(body.projectGoals),
    };
    const emailPayload: ProjectRequestPayload = {
      fullName,
      email,
      phone: normalizeString(body.phone),
      businessName: normalizeString(body.businessName),
      selectedPackage,
      businessType: normalizeString(body.businessType),
      serviceModel: normalizeString(body.serviceModel),
      integrations: normalizeString(body.integrations),
      projectGoals: normalizeString(body.projectGoals),
      extraNotes: normalizeString(body.extraNotes),
    };

    const admin = createAdminSupabaseClient();
    const cookieStore = await cookies();
    const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value;
    const visitorKey = cookieStore.get(REFERRAL_VISITOR_COOKIE_NAME)?.value;
    const [
      { data: existingReferral },
      { data: priorLeads },
      { data: cookiePartner },
    ] = await Promise.all([
      admin
        .from("referrals")
        .select("id,partner_id")
        .ilike("customer_email", email)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      admin
        .from(hireUsSubmissionsTable)
        .select("*")
        .ilike("email", email)
        .limit(1),
      referralCode
        ? admin
            .from("referral_partners")
            .select("id,referral_code,first_name,email,status")
            .eq("referral_code", referralCode)
            .eq("status", "approved")
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const attributedPartnerId =
      existingReferral?.partner_id ?? cookiePartner?.id ?? null;
    if (attributedPartnerId) {
      insertData.referral_partner_id = attributedPartnerId;
      insertData.referral_id = existingReferral?.id ?? null;
      insertData.referral_code = existingReferral
        ? null
        : cookiePartner?.referral_code;
      insertData.referral_source = existingReferral
        ? "existing_referral"
        : "referral_link";
      insertData.referral_attributed_at = new Date().toISOString();
    }

    const { data: savedLead, error: saveError } = await admin
      .from(hireUsSubmissionsTable)
      .insert(insertData)
      .select("*")
      .single();
    if (saveError) throw saveError;

    if (!existingReferral && cookiePartner) {
      const nameParts = fullName.split(/\s+/);
      const { data: newReferral, error: referralError } = await admin
        .from("referrals")
        .insert({
          partner_id: cookiePartner.id,
          lead_id: savedLead?.id != null ? String(savedLead.id) : null,
          business_name: emailPayload.businessName || null,
          customer_first_name: nameParts.shift() ?? fullName,
          customer_last_name: nameParts.join(" ") || "Not provided",
          customer_email: email,
          customer_phone: emailPayload.phone,
          service_interest: selectedPackage,
          notes: emailPayload.projectGoals || null,
          source: "referral_link",
          permission_confirmed: false,
          duplicate_review: Boolean(priorLeads?.length),
        })
        .select("id")
        .single();
      if (referralError) throw referralError;
      await admin
        .from(hireUsSubmissionsTable)
        .update({ referral_id: newReferral.id })
        .eq("id", savedLead.id);
      if (visitorKey)
        await admin
          .from("referral_attributions")
          .update({
            referral_id: newReferral.id,
            converted_at: new Date().toISOString(),
          })
          .eq("visitor_key", visitorKey)
          .is("converted_at", null);
      await writeAudit({
        action: priorLeads?.length
          ? "existing_customer_referral_flagged"
          : "referral_link_converted",
        entityType: "referral",
        entityId: newReferral.id,
        after: { partner_id: cookiePartner.id, lead_id: String(savedLead.id) },
      });
      await sendReferralEmail(cookiePartner.email, {
        kind: "new_referral",
        firstName: cookiePartner.first_name,
        businessName: emailPayload.businessName || fullName,
        portalUrl: `${getSiteUrl()}/partner/referrals`,
      }).catch((error) => console.error("PARTNER_REFERRAL_EMAIL_ERROR", error));
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = getResendClient();
        const submissionDate = new Date().toISOString();
        const emailResults = await Promise.allSettled([
          resend.emails.send({
            from: senderEmail,
            to: [adminEmail, businessEmail],
            replyTo: emailPayload.email,
            subject: "New Steady Start Project Request",
            text: formatProjectRequestEmail(emailPayload, submissionDate),
          }),
          resend.emails.send({
            from: senderEmail,
            to: [emailPayload.email],
            subject: "We received your Steady Start request",
            text: formatCustomerConfirmationEmail(emailPayload),
          }),
        ]);

        emailResults.forEach((result, index) => {
          const target =
            index === 0
              ? "ADMIN_EMAIL_SEND_ERROR"
              : "CUSTOMER_EMAIL_SEND_ERROR";

          if (result.status === "rejected") {
            console.error(target, result.reason);
            return;
          }

          if (result.value?.error) {
            console.error(target, result.value.error);
            return;
          }
        });
      } catch (error) {
        console.error("EMAIL_SEND_ERROR", error);
      }
    } else {
      console.error("MISSING_RESEND_API_KEY", {
        fullName,
        email,
        selectedPackage,
      });
    }

    return buildSuccessResponse();
  } catch (error) {
    console.error("[send-project] Unable to process project request:", error);

    return buildGenericErrorResponse();
  }
}
