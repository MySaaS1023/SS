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
