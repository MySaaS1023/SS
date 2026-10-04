import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const read = (path: string) => readFile(path, "utf8");

test("notification migration is forward-only, isolated by RLS, and idempotent", async () => {
  const migration = await read(
    "supabase/migrations/202610040002_referral_link_notifications.sql",
  );

  assert.match(
    migration,
    /create table if not exists public\.partner_notifications/,
  );
  assert.match(migration, /event_key text not null unique/);
  assert.match(
    migration,
    /alter table public\.partner_notifications enable row level security/,
  );
  assert.match(
    migration,
    /where user_id = auth\.uid\(\) and status = 'approved'/,
  );
  assert.match(
    migration,
    /revoke insert, update, delete .* from anon, authenticated/,
  );
  assert.doesNotMatch(migration, /insert into public\.partner_notifications/i);
  assert.doesNotMatch(migration, /truncate|delete from public/i);
});

test("referral link remains approved-only first-touch and creates one anonymous notification", async () => {
  const route = await read("app/ref/[referralCode]/route.ts");

  assert.match(route, /\.eq\("status", "approved"\)/);
  assert.match(route, /First eligible partner keeps attribution/);
  assert.match(route, /onConflict: "visitor_key", ignoreDuplicates: true/);
  assert.match(route, /eventKey: `referral_link_visit:\$\{attribution\.id\}`/);
  assert.match(
    route,
    /Someone visited Steady Start using your referral link\./,
  );
  assert.doesNotMatch(route, /user-agent|ip address|fingerprint/i);
});

test("banner is personalized without private Partner or commission information", async () => {
  const [banner, endpoint, activity] = await Promise.all([
    read("components/referrals/referral-banner.tsx"),
    read("app/api/referral-attribution/banner/route.ts"),
    read("app/api/referral-attribution/activity/route.ts"),
  ]);

  assert.match(banner, /You were referred by \{partnerName\}/);
  assert.match(banner, /sessionStorage\.setItem/);
  assert.match(banner, /href="\/pricing"/);
  assert.match(banner, /href="\/get-started"/);
  assert.doesNotMatch(banner, /commission|payout|partnerEmail|phone/i);
  assert.match(endpoint, /\.select\("first_name,last_name,referral_code"\)/);
  assert.doesNotMatch(endpoint, /email|phone|commission|payout/i);
  assert.match(activity, /services_viewed_at/);
  assert.doesNotMatch(activity, /user-agent|ip address|fingerprint/i);
});

test("identified intake links attribution, prevents cross-owner linking, and notifies once", async () => {
  const route = await read("app/api/send-project/route.ts");

  assert.match(
    route,
    /existingReferral\?\.partner_id \?\? cookiePartner\?\.id/,
  );
  assert.match(route, /cookiePartner\?\.id === attributedPartnerId/);
  assert.match(route, /source: "referral_link"/);
  assert.match(route, /eventKey: `qualified_lead:\$\{savedLead\.id\}`/);
  assert.match(route, /submitted their information through your referral/);
  assert.match(route, /eventKey: `customer_viewed:\$\{linkedReferralId\}`/);
  assert.match(route, /eventKey: `service_selected:\$\{linkedReferralId\}/);
});

test("manual submission reuses the same Partner referral and flags ownership conflicts", async () => {
  const route = await read("app/api/partner/referrals/route.ts");

  assert.match(route, /existingReferral\.partner_id === auth\.partner\.id/);
  assert.match(route, /duplicate_referral_prevented/);
  assert.match(route, /referral_ownership_conflict_flagged/);
  assert.match(route, /without creating a duplicate/);
});

test("notification reads and writes are scoped to the authenticated Partner", async () => {
  const route = await read("app/api/partner/notifications/route.ts");

  assert.match(route, /requirePartnerApi/);
  assert.equal(
    (route.match(/\.eq\("partner_id", auth\.partner\.id\)/g) ?? []).length,
    2,
  );
  assert.match(route, /action === "mark_all_read"/);
  assert.match(route, /action === "mark_read"/);
});

test("meaningful customer and commission milestones use idempotent event keys", async () => {
  const [viewPage, activityRoute, commissionActions] = await Promise.all([
    read("app/get-started/[token]/page.tsx"),
    read("app/api/customer-handoff/[token]/activity/route.ts"),
    read("app/admin/(protected)/referral-program/actions.ts"),
  ]);

  assert.match(viewPage, /eventKey: `customer_viewed:\$\{referral\.id\}`/);
  assert.match(
    activityRoute,
    /eventKey: `service_selected:\$\{referral\.id\}:\$\{service\}`/,
  );
  assert.match(
    commissionActions,
    /eventKey: `commission_eligible:\$\{commission\.id\}`/,
  );
  assert.match(
    commissionActions,
    /eventKey: `commission_approved:\$\{before\.id\}`/,
  );
  assert.match(
    commissionActions,
    /eventKey: `commission_paid:\$\{before\.id\}`/,
  );
});

test("hosted payment clicks record activity without confirming payment", async () => {
  const [form, route] = await Promise.all([
    read("components/intake-form.tsx"),
    read("app/api/referral-attribution/payment-click/route.ts"),
  ]);

  assert.match(form, /fetch\("\/api\/referral-attribution\/payment-click"/);
  assert.match(route, /payment_link_clicked_at/);
  assert.doesNotMatch(
    route,
    /payment_confirmed|referral_commissions|mark_referral_commission_paid/,
  );
});

test("Partner and Admin surfaces include link metrics and recent activity", async () => {
  const [dashboard, adminOverview, adminPartners, nav] = await Promise.all([
    read("app/partner/(portal)/page.tsx"),
    read("app/admin/(protected)/referral-program/page.tsx"),
    read("app/admin/(protected)/referral-program/partners/page.tsx"),
    read("components/referrals/partner-nav.tsx"),
  ]);

  for (const source of [dashboard, adminOverview, adminPartners]) {
    assert.match(source, /Referral Link Visits|Link Visits/);
    assert.match(source, /Qualified Leads/);
  }
  assert.match(dashboard, /Recent Referral Activity/);
  assert.match(nav, /🔔 \{unreadCount\}/);
  assert.match(nav, /\/partner\/notifications/);
});
