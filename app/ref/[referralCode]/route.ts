import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import {
  REFERRAL_COOKIE_NAME,
  REFERRAL_VISITOR_COOKIE_NAME,
  getReferralCookieDays,
  getSiteUrl,
} from "@/lib/referrals/config";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { createPartnerNotification } from "@/lib/referrals/notifications";

function decodeCookie(value?: string) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ referralCode: string }> },
) {
  const { referralCode } = await params;
  const code = referralCode.trim().toUpperCase();
  const requestUrl = new URL(request.url);
  const response = NextResponse.redirect(new URL("/", getSiteUrl()), 307);
  const existingCode = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${REFERRAL_COOKIE_NAME}=([^;]+)`))?.[1];
  const existingVisitor = request.headers
    .get("cookie")
    ?.match(
      new RegExp(`(?:^|;\\s*)${REFERRAL_VISITOR_COOKIE_NAME}=([^;]+)`),
    )?.[1];
  const admin = createAdminSupabaseClient();
  const decodedVisitor = decodeCookie(existingVisitor);
  const validVisitor =
    decodedVisitor && /^[0-9a-f-]{36}$/i.test(decodedVisitor)
      ? decodedVisitor
      : null;
  const { data: visitorAttribution } = validVisitor
    ? await admin
        .from("referral_attributions")
        .select("partner_id,referral_code,expires_at")
        .eq("visitor_key", validVisitor)
        .maybeSingle()
    : { data: null };
  const visitorAttributionIsActive = Boolean(
    visitorAttribution &&
    new Date(visitorAttribution.expires_at).getTime() > Date.now(),
  );
  let partner: { id: string; referral_code: string } | null = null;
  let hasEligibleVisitorAttribution = false;

  if (visitorAttributionIsActive && visitorAttribution) {
    const { data: attributedPartner } = await admin
      .from("referral_partners")
      .select("id,referral_code")
      .eq("id", visitorAttribution.partner_id)
      .eq("status", "approved")
      .maybeSingle();
    partner = attributedPartner;
    hasEligibleVisitorAttribution = Boolean(attributedPartner);
  }

  if (!partner && existingCode) {
    const { data: existingPartner } = await admin
      .from("referral_partners")
      .select("id,referral_code")
      .eq("referral_code", decodeCookie(existingCode))
      .eq("status", "approved")
      .maybeSingle();
    partner = existingPartner;
  }

  if (!partner) {
    const { data: requestedPartner } = await admin
      .from("referral_partners")
      .select("id,referral_code")
      .eq("referral_code", code)
      .eq("status", "approved")
      .maybeSingle();
    partner = requestedPartner;
  }
  if (!partner) return response;

  const days = getReferralCookieDays();
  const visitorKey =
    validVisitor && (!visitorAttribution || hasEligibleVisitorAttribution)
      ? validVisitor
      : randomUUID();
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  const { data: attribution, error } = await admin
    .from("referral_attributions")
    .upsert(
      {
        partner_id: partner.id,
        referral_code: partner.referral_code,
        visitor_key: visitorKey,
        source: "referral_link",
        landing_path: requestUrl.searchParams.get("landing")?.startsWith("/")
          ? requestUrl.searchParams.get("landing")
          : "/",
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "visitor_key", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (error) console.error("REFERRAL_ATTRIBUTION_ERROR", error);
  if (attribution)
    await createPartnerNotification({
      admin,
      partnerId: partner.id,
      type: "referral_link_visit",
      title: "New referral activity",
      message: "Someone visited Steady Start using your referral link.",
      eventKey: `referral_link_visit:${attribution.id}`,
    });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: days * 86_400,
  };
  response.cookies.set(
    REFERRAL_COOKIE_NAME,
    partner.referral_code,
    cookieOptions,
  );
  response.cookies.set(REFERRAL_VISITOR_COOKIE_NAME, visitorKey, cookieOptions);
  return response;
}
