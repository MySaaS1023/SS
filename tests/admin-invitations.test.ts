import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import test from "node:test";
import {
  acceptAdministratorInvitation,
  administratorInvitationEmail,
  deliverAdministratorInvitation,
  hashInvitationValue,
  invitationPreview,
  invitationsEnabled,
  parseInvitationDraft,
  validInvitationBinding,
  validInvitationCallback,
  type AdministratorInvitation,
  type InvitationAcceptanceDependencies,
  type InvitationDeliveryDependencies,
} from "../lib/admin-management/invitations-core";

const id = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const claimId = "00000000-0000-4000-8000-000000000003";
const providerId = "00000000-0000-4000-8000-000000000004";
const now = Date.parse("2026-11-13T12:00:00Z");
const token = "a".repeat(64);
function proposal(): AdministratorInvitation {
  return {
    id,
    display_name: "Synthetic Admin",
    email: "synthetic@example.invalid",
    role: "admin",
    status: "pending_approval",
    created_at: new Date(now).toISOString(),
    expires_at: new Date(now + 3_600_000).toISOString(),
  };
}
function deliveryFixture() {
  const row = proposal();
  const calls = { generate: 0, send: 0, bind: 0, finish: 0 };
  let capturedUrl: URL | undefined;
  const deps: InvitationDeliveryDependencies = {
    now: () => now,
    reserve: async (requested, confirmation, nonceHash, expiresAt) => {
      if (
        requested !== id ||
        row.status !== "pending_approval" ||
        confirmation !== row.email
      )
        return null;
      row.status = "sending";
      row.send_claim = claimId;
      row.nonce_hash = nonceHash;
      row.expires_at = expiresAt;
      return { ...row };
    },
    generate: async (email) => {
      calls.generate++;
      return {
        id: userId,
        email,
        tokenHash: token,
        type: "invite",
        confirmed: false,
      };
    },
    bind: async (_row, user, fingerprint) => {
      calls.bind++;
      row.auth_user_id = user;
      row.auth_token_hash = fingerprint;
      return true;
    },
    send: async (_row, email) => {
      calls.send++;
      capturedUrl = new URL(email.text.match(/https:\/\/[^\s]+/)![0]);
      return { id: providerId };
    },
    finish: async (_row, outcome, provider) => {
      calls.finish++;
      row.status =
        outcome === "accepted"
          ? "sent"
          : outcome === "rejected"
            ? "failed"
            : "unknown";
      row.provider_message_id = provider;
      return true;
    },
  };
  return { row, calls, deps, url: () => capturedUrl };
}
function acceptanceFixture() {
  const row = proposal(),
    nonce = randomBytes(32).toString("base64url");
  row.status = "sent";
  row.auth_user_id = userId;
  row.nonce_hash = hashInvitationValue(nonce);
  row.auth_token_hash = hashInvitationValue(token);
  const calls = { password: 0, activate: 0, signOut: 0 };
  let claimed = false;
  const deps: InvitationAcceptanceDependencies = {
    now: () => now,
    load: async () => ({ ...row }),
    identity: async () => ({ id: userId, email: row.email, confirmed: true }),
    claim: async () => {
      if (claimed) return null;
      claimed = true;
      return claimId;
    },
    updatePassword: async () => {
      calls.password++;
      return true;
    },
    activate: async () => {
      if (row.status !== "sent") return false;
      calls.activate++;
      row.status = "accepted";
      row.nonce_hash = null;
      return true;
    },
    signOut: async () => {
      calls.signOut++;
    },
  };
  return { row, nonce, calls, deps };
}

test("invitation draft fixes Admin role and validates name/email without exposing secrets in preview", () => {
  assert.deepEqual(
    parseInvitationDraft({
      name: " Synthetic Admin ",
      email: " SYNTHETIC@EXAMPLE.INVALID ",
      role: "admin",
    }),
    {
      name: "Synthetic Admin",
      email: "synthetic@example.invalid",
      role: "admin",
    },
  );
  for (const change of [
    { role: "super_admin" },
    { email: "bad" },
    { email: "a@example.invalid\r\nBcc:b@example.invalid" },
    { name: "Bad\nName" },
    { name: "n".repeat(161) },
  ])
    assert.throws(() =>
      parseInvitationDraft({
        name: "Synthetic",
        email: "synthetic@example.invalid",
        role: "admin",
        ...change,
      }),
    );
  const preview = invitationPreview({
    ...proposal(),
    nonce_hash: "SECRET_NONCE_HASH",
    auth_token_hash: "SECRET_AUTH_HASH",
    send_claim: "SECRET_CLAIM",
  });
  assert.doesNotMatch(JSON.stringify(preview), /SECRET|nonce|claim|auth_token/);
});

