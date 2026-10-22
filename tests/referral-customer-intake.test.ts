import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  customerIntakeWelcomeMessage,
  customerJourneyStatus,
} from "../lib/referrals/customer-handoff";

const read = (path: string) => readFile(path, "utf8");

test("customer intake migration is additive, concurrency-safe, and preserves RLS", async () => {
  const migration = await read(
    "supabase/migrations/202610220001_referral_customer_intake.sql",
  );
  assert.match(migration, /add column if not exists customer_consent_version/);
  assert.match(migration, /'partial'/);
  assert.match(migration, /'interested'/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /customer_intake_email_claimed_at/);
  assert.match(migration, /'send_email', v_send_email/);
  assert.match(migration, /lower\(customer_email\) = v_email/);
  assert.match(migration, /v_referral\.partner_id <> p_partner_id/);
  assert.match(migration, /expires_at > now\(\)/);
  assert.match(migration, /grant execute [\s\S]* to service_role/i);
  assert.doesNotMatch(migration, /\btruncate\b|delete from public/i);
  assert.doesNotMatch(
    migration,
    /grant execute [\s\S]*(?:anon|authenticated)/i,
  );
  assert.match(
    migration,
    /v_referral\.status in \('partial', 'interested'\)[\s\S]*raise exception 'A completed service request is required before payment confirmation'/,
  );
  assert.match(migration, /p_payment_amount_cents, 10000, 'eligible'/);
});

test("customer intake page exposes representative branding without IDs or contact details", async () => {
  const [page, form] = await Promise.all([
    read("app/referral-intake/page.tsx"),
    read("components/referrals/customer-intake-form.tsx"),
  ]);
  assert.match(page, /partner\.first_name/);
  assert.match(page, /partner\.last_name/);
  assert.match(page, /CustomerIntakeForm/);
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(page, /partner\.email|partner\.phone|partner\.id}/);
  for (const field of ["fullName", "email", "phone", "businessName"])
    assert.match(form, new RegExp(`name=["']${field}["']`));
  assert.match(form, /Steady Start may email me information/);
  assert.match(form, /companyWebsite/);
});

test("public intake requires active first-touch attribution and creates no commission", async () => {
  const route = await read("app/api/referral-intake/route.ts");
  assert.match(route, /REFERRAL_VISITOR_COOKIE_NAME/);
  assert.match(route, /\.gt\("expires_at", new Date\(\)\.toISOString\(\)\)/);
  assert.match(route, /\.eq\("status", "approved"\)/);
  assert.match(route, /upsert_referral_customer_intake/);
  assert.match(route, /partial_referral:\$\{referral\.id\}/);
  assert.match(route, /customer_email_sent:\$\{referral\.id\}/);
  assert.match(route, /messageKind: "customer_intake"/);
  assert.doesNotMatch(route, /referralDisplayName/);
  assert.doesNotMatch(
    route,
    /confirm_referral_payment|referral_commissions|commission_amount/i,
  );
});

test("customer welcome email uses the dedicated secure journey copy", () => {
  const message = customerIntakeWelcomeMessage({
    customerFirstName: "Test",
    partnerName: "Sample Partner",
    secureUrl: "https://www.steadystartco.com/get-started/opaque-token",
  });
  assert.equal(
    message.subject,
    "Welcome to Steady Start — Let's Get Your Business Started",
  );
  assert.match(message.text, /through Sample Partner!/);
  assert.match(message.text, /Explore Steady Start Services/);
  assert.match(
    message.text,
    /Your Steady Start Representative: Sample Partner/,
  );
  assert.doesNotMatch(message.text, /\$100|commission|test@example|555/i);
});

test("Partner Portal includes the intake link and scoped customer details", async () => {
  const [dashboard, referrals] = await Promise.all([
    read("app/partner/(portal)/page.tsx"),
    read("app/partner/(portal)/referrals/page.tsx"),
  ]);
  assert.match(dashboard, /Copy Customer Intake Link/);
  assert.match(dashboard, /landing=.*referral-intake/);
  assert.match(referrals, /customer_email,customer_phone/);
  assert.match(referrals, /\.eq\("partner_id", context\.partner\.id\)/);
});

test("journey statuses map partial, interested, submitted, and verified conversion", () => {
  assert.equal(customerJourneyStatus({ status: "partial" }), "partial");
  assert.equal(
    customerJourneyStatus({
      status: "partial",
      service_selected_at: "2026-10-22T12:00:00Z",
    }),
    "interested",
  );
  assert.equal(
    customerJourneyStatus({
      status: "submitted",
      service_selected_at: "2026-10-22T12:00:00Z",
    }),
    "submitted",
  );
  assert.equal(
    customerJourneyStatus({ status: "payment_confirmed" }),
    "converted",
  );
});

test("service completion advances a partial referral and sends one milestone notification", async () => {
  const [route, activity] = await Promise.all([
    read("app/api/send-project/route.ts"),
    read("app/api/customer-handoff/[token]/activity/route.ts"),
  ]);
  assert.match(route, /\["partial", "interested"\]\.includes/);
  assert.match(route, /service_request_submitted:\$\{linkedReferralId\}/);
  assert.match(activity, /referral\.status === "partial"/);
  assert.match(activity, /update\.status = "interested"/);
});
