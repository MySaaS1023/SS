import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  handoffEmailMessage,
  handoffSmsMessage,
} from "../lib/handoff/messages";

const read = (path: string) => readFile(path, "utf8");

const handoff = {
  id: "00000000-0000-4000-8000-000000000001",
  businessName: "Apex Services",
  businessPhone: "+1 303-555-0198",
  businessEmail: "client@example.com",
  contactName: "Avery Client",
  websiteUrl: "https://apex.example.com/",
  url: "https://www.steadystartco.com/handoff/opaque-secure-token",
};

test("handoff migration is additive and preserves historical links and records", async () => {
  const sql = await read(
    "supabase/migrations/202610230001_client_handoff_delivery.sql",
  );
  for (const column of [
    "business_phone",
    "business_email",
    "contact_name",
    "source_referral_id",
  ])
    assert.match(sql, new RegExp(`add column if not exists ${column}`));
  assert.match(
    sql,
    /create table if not exists public\.client_handoff_deliveries/,
  );
  assert.match(
    sql,
    /unique \(handoff_id, channel, destination, content_hash\)/,
  );
  assert.match(sql, /attempt_count between 1 and 3/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all[\s\S]*anon, authenticated/);
  assert.doesNotMatch(sql, /\bdelete from\b|\btruncate\b|\bdrop table\b/i);
});

test("admin autocomplete is authorized, bounded, and uses existing private records", async () => {
  const source = await read("lib/handoff/clients.ts");
  assert.match(source, /getFullyAuthorizedAdminUser/);
  assert.match(source, /\.from\("referrals"\)/);
  assert.match(source, /\.from\("client_handoffs"\)/);
  assert.match(source, /\.limit\(8\)/);
  assert.match(source, /\.ilike\("business_name"/);
  assert.doesNotMatch(source, /fetch\(|google|search engine/i);
});

test("client corrections require explicit selection and optimistic concurrency", async () => {
  const [actions, clients, form] = await Promise.all([
    read("app/admin/(protected)/handoffs/actions.ts"),
    read("lib/handoff/clients.ts"),
    read("components/handoff/admin-forms.tsx"),
  ]);
  assert.match(actions, /saveClientCorrections/);
  assert.match(clients, /data\.source !== "referral"/);
  assert.match(clients, /\.eq\("updated_at", data\.sourceUpdatedAt\)/);
  assert.match(clients, /handoff_client_contact_updated/);
  assert.match(form, /Leave unchecked to use them only for[\s\S]*this handoff/);
});

test("created handoff exposes copy, confirmed email, and disabled SMS actions", async () => {
  const [form, actions] = await Promise.all([
    read("components/handoff/admin-forms.tsx"),
    read("app/admin/(protected)/handoffs/actions.ts"),
  ]);
  assert.match(form, /Copy Link/);
  assert.match(form, /Send to Email/);
  assert.match(form, /Email preview/);
  assert.match(form, /confirmRecipient/);
  assert.match(form, /Send to Text — Setup Required/);
  assert.match(
    form,
    /no approved provider, registration, or[\s\S]*consent workflow/,
  );
  assert.match(actions, /confirm the intended email recipient/i);
});

test("handoff email and SMS content are branded and use only the secure handoff URL", () => {
  const email = handoffEmailMessage(handoff);
  const sms = handoffSmsMessage(handoff);
  assert.equal(email.subject, "Your Website Is Ready — Steady Start");
  assert.match(email.text, /Hi Avery,/);
  assert.match(email.text, /Apex Services/);
  assert.match(email.text, /\/handoff\/opaque-secure-token/);
  assert.doesNotMatch(email.text, /client@example|303-555/);
  assert.match(sms, /Hi Avery/);
  assert.match(sms, /\/handoff\/opaque-secure-token/);
  assert.doesNotMatch(sms, /client@example|303-555/);
});

test("email delivery uses the guarded durable ledger and provider idempotency", async () => {
  const delivery = await read("lib/handoff/delivery.ts");
  assert.match(delivery, /claim_handoff_email_delivery/);
  assert.match(delivery, /complete_handoff_email_delivery/);
  assert.match(delivery, /idempotencyKey/);
  assert.match(delivery, /HANDOFF_FROM_EMAIL/);
  assert.doesNotMatch(delivery, /REFERRAL_RESEND/);
});

test("old handoff card grid is removed without deleting management services", async () => {
  const [page, server, core] = await Promise.all([
    read("app/admin/(protected)/handoffs/page.tsx"),
    read("lib/handoff/server.ts"),
    read("lib/handoff/core.ts"),
  ]);
  assert.doesNotMatch(page, /Your handoff links|handoff-list-heading/);
  assert.match(server, /listHandoffs/);
  assert.match(server, /deactivateHandoff/);
  assert.match(core, /findActiveByHash/);
});

test("delivery enhancements retain the completion, review and central social presentation", async () => {
  const [completion, social] = await Promise.all([
    read("components/handoff/completion-card.tsx"),
    read("lib/social-links.ts"),
  ]);
  assert.match(completion, /getGoogleReviewUrl/);
  assert.match(completion, /getHandoffSocialLinks/);
  assert.match(completion, /Visit your website/);
  assert.match(completion, /feedbackToken/);
  assert.match(social, /getGoogleReviewUrl/);
  assert.match(social, /facebook\.com/);
  assert.match(social, /youtube\.com/);
  assert.match(social, /tiktok\.com/);
});
