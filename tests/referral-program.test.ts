import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  REFERRAL_COMMISSION_CENTS,
  getReferralCookieDays,
} from "../lib/referrals/config";
import {
  chooseFirstReferralOwner,
  generateReferralCode,
  invalidPaymentCommissionStatus,
  isSelfReferral,
} from "../lib/referrals/rules";
import { POST as submitApplication } from "../app/api/referral-partners/apply/route";

function applicationRequest(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/referral-partners/apply", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      firstName: "Test",
      lastName: "Applicant",
      email: "test-applicant@example.com",
      phone: "555-0100",
      city: "Denver",
      state: "CO",
      heardAbout: "Testing",
      motivation: "Validate the application endpoint.",
      referralPlan: "Refer qualified businesses.",
      accurate: "yes",
      terms: "yes",
      notGuaranteed: "yes",
      ...overrides,
    }),
  });
}

test("referral codes are opaque, non-sequential, and collision-resistant in a sample", () => {
  const codes = new Set(Array.from({ length: 1_000 }, generateReferralCode));
  assert.equal(codes.size, 1_000);
  for (const code of codes) assert.match(code, /^SS-[A-HJ-NP-Z2-9]{6}$/);
});

test("first-touch attribution cannot be overwritten", () => {
  assert.equal(
    chooseFirstReferralOwner("partner-one", "partner-two"),
    "partner-one",
  );
  assert.equal(chooseFirstReferralOwner(null, "partner-two"), "partner-two");
});

test("self-referrals are detected without case sensitivity", () => {
  assert.equal(
    isSelfReferral("Partner@Example.com", "partner@example.com"),
    true,
  );
  assert.equal(
    isSelfReferral("partner@example.com", "customer@example.com"),
    false,
  );
});

test("invalid payments reverse unpaid commissions and dispute paid commissions", () => {
  assert.equal(invalidPaymentCommissionStatus("eligible"), "reversed");
  assert.equal(invalidPaymentCommissionStatus("approved"), "reversed");
  assert.equal(invalidPaymentCommissionStatus("paid"), "disputed");
});

test("program defaults to a $100 commission and 30-day attribution", () => {
  const prior = process.env.REFERRAL_ATTRIBUTION_DAYS;
  delete process.env.REFERRAL_ATTRIBUTION_DAYS;
  assert.equal(REFERRAL_COMMISSION_CENTS, 10_000);
  assert.equal(getReferralCookieDays(), 30);
  if (prior) process.env.REFERRAL_ATTRIBUTION_DAYS = prior;
});

test("migration enforces one commission per transaction and RLS", async () => {
  const sql = await readFile(
    new URL(
      "../supabase/migrations/202609300001_referral_partner_program.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sql, /transaction_id text not null unique/i);
  assert.match(
    sql,
    /commission_amount_cents integer not null default 10000 check \(commission_amount_cents = 10000\)/i,
  );
  assert.match(sql, /alter table public\.referrals enable row level security/i);
  assert.match(sql, /partners read own referrals/i);
  assert.match(sql, /on conflict \(transaction_id\) do nothing/i);
});

test("application endpoint rejects missing required fields", async () => {
  const response = await submitApplication(applicationRequest({ firstName: "" }));
  assert.equal(response.status, 400);
});

test("application endpoint rejects an invalid email", async () => {
  const response = await submitApplication(
    applicationRequest({ email: "not-an-email" }),
  );
  assert.equal(response.status, 400);
});

test("application endpoint requires every confirmation", async () => {
  const response = await submitApplication(applicationRequest({ terms: "" }));
  assert.equal(response.status, 400);
});

test("application endpoint reports missing server configuration safely", async () => {
  const priorUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const priorKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const response = await submitApplication(applicationRequest());
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: "We could not submit your application. Please try again.",
    });
  } finally {
    if (priorUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = priorUrl;
    if (priorKey) process.env.SUPABASE_SERVICE_ROLE_KEY = priorKey;
  }
});
