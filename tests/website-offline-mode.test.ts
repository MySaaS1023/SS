import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  isAlwaysAvailablePath,
  offlineApiResponse,
  offlinePageHtml,
} from "../lib/site-status/core";

const read = (path: string) => readFile(path, "utf8");

test("offline page contains only the approved temporary message and branding", () => {
  const html = offlinePageHtml();
  assert.match(html, /Steady Start/);
  assert.match(html, /Website Temporarily Unavailable/);
  assert.match(
    html,
    /Our website is currently unavailable\. Please check back soon\./,
  );
  assert.doesNotMatch(html, /Pricing|Services|Start Here|Referral Partners/);
});

test("admin, Partner, authentication, and webhook namespaces remain available", () => {
  for (const path of [
    "/admin",
    "/admin/website-status",
    "/api/admin/auth/login",
    "/partner/login",
    "/api/partner/auth/login",
    "/auth/callback",
    "/api/webhooks/stripe",
    "/api/stripe/webhook",
  ])
    assert.equal(isAlwaysAvailablePath(path), true, path);
});

test("public pages, submissions, checkout, attribution, and handoffs are blocked", () => {
  for (const path of [
    "/",
    "/pricing",
    "/checkout",
    "/handoff/private-token",
    "/get-started/private-token",
    "/ref/SS-TEST",
    "/referral-intake",
    "/referral-partners/apply",
    "/api/send-project",
    "/api/referral-intake",
    "/api/referral-partners/apply",
    "/api/referral-attribution/activity",
    "/api/customer-handoff/private-token/activity",
    "/api/checkout",
  ])
    assert.equal(isAlwaysAvailablePath(path), false, path);
  assert.equal(offlineApiResponse().code, "website_temporarily_offline");
});

test("middleware returns 503 and reads the persistent database setting", async () => {
  const source = await read("middleware.ts");
  assert.match(source, /site_settings/);
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(source, /cache: "no-store"/);
  assert.match(source, /status: 503/);
  assert.match(source, /Retry-After/);
  assert.match(source, /isAlwaysAvailablePath/);
});

test("database migration is additive, private, and defaults safely online", async () => {
  const sql = await read("supabase/migrations/202610250001_website_status.sql");
  assert.match(sql, /create table if not exists public\.site_settings/);
  assert.match(sql, /website_online boolean not null default true/);
  assert.match(sql, /values \('public_website', true\)/);
  assert.match(sql, /on conflict \(key\) do nothing/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all.*anon, authenticated/);
  assert.doesNotMatch(sql, /\bdelete from\b|\btruncate\b|\bdrop table\b/i);
});

test("admin-only status update is audited and available in navigation", async () => {
  const [action, layout] = await Promise.all([
    read("app/admin/(protected)/website-status/actions.ts"),
    read("app/admin/(protected)/layout.tsx"),
  ]);
  assert.match(action, /getFullyAuthorizedAdminUser/);
  assert.match(action, /public_website_enabled/);
  assert.match(action, /public_website_disabled/);
  assert.match(action, /\.eq\("website_online", before\.website_online\)/);
  assert.match(layout, /\/admin\/website-status/);
});
