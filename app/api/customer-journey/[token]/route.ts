import { NextResponse } from "next/server";

import {
  customerJourneyV2Enabled,
  customerProgressStage,
  normalizeSelectedService,
  sanitizeCustomerPreferences,
  sanitizeCustomerProfile,
} from "@/lib/referrals/customer-journey";
import { hashCustomerAccessToken } from "@/lib/referrals/customer-handoff";
import {
  createPartnerNotification,
  referralDisplayName,
} from "@/lib/referrals/notifications";
import { normalizeText, rateLimit, validEmail } from "@/lib/referrals/server";
import { serviceOfferings } from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

function validToken(token: string) {
  return /^[A-Za-z0-9_-]{40,100}$/.test(token);
}

async function loadReferral(token: string) {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("referrals")
    .select(
      "id,partner_id,business_name,customer_first_name,customer_last_name,customer_email,customer_phone,status,selected_service,selected_package,customer_access_token_expires_at,customer_profile,service_preferences,customer_intake_step,customer_profile_version,customer_autosaved_at,customer_progress_stage",
    )
    .eq("customer_access_token_hash", hashCustomerAccessToken(token))
    .maybeSingle();
  if (
    !data?.customer_access_token_expires_at ||
    new Date(data.customer_access_token_expires_at) <= new Date()
  )
    return { admin, referral: null };
  return { admin, referral: data };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!customerJourneyV2Enabled())
    return NextResponse.json(
      { error: "Feature unavailable." },
      { status: 404 },
    );
  if (!validToken(token))
    return NextResponse.json(
      { error: "Invalid customer link." },
      { status: 404 },
    );
  const { referral } = await loadReferral(token);
  if (!referral)
    return NextResponse.json(
      { error: "Customer link expired." },
      { status: 410 },
    );
  return NextResponse.json({
    success: true,
    version: referral.customer_profile_version,
    step: referral.customer_intake_step,
    selectedService: referral.selected_service,
    profile: {
      fullName: [referral.customer_first_name, referral.customer_last_name]
        .filter(Boolean)
        .join(" "),
      email: referral.customer_email,
      phone: referral.customer_phone,
      businessName: referral.business_name ?? "",
      ...(referral.customer_profile ?? {}),
    },
    preferences: referral.service_preferences ?? {},
    savedAt: referral.customer_autosaved_at,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!customerJourneyV2Enabled())
    return NextResponse.json(
      { error: "Feature unavailable." },
      { status: 404 },
    );
  if (!validToken(token))
    return NextResponse.json(
      { error: "Invalid customer link." },
      { status: 404 },
    );
  const tokenHash = hashCustomerAccessToken(token);
  if (!rateLimit(`customer-autosave:${tokenHash}`, 40, 60_000))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { admin, referral } = await loadReferral(token);
  if (!referral)
    return NextResponse.json(
      { error: "Customer link expired." },
      { status: 410 },
    );

  const expectedVersion = Number(body.version);
  if (
    !Number.isInteger(expectedVersion) ||
    expectedVersion !== referral.customer_profile_version
  )
    return NextResponse.json(
      {
        error: "This profile changed in another session. Refresh to continue.",
      },
      { status: 409 },
    );

  const fullName = normalizeText(body.fullName, 240);
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() ?? "";
  const lastName = nameParts.join(" ");
  const email = normalizeText(body.email, 254).toLowerCase();
  const phone = normalizeText(body.phone, 60);
  const businessName = normalizeText(body.businessName, 160);
  if (
    !firstName ||
    !lastName ||
    !validEmail(email) ||
    phone.replace(/\D/g, "").length < 7 ||
    !businessName
  )
    return NextResponse.json(
      { error: "Complete the required customer information before saving." },
      { status: 400 },
    );

  const { data: emailOwner } = await admin
    .from("referrals")
    .select("id")
    .ilike("customer_email", email)
    .neq("id", referral.id)
    .limit(1)
    .maybeSingle();
  if (emailOwner)
    return NextResponse.json(
      { error: "This email is already connected to another referral." },
      { status: 409 },
    );

  const profile = sanitizeCustomerProfile(body.profile);
  const preferences = sanitizeCustomerPreferences(body.preferences);
  const selectedService = normalizeSelectedService(body.selectedService);
  const requestedStep = Math.min(4, Math.max(1, Number(body.step) || 1));
  const nextVersion = referral.customer_profile_version + 1;
  const now = new Date().toISOString();
  const offering =
    selectedService && selectedService !== "recommend"
      ? serviceOfferings.find((service) => service.key === selectedService)
      : null;
  const serviceChanged =
    Boolean(selectedService) && selectedService !== referral.selected_service;
  const update: Record<string, unknown> = {
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_email: email,
    customer_phone: phone,
    business_name: businessName,
    customer_profile: profile,
    service_preferences: preferences,
    customer_intake_step: requestedStep,
    customer_profile_version: nextVersion,
    customer_autosaved_at: now,
    customer_last_activity_at: now,
    customer_progress_stage: customerProgressStage(
      requestedStep,
      selectedService,
    ),
    selected_service: selectedService === "recommend" ? null : selectedService,
    selected_package:
      selectedService === "recommend"
        ? "Other / Not Sure Yet"
        : (offering?.name ?? referral.selected_package),
    status:
      serviceChanged && referral.status === "partial"
        ? "interested"
        : referral.status,
  };
  if (serviceChanged) update.service_selected_at = now;
  const { data: saved, error } = await admin
    .from("referrals")
    .update(update)
    .eq("id", referral.id)
    .eq("customer_profile_version", expectedVersion)
    .select("customer_profile_version,customer_autosaved_at")
    .maybeSingle();
  if (error || !saved)
    return NextResponse.json(
      {
        error: "This profile changed in another session. Refresh to continue.",
      },
      { status: 409 },
    );

  const profileChanged =
    JSON.stringify(sanitizeCustomerProfile(referral.customer_profile)) !==
    JSON.stringify(profile);
  const preferencesChanged =
    JSON.stringify(
      sanitizeCustomerPreferences(referral.service_preferences),
    ) !== JSON.stringify(preferences);
  const changedFields = [
    referral.customer_first_name !== firstName ||
    referral.customer_last_name !== lastName
      ? "name"
      : null,
    referral.customer_email !== email ? "email" : null,
    referral.customer_phone !== phone ? "phone" : null,
    referral.business_name !== businessName ? "business_name" : null,
    serviceChanged ? "selected_service" : null,
    referral.customer_intake_step !== requestedStep ? "intake_step" : null,
    profileChanged ? "customer_profile" : null,
    preferencesChanged ? "service_preferences" : null,
  ].filter(Boolean);
  await admin.from("referral_audit_log").insert({
    action: "customer_profile_autosaved",
    entity_type: "referral",
    entity_id: referral.id,
    before_data: { version: expectedVersion },
    after_data: {
      version: nextVersion,
      step: requestedStep,
      changed_fields: changedFields,
    },
  });
  if (serviceChanged && offering)
    await createPartnerNotification({
      admin,
      partnerId: referral.partner_id,
      type: "service_selected",
      title: "Customer Interested",
      message: `${referralDisplayName({
        business_name: businessName,
        customer_first_name: firstName,
      })} selected ${offering.name}.`,
      eventKey: `service_selected:${referral.id}:${offering.key}`,
      referralId: referral.id,
    });

  return NextResponse.json({
    success: true,
    version: saved.customer_profile_version,
    savedAt: saved.customer_autosaved_at,
  });
}
