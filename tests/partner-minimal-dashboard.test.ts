import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function withPartnerComponent<T>(filename: string, dependencies: Record<string, unknown>, operation: (module: T) => Promise<void>) {
  const localRequire = createRequire(import.meta.url);
  const loader = Module as unknown as { _load: (name: string, parent: unknown, main: boolean) => unknown };
  const resolved = localRequire.resolve(filename), cached = localRequire.cache[resolved], original = loader._load;
  delete localRequire.cache[resolved];
  loader._load = (name, parent, main) => name in dependencies ? dependencies[name] : original(name, parent, main);
  try { await operation(localRequire(resolved) as T); }
  finally { loader._load = original; delete localRequire.cache[resolved]; if (cached) localRequire.cache[resolved] = cached; }
}

const context = { partner: { id: "synthetic-partner", first_name: "Synthetic", referral_code: "STABLE-SYNTHETIC-ID" } };

test("partner overview contains only two sharing cards and two actions without querying metrics or activity", async () => {
  let forbiddenCalls = 0;
  await withPartnerComponent<{ default: () => Promise<React.ReactNode> }>("../app/partner/(portal)/page", {
    "@/lib/supabase/server": {
      getApprovedPartner: async () => context,
      createAdminSupabaseClient: () => { forbiddenCalls++; throw new Error("Overview must not query dashboard metrics or notifications"); },
    },
    "@/lib/referrals/config": { getSiteUrl: () => "https://steadystart.example.invalid" },
  }, async ({ default: Dashboard }) => {
    const html = renderToStaticMarkup(await Dashboard());
    assert.equal((html.match(/class="glass-card /g) || []).length, 2);
    assert.match(html, /Welcome, Synthetic/);
    assert.match(html, /https:\/\/steadystart\.example\.invalid\/ref\/STABLE-SYNTHETIC-ID/);
    assert.match(html, /\?landing=%2Freferral-intake/);
    assert.match(html, /Copy Referral Link/);
    assert.match(html, /Copy Customer Intake Link/);
    assert.match(html, /href="\/partner\/referrals\/new"/);
    assert.match(html, /href="\/partner\/referrals"/);
    assert.doesNotMatch(html, /Recent Referral Activity|Qualified Leads|Total Referrals|Total Paid|Pending Commission/);
    assert.equal(forbiddenCalls, 0);
  });
});

test("compact partner navigation preserves all seven destinations and scopes unread notifications to the partner", async () => {
  const queries: unknown[] = [];
  const database = { from(table: string) { queries.push(table); const query = { select: () => query, eq: (field: string, value: unknown) => { queries.push([field, value]); return query; }, then: (resolve: (value: unknown) => unknown) => Promise.resolve({ count: 1 }).then(resolve) }; return query; } };
  await withPartnerComponent<{ PartnerNav: () => Promise<React.ReactNode> }>("../components/referrals/partner-nav", {
    "@/lib/supabase/server": { getApprovedPartner: async () => context, createAdminSupabaseClient: () => database },
  }, async ({ PartnerNav }) => {
    const html = renderToStaticMarkup(await PartnerNav());
    assert.equal((html.match(/<a /g) || []).length, 7);
    for (const destination of ["/partner/referrals", "/partner/referrals/new", "/partner#my-referral-link", "/partner/commissions", "/partner/resources", "/partner/settings", "/partner/notifications"])
      assert.ok(html.includes(`href="${destination}"`), destination);
    assert.match(html, /Notifications \(1 unread\)/);
    assert.deepEqual(queries, ["partner_notifications", ["partner_id", context.partner.id], ["is_read", false]]);
  });
});