test("saving/previewing makes no provider call and two concurrent confirmed sends create exactly one email", async () => {
  const fixture = deliveryFixture();
  invitationPreview(fixture.row);
  assert.equal(fixture.calls.send, 0);
  const blocked = await deliverAdministratorInvitation(
    fixture.deps,
    "https://example.invalid",
    id,
    "wrong@example.invalid",
  );
  assert.equal(blocked.status, "blocked");
  assert.equal(fixture.calls.generate, 0);
  const results = await Promise.all(
    [1, 2].map(() =>
      deliverAdministratorInvitation(
        fixture.deps,
        "https://example.invalid",
        id,
        fixture.row.email,
      ),
    ),
  );
  assert.equal(
    results.filter((result) => result.status === "accepted").length,
    1,
  );
  assert.equal(fixture.calls.generate, 1);
  assert.equal(fixture.calls.send, 1);
  const url = fixture.url()!;
  assert.equal(url.pathname, "/auth/admin-invite");
  assert.equal(url.searchParams.get("type"), "invite");
  assert.equal(url.searchParams.get("nonce")!.length, 43);
  assert.equal(
    hashInvitationValue(url.searchParams.get("nonce")!),
    fixture.row.nonce_hash,
  );
  assert.equal(
    hashInvitationValue(url.searchParams.get("token_hash")!),
    fixture.row.auth_token_hash,
  );
  assert.doesNotMatch(url.toString(), /synthetic%40|email=/);
  assert.match(
    results.find((result) => result.status === "accepted")!.message,
    /does not confirm inbox delivery or activate/,
  );
});

test("each send has a distinct cryptographic nonce and only hashes are stored", async () => {
  const first = deliveryFixture(),
    second = deliveryFixture();
  await deliverAdministratorInvitation(
    first.deps,
    "https://example.invalid",
    id,
    first.row.email,
  );
  await deliverAdministratorInvitation(
    second.deps,
    "https://example.invalid",
    id,
    second.row.email,
  );
  assert.notEqual(
    first.url()!.searchParams.get("nonce"),
    second.url()!.searchParams.get("nonce"),
  );
  assert.equal(first.row.nonce_hash?.length, 64);
  assert.notEqual(first.row.nonce_hash, first.url()!.searchParams.get("nonce"));
});

test("existing/confirmed identities, wrong Auth proof type and failed UUID binding never send or grant access", async () => {
  for (const result of [
    null,
    {
      id: userId,
      email: "other@example.invalid",
      tokenHash: token,
      type: "invite",
      confirmed: false,
    },
    {
      id: userId,
      email: proposal().email,
      tokenHash: token,
      type: "magiclink",
      confirmed: false,
    },
    {
      id: userId,
      email: proposal().email,
      tokenHash: token,
      type: "invite",
      confirmed: true,
    },
  ]) {
    const fixture = deliveryFixture();
    fixture.deps.generate = async () => result;
    assert.equal(
      (
        await deliverAdministratorInvitation(
          fixture.deps,
          "https://example.invalid",
          id,
          fixture.row.email,
        )
      ).status,
      "failed",
    );
    assert.equal(fixture.calls.send, 0);
    assert.equal(fixture.row.status, "failed");
  }
  const fixture = deliveryFixture();
  fixture.deps.bind = async () => false;
  assert.equal(
    (
      await deliverAdministratorInvitation(
        fixture.deps,
        "https://example.invalid",
        id,
        fixture.row.email,
      )
    ).status,
    "failed",
  );
  assert.equal(fixture.calls.send, 0);
});

test("provider rejection and indeterminate transport outcomes are accurately recorded and cannot be retried", async () => {
  for (const rejected of [true, false]) {
    const fixture = deliveryFixture();
    fixture.deps.send = async () => {
      fixture.calls.send++;
      if (!rejected) throw new Error("PRIVATE_PROVIDER_RESPONSE_API_KEY");
      return { rejected: true };
    };
    const result = await deliverAdministratorInvitation(
      fixture.deps,
      "https://example.invalid",
      id,
      fixture.row.email,
    );
    assert.equal(result.status, rejected ? "failed" : "unknown");
    assert.doesNotMatch(
      result.message,
      /PRIVATE|API_KEY|delivered successfully/,
    );
    assert.equal(fixture.row.provider_message_id, null);
    const retried = await deliverAdministratorInvitation(
      fixture.deps,
      "https://example.invalid",
      id,
      fixture.row.email,
    );
    assert.equal(retried.status, "blocked");
    assert.equal(fixture.calls.send, 1);
  }
});

