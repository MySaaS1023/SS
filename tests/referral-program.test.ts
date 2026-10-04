import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  authFailureDestination,
  resolveAuthenticatedDestination,
} from "../lib/referrals/auth";
import {
  classifyPasswordResetError,
  getAdminPasswordResetRedirect,
} from "../lib/referrals/admin-password-reset";
import {
  REFERRAL_COMMISSION_CENTS,
  getReferralCookieDays,
} from "../lib/referrals/config";
import {
  getReferralSenderEmail,
  missingReferralEmailConfiguration,
  referralApplicationAdminEmail,
  referralEmail,
} from "../lib/referrals/email";
import {
  chooseFirstReferralOwner,
  generateReferralCode,
  invalidPaymentCommissionStatus,
  isSelfReferral,
} from "../lib/referrals/rules";
import { POST as submitApplication } from "../app/api/referral-partners/apply/route";
import { POST as adminPasswordLogin } from "../app/api/admin/auth/login/route";
import { POST as requestAdminPasswordReset } from "../app/api/admin/auth/forgot-password/route";

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

test("referral email configuration is isolated from service email configuration", () => {
  const names = [
    "REFERRAL_RESEND_API_KEY",
    "REFERRAL_RESEND_FROM_EMAIL",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
  ] as const;
  const prior = Object.fromEntries(
    names.map((name) => [name, process.env[name]]),
  );
  try {
    process.env.RESEND_API_KEY = "existing-service-key";
    process.env.RESEND_FROM_EMAIL = "Steady Start <service@example.com>";
    delete process.env.REFERRAL_RESEND_API_KEY;
    delete process.env.REFERRAL_RESEND_FROM_EMAIL;
    assert.deepEqual(missingReferralEmailConfiguration(), [
      "REFERRAL_RESEND_API_KEY",
      "REFERRAL_RESEND_FROM_EMAIL",
    ]);

    process.env.REFERRAL_RESEND_API_KEY = "referral-only-key";
    process.env.REFERRAL_RESEND_FROM_EMAIL =
      "Steady Start Referrals <referrals@example.com>";
    assert.deepEqual(missingReferralEmailConfiguration(), []);
    assert.equal(
      getReferralSenderEmail(),
      "Steady Start Referrals <referrals@example.com>",
    );
  } finally {
    for (const name of names) {
      const value = prior[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("admin and Partner authentication destinations stay role-separated", () => {
  assert.equal(resolveAuthenticatedDestination("admin", "/partner"), "/admin");
  assert.equal(
    resolveAuthenticatedDestination("partner", "/admin"),
    "/partner",
  );
  assert.equal(
    resolveAuthenticatedDestination("admin", "/admin/reset-password"),
    "/admin/reset-password",
  );
  assert.equal(resolveAuthenticatedDestination(null, "/admin"), null);
  assert.equal(
    authFailureDestination("/admin/reset-password"),
    "/admin/login?error=invalid-link",
  );
  assert.equal(
    authFailureDestination("/partner"),
    "/partner/login?error=invalid-link",
  );
});

test("admin password login denies a non-admin before authenticating", async () => {
  const prior = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = "support@steadystartco.com";
  try {
    const response = await adminPasswordLogin(
      new Request("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "partner@example.com",
          password: "not-a-real-password",
        }),
      }),
    );
    assert.equal(response.status, 403);
  } finally {
    if (prior === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = prior;
  }
});

test("admin password reset does not disclose whether an address is authorized", async () => {
  const response = await requestAdminPasswordReset(
    new Request("http://localhost/api/admin/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-admin@example.com" }),
    }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
});

test("admin password recovery uses the dedicated reset URL", () => {
  assert.equal(
    getAdminPasswordResetRedirect("https://www.steadystartco.com/"),
    "https://www.steadystartco.com/admin/reset-password",
  );
});

test("admin password reset failures have safe structured classifications", () => {
  assert.equal(
    classifyPasswordResetError({
      code: "over_email_send_rate_limit",
      message: "email rate limit exceeded",
      status: 429,
    }),
    "password_reset_rate_limited",
  );
  assert.equal(
    classifyPasswordResetError({
      message: "redirect URL is not allowed",
      status: 400,
    }),
    "password_reset_configuration_error",
  );
  assert.equal(
    classifyPasswordResetError({
      code: "smtp_failure",
      message: "provider rejected the request",
      status: 500,
    }),
    "password_reset_provider_failure",
  );
});

test("admin application notification identifies the applicant and supports direct reply", () => {
  const message = referralApplicationAdminEmail({
    firstName: "Avery",
    lastName: "Partner",
    email: "avery@example.com",
    phone: "555-0100",
    city: "Denver",
    state: "CO",
    heardAbout: "A customer",
    motivation: "Help local businesses",
    referralPlan: "Qualified introductions",
    reviewUrl:
      "https://www.steadystartco.com/admin/referral-program/applications",
  });
  assert.equal(message.subject, "New Referral Application — Avery Partner");
  assert.equal(message.replyTo, "avery@example.com");
  assert.match(message.text, /Application Status:\nPending/);
  assert.match(
    message.html,
    /https:\/\/www\.steadystartco\.com\/admin\/referral-program\/applications/,
  );
  assert.match(message.html, />Review Application</);
});

test("applicant confirmation clearly communicates pending review and next steps", () => {
  const message = referralEmail({
    kind: "application_received",
    firstName: "Avery",
  });
  assert.equal(
    message.subject,
    "We received your Steady Start Referral Partner application",
  );
  assert.match(message.text, /PENDING REVIEW/);
  assert.match(message.text, /No action is required from you right now/);
  assert.match(message.text, /earn \$100/);
  assert.ok("html" in message);
});

test("admin login UI uses a password and contains no magic-link action", async () => {
  const source = await readFile(
    new URL("../components/referrals/admin-login-form.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /type="password"/);
  assert.match(source, /"Log In"/);
  assert.match(source, /Forgot Password\?/);
  assert.doesNotMatch(source, /Email Me a Login Link/);
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
  const response = await submitApplication(
    applicationRequest({ firstName: "" }),
  );
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
