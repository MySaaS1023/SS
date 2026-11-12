import assert from "node:assert/strict";
import test from "node:test";
import Module, { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeReferralSearch, matchesReferralSearch } from "../components/admin/referral-records/referral-search";

test("referral search normalizes bounded single-string input without treating arrays as a search", () => {
  assert.equal(normalizeReferralSearch("  Example Business  "), "Example Business");
  assert.equal(normalizeReferralSearch("x".repeat(250)).length, 200);
  for (const value of [null, undefined, ["secret"], { q: "value" }, 42]) assert.equal(normalizeReferralSearch(value), "");
  assert.equal(matchesReferralSearch("CUSTOMER", [null, 5, "Synthetic Customer"]), true);
  assert.equal(matchesReferralSearch("missing", ["Synthetic Business"]), false);
  assert.equal(matchesReferralSearch("", [null]), true);
});

test("rendered referral search matches customer, business, associated partner, Rep ID and stage while preserving ownership filter", async () => {
  const localRequire = createRequire(import.meta.url);
  const loader = Module as unknown as { _load: (name: string, parent: unknown, main: boolean) => unknown };
  const filename = localRequire.resolve("../components/admin/referral-records/referrals");
  const saved = localRequire.cache[filename];
  delete localRequire.cache[filename];
  const original = loader._load;
  const data = {
    referrals: [{ id: "synthetic-referral", partner_id: "partner-one", customer_first_name: "Synthetic", customer_last_name: "Customer", business_name: "Example Business", customer_email: "customer@example.invalid", customer_phone: "+1 202 555 0100", status: "qualified", service_interest: "standard-website", source: "referral_link", submitted_at: "2026-11-12T12:00:00Z" }],
    referral_partners: [{ id: "partner-one", first_name: "Partner", last_name: "One", referral_code: "STABLE-REP-ONE", status: "approved" }],
  };
  const database = { from(table: keyof typeof data) { const query = { select: () => query, order: () => query, then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: data[table], error: null }).then(resolve) }; return query; } };
  loader._load = (name, parent, main) => {
    if (name === "@/lib/admin-management/private-page") return { requirePrivateAdministrator: async () => ({ id: "synthetic-authorized-admin" }) };
    if (name === "@/lib/supabase/server") return { createAdminSupabaseClient: () => database };
    if (name === "@/app/admin/(protected)/referral-program/actions") return { resendCustomerInvite: async () => {}, updateReferral: async () => {} };
    if (name === "@/components/admin/record-archive-control") return { RecordArchiveControl: () => null };
    return original(name, parent, main);
  };
  try {
    const { ReferralRecords } = localRequire(filename) as { ReferralRecords: (props: { standalone?: boolean; partnerId?: string; query?: unknown }) => Promise<React.ReactNode> };
    for (const query of ["customer", "EXAMPLE BUSINESS", "partner one", "stable-rep-one", "qualified"]) {
      const html = renderToStaticMarkup(await ReferralRecords({ query }));
      assert.match(html, /Synthetic Customer/);
      assert.match(html, /<details[^>]*open=""/);
      assert.match(html, /maxLength="200"/);
    }
    const missing = renderToStaticMarkup(await ReferralRecords({ query: "not-found" }));
    assert.doesNotMatch(missing, /class="referral-record"/);
    assert.match(missing, /No records in this section/);
    const excluded = renderToStaticMarkup(await ReferralRecords({ standalone: true, partnerId: "another-partner", query: "customer" }));
    assert.doesNotMatch(excluded, /class="referral-record"/);
    assert.match(excluded, /name="partner" value="another-partner"/);
    assert.match(excluded, /href="\/admin\/referral-program\/referrals\?partner=another-partner"/);
    const manipulated = renderToStaticMarkup(await ReferralRecords({ query: "<script>alert(1)</script>" }));
    assert.doesNotMatch(manipulated, /<script>alert/);
    assert.match(manipulated, /&lt;script&gt;/);
  } finally {
    loader._load = original;
    delete localRequire.cache[filename];
    if (saved) localRequire.cache[filename] = saved;
  }
});