test("provider acceptance without durable audit update is not reported as fully completed", async () => {
  const fixture = deliveryFixture();
  fixture.deps.finish = async () => false;
  const result = await deliverAdministratorInvitation(
    fixture.deps,
    "https://example.invalid",
    id,
    fixture.row.email,
  );
  assert.equal(result.status, "unknown");
  assert.match(result.message, /provider accepted.*audit update.*Do not retry/);
  assert.equal(fixture.row.status, "sending");
});

test("callback rejects tampered proof, wrong type, expiry, revocation and mismatched/unverified identities", () => {
  const { row, nonce } = acceptanceFixture();
  assert.equal(validInvitationCallback(row, nonce, token, "invite", now), true);
  for (const status of [
    "revoked",
    "expired",
    "accepted",
    "failed",
    "unknown",
    "sending",
  ] as const)
    assert.equal(
      validInvitationCallback({ ...row, status }, nonce, token, "invite", now),
      false,
    );
  assert.equal(
    validInvitationCallback(row, nonce, "b".repeat(64), "invite", now),
    false,
  );
  assert.equal(
    validInvitationCallback(row, nonce, token, "magiclink", now),
    false,
  );
  assert.equal(
    validInvitationCallback(
      row,
      randomBytes(32).toString("base64url"),
      token,
      "invite",
      now,
    ),
    false,
  );
  assert.equal(
    validInvitationCallback(
      { ...row, expires_at: new Date(now).toISOString() },
      nonce,
      token,
      "invite",
      now,
    ),
    false,
  );
  for (const identity of [
    null,
    { id, email: row.email, confirmed: true },
    { id: userId, email: "other@example.invalid", confirmed: true },
    { id: userId, email: row.email, confirmed: false },
  ])
    assert.equal(validInvitationBinding(row, nonce, now, identity), false);
});

test("verified acceptance claims once before changing password then atomically activates fixed Admin membership", async () => {
  const fixture = acceptanceFixture();
  const results = await Promise.all(
    [1, 2].map(() =>
      acceptAdministratorInvitation(
        fixture.deps,
        id,
        fixture.nonce,
        "SyntheticPassword123!",
        "SyntheticPassword123!",
      ),
    ),
  );
  assert.equal(results.filter(Boolean).length, 1);
  assert.deepEqual(fixture.calls, { password: 1, activate: 1, signOut: 1 });
  assert.equal(fixture.row.status, "accepted");
  assert.equal(
    await acceptAdministratorInvitation(
      fixture.deps,
      id,
      fixture.nonce,
      "ChangedPassword123!",
      "ChangedPassword123!",
    ),
    false,
  );
  assert.equal(fixture.calls.password, 1);
});

test("acceptance fails closed for missing proof, unverified session, bad password and revoked-in-flight invitation", async () => {
  const invalid = acceptanceFixture();
  invalid.deps.identity = async () => null;
  assert.equal(
    await acceptAdministratorInvitation(
      invalid.deps,
      id,
      invalid.nonce,
      "SyntheticPassword123!",
      "SyntheticPassword123!",
    ),
    false,
  );
  assert.equal(invalid.calls.password, 0);
  const password = acceptanceFixture();
  assert.equal(
    await acceptAdministratorInvitation(
      password.deps,
      id,
      password.nonce,
      "short",
      "short",
    ),
    false,
  );
  assert.equal(
    await acceptAdministratorInvitation(
      password.deps,
      id,
      password.nonce,
      "SyntheticPassword123!",
      "different",
    ),
    false,
  );
  assert.equal(password.calls.password, 0);
  const revoked = acceptanceFixture();
  revoked.deps.updatePassword = async () => {
    revoked.row.status = "revoked";
    return true;
  };
  assert.equal(
    await acceptAdministratorInvitation(
      revoked.deps,
      id,
      revoked.nonce,
      "SyntheticPassword123!",
      "SyntheticPassword123!",
    ),
    false,
  );
  assert.equal(revoked.calls.activate, 0);
  assert.equal(revoked.calls.signOut, 1);
});

