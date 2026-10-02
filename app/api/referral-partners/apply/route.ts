import { NextResponse } from "next/server";

import {
  adminEmail,
  businessEmail,
  getResendClient,
  senderEmail,
} from "@/lib/email";
import { sendReferralEmail } from "@/lib/referrals/email";
import { REFERRAL_TERMS_VERSION } from "@/lib/referrals/config";
import {
  normalizeText,
  rateLimit,
  validEmail,
  writeAudit,
} from "@/lib/referrals/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`application:${ip}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const application = {
      first_name: normalizeText(body.firstName, 120),
      last_name: normalizeText(body.lastName, 120),
      email: normalizeText(body.email, 254).toLowerCase(),
      phone: normalizeText(body.phone, 60),
      city: normalizeText(body.city, 120),
      state: normalizeText(body.state, 40),
      heard_about: normalizeText(body.heardAbout, 240),
      motivation: normalizeText(body.motivation),
      referral_plan: normalizeText(body.referralPlan),
      website: normalizeText(body.website, 500) || null,
      social_profile: normalizeText(body.socialProfile, 500) || null,
      status: "pending",
      terms_version: REFERRAL_TERMS_VERSION,
      terms_accepted_at: new Date().toISOString(),
      information_confirmed: body.accurate === "yes",
      acceptance_acknowledged: body.notGuaranteed === "yes",
    };

    if (
      !application.first_name ||
      !application.last_name ||
      !application.phone ||
      !application.city ||
      !application.state ||
      !application.heard_about ||
      !application.motivation ||
      !application.referral_plan ||
      !validEmail(application.email)
    ) {
      return NextResponse.json(
        {
          error: "Please complete all required fields with valid information.",
        },
        { status: 400 },
      );
    }
    if (
      !application.information_confirmed ||
      !application.acceptance_acknowledged ||
      body.terms !== "yes"
    ) {
      return NextResponse.json(
        { error: "All required confirmations must be accepted." },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("referral_partner_applications")
      .insert(application)
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505")
        return NextResponse.json(
          {
            error: "An application for this email address is already pending.",
          },
          { status: 409 },
        );
      throw error;
    }

    await writeAudit({
      action: "application_submitted",
      entityType: "application",
      entityId: data.id,
      after: { email: application.email },
    });

    const messages: Promise<unknown>[] = [
      sendReferralEmail(application.email, {
        kind: "application_received",
        firstName: application.first_name,
      }),
    ];
    if (process.env.RESEND_API_KEY) {
      messages.push(
        getResendClient().emails.send({
          from: senderEmail,
          to: Array.from(new Set([adminEmail, businessEmail])),
          replyTo: application.email,
          subject: "New Referral Partner application",
          text: `New Referral Partner application\n\n${application.first_name} ${application.last_name}\n${application.email}\n${application.phone}\n${application.city}, ${application.state}\n\nReview it in the Referral Program admin area.`,
        }),
      );
    }
    const results = await Promise.allSettled(messages);
    results.forEach((result) => {
      if (result.status === "rejected")
        console.error("REFERRAL_APPLICATION_EMAIL_ERROR", result.reason);
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("REFERRAL_APPLICATION_ERROR", error);
    return NextResponse.json(
      { error: "We could not submit your application. Please try again." },
      { status: 500 },
    );
  }
}
