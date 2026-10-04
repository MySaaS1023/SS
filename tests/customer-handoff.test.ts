import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CUSTOMER_ACCESS_DAYS,
  canPartnerResendInvite,
  customerAccessExpiresAt,
  customerInviteMessage,
  customerJourneyStatus,
  generateCustomerAccessToken,
  hashCustomerAccessToken,
} from "../lib/referrals/customer-handoff";
import { serviceOfferings } from "../lib/site-data";

const source = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("customer access tokens are random, opaque, and stored by hash", () => {
  const first = generateCustomerAccessToken();
  const second = generateCustomerAccessToken();
  assert.notEqual(first, second);
  assert.match(first, /^[A-Za-z0-9_-]{40,100}$/);
  assert.match(hashCustomerAccessToken(first), /^[a-f0-9]{64}$/);
  assert.doesNotMatch(first, /@|SS-|customer|partner/i);
});

test("customer access expires in thirty days", () => {
  const now = new Date("2026-10-04T00:00:00.000Z");
  assert.equal(CUSTOMER_ACCESS_DAYS, 30);
  assert.equal(customerAccessExpiresAt(now), "2026-11-03T00:00:00.000Z");
});

test("partner invitation resend uses a 24-hour cooldown", () => {
  const now = new Date("2026-10-04T12:00:00.000Z");
  assert.equal(canPartnerResendInvite(null, now), true);
  assert.equal(canPartnerResendInvite("2026-10-04T11:00:00.000Z", now), false);
  assert.equal(canPartnerResendInvite("2026-10-03T12:00:00.000Z", now), true);
});

test("customer journey never infers payment confirmation from a click", () => {
  assert.equal(
    customerJourneyStatus({
      status: "submitted",
      payment_link_clicked_at: "2026-10-04T00:00:00Z",
    }),
    "payment_pending",
  );
  assert.equal(
    customerJourneyStatus({
      status: "payment_confirmed",
      payment_link_clicked_at: "2026-10-04T00:00:00Z",
    }),
    "payment_confirmed",
  );
});

test("customer invitation is standardized and excludes commission details", () => {
  const message = customerInviteMessage({
    customerFirstName: "Test",
    partnerFirstName: "Partner",
    serviceInterest: "business-setup",
    secureUrl: "https://www.steadystartco.com/get-started/opaque-token",
  });
  assert.equal(message.subject, "Partner referred you to Steady Start");
  assert.match(message.text, /There is no obligation to purchase/);
  assert.match(message.text, /support@steadystartco\.com/);
  assert.doesNotMatch(message.text, /\$100|commission/i);
});

test("customer page reuses canonical services and routes into the shared intake", async () => {
  assert.equal(
    serviceOfferings.find((item) => item.key === "standard-website")?.price,
    "$319",
  );
  assert.equal(
    serviceOfferings.find((item) => item.key === "premium-website")?.price,
    "$599",
  );
  const [page, options] = await Promise.all([
    source("../app/get-started/[token]/page.tsx"),
    source("../components/referrals/customer-options.tsx"),
  ]);
  assert.match(page, /serviceOfferings/);
  assert.match(page, /IntakeForm/);
  assert.match(page, /customerHandoffToken/);
  assert.match(options, /service_selected/);
  assert.match(options, /\?service=\$\{service\.key\}#intake/);
});

test("new referral is saved before automatic invitation and email failure stays nonfatal", async () => {
  const route = await source("../app/api/partner/referrals/route.ts");
  const insertAt = route.indexOf('.from("referrals")\n      .insert');
  const inviteAt = route.indexOf("deliverCustomerInvite({");
  assert.ok(insertAt >= 0 && inviteAt > insertAt);
  assert.match(
    route,
    /customerInviteStatus: invitation\.sent \? "sent" : "failed"/,
  );
  assert.match(route, /status: 201/);
});

test("permission is required before any automatic customer invitation", async () => {
  const [route, handoff] = await Promise.all([
    source("../app/api/partner/referrals/route.ts"),
    source("../lib/referrals/customer-handoff.ts"),
  ]);
  assert.match(route, /body\.permissionConfirmed !== "yes"/);
  assert.match(handoff, /if \(!input\.referral\.permission_confirmed\)/);
});

test("partner resend and copy endpoints enforce referral ownership", async () => {
  const [invite, link] = await Promise.all([
    source("../app/api/partner/referrals/[id]/invite/route.ts"),
    source("../app/api/partner/referrals/[id]/customer-link/route.ts"),
  ]);
  for (const route of [invite, link]) {
    assert.match(route, /requirePartnerApi/);
    assert.match(route, /\.eq\("partner_id", auth\.partner\.id\)/);
  }
  assert.match(invite, /Invitation already sent recently/);
});

test("migration is additive and leaves historical referrals not sent", async () => {
  const sql = await source(
    "../supabase/migrations/202610040001_referral_customer_handoff.sql",
  );
  assert.match(sql, /add column if not exists customer_access_token_hash/);
  assert.match(sql, /customer_invite_status text not null default 'not_sent'/);
  assert.match(
    sql,
    /unique index if not exists referrals_customer_access_token_hash_idx/,
  );
  assert.doesNotMatch(sql, /\b(delete|truncate)\b/i);
  assert.doesNotMatch(sql, /net\.http|emails\.send|sendReferral/i);
});

test("customer activity records selection and clicks without creating commissions", async () => {
  const route = await source(
    "../app/api/customer-handoff/[token]/activity/route.ts",
  );
  assert.match(route, /service_selected/);
  assert.match(route, /payment_link_clicked/);
  assert.match(route, /consultation_clicked/);
  assert.doesNotMatch(route, /referral_commissions|confirm_referral_payment/);
});