test("failed password write consumes acceptance claim without granting access or allowing an unsafe retry", async () => {
  const fixture = acceptanceFixture();
  fixture.deps.updatePassword = async () => {
    fixture.calls.password++;
    return false;
  };
  assert.equal(
    await acceptAdministratorInvitation(
      fixture.deps,
      id,
      fixture.nonce,
      "SyntheticPassword123!",
      "SyntheticPassword123!",
    ),
    false,
  );
  assert.equal(
    await acceptAdministratorInvitation(
      fixture.deps,
      id,
      fixture.nonce,
      "SyntheticPassword123!",
      "SyntheticPassword123!",
    ),
    false,
  );
  assert.equal(fixture.calls.password, 1);
  assert.equal(fixture.calls.activate, 0);
  assert.equal(fixture.calls.signOut, 1);
});

test("invitation email escapes recipient text, is accessible and keeps official scope separate from activation", () => {
  const email = administratorInvitationEmail(
    "<img onerror=alert(1)>",
    "https://example.invalid/auth/admin-invite?nonce=synthetic&type=invite",
  );
  assert.doesNotMatch(email.html, /<img/);
  assert.match(email.html, /&lt;img/);
  assert.match(email.html, /Review administrator invitation/);
  for (const workspace of [
    "Referral Program",
    "Client Scheduling",
    "Client Handoff",
    "QR Code",
  ])
    assert.ok(email.text.includes(workspace));
  assert.match(email.text, /cannot manage administrators/);
  assert.doesNotMatch(email.text, /Super Admin access granted/);
});

test("both invitation gates are required and remain disabled by default", () => {
  const management = process.env.ADMIN_MANAGEMENT_ENABLED,
    invitations = process.env.ADMIN_INVITATIONS_ENABLED;
  try {
    delete process.env.ADMIN_MANAGEMENT_ENABLED;
    delete process.env.ADMIN_INVITATIONS_ENABLED;
    assert.equal(invitationsEnabled(), false);
    process.env.ADMIN_MANAGEMENT_ENABLED = "true";
    assert.equal(invitationsEnabled(), false);
    process.env.ADMIN_INVITATIONS_ENABLED = "true";
    assert.equal(invitationsEnabled(), true);
    process.env.ADMIN_MANAGEMENT_ENABLED = "false";
    assert.equal(invitationsEnabled(), false);
  } finally {
    if (management === undefined) delete process.env.ADMIN_MANAGEMENT_ENABLED;
    else process.env.ADMIN_MANAGEMENT_ENABLED = management;
    if (invitations === undefined) delete process.env.ADMIN_INVITATIONS_ENABLED;
    else process.env.ADMIN_INVITATIONS_ENABLED = invitations;
  }
});

test("migration leaves browser roles with no mutation access and accepts only bound verified fixed-Admin identities", async () => {
  const sql = await readFile(
    "supabase/migrations/202611130002_admin_invitation_workflow.sql",
    "utf8",
  );
  assert.equal((sql.match(/create function public\./g) ?? []).length, 7);
  assert.equal((sql.match(/revoke all on function public\./g) ?? []).length, 7);
  assert.match(
    sql,
    /grant select on public\.administrator_invitations to service_role/,
  );
  assert.doesNotMatch(
    sql,
    /grant (insert|update|delete|all).*to (anon|authenticated|service_role)/i,
  );
  assert.match(sql, /email_confirmed_at is not null/);
  assert.match(sql, /email_confirmed_at is null and created_at>=r\.created_at/);
  assert.match(sql, /r\.auth_user_id is distinct from p_user/);
  assert.match(sql, /r\.nonce_hash is distinct from p_nonce_hash/);
  assert.match(sql, /r\.acceptance_claim is distinct from p_acceptance_claim/);
  assert.match(sql, /'admin','active'/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /for update/);
  assert.match(sql, /administrator\.invitation_accepted/);
  assert.doesNotMatch(
    sql,
    /delete from|truncate|update public\.(referrals|referral_partners|referral_commissions|referral_payouts)/i,
  );
  const server = await readFile(
    "lib/admin-management/invitations-server.ts",
    "utf8",
  );
  assert.match(server, /getAdministratorManagementContext/);
  assert.match(server, /type: "invite"/);
  assert.match(server, /process\.env\.RESEND_API_KEY/);
  assert.match(server, /getResendClient\(\)\.emails\.send/);
  assert.doesNotMatch(
    server,
    /REFERRAL_RESEND|inviteUserByEmail|updateUserById|console\.(log|error)/,
  );
});
