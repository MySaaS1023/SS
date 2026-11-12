import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { authorizeAdministratorChange, parseAdministratorChange, invitationProposalTemplate, resolveAdministratorAccess, type Administrator } from "../lib/admin-management/core";

const owner: Administrator = { user_id: "00000000-0000-4000-8000-000000000001", display_name: "Synthetic Owner", email: "owner@example.invalid", role: "super_admin", status: "active", version: 1 };
const member: Administrator = { ...owner, user_id: "00000000-0000-4000-8000-000000000002", email: "admin@example.invalid", role: "admin" };
const change = { userId: owner.user_id, role: "admin" as const, status: "active" as const, version: 1, confirmation: owner.email };

test("operational administrator cannot manage identities", () => {
  assert.throws(() => authorizeAdministratorChange(member, owner, change, 2), /Super Admin/);
  assert.throws(() => authorizeAdministratorChange({ ...owner, status: "disabled" }, member, { ...change, userId: member.user_id }, 2), /Super Admin/);
});
test("last active Super Admin cannot be demoted, disabled or revoked", () => {
  for (const edit of [change, { ...change, role: "super_admin" as const, status: "disabled" as const }, { ...change, role: "super_admin" as const, status: "revoked" as const }]) {
    assert.throws(() => authorizeAdministratorChange(owner, owner, edit, 1), /last active Super Admin/);
  }
  assert.doesNotThrow(() => authorizeAdministratorChange(owner, owner, change, 2));
});
test("administrator changes reject stale records and incorrect confirmation", () => {
  assert.throws(() => authorizeAdministratorChange(owner, owner, { ...change, version: 2 }, 2), /record changed/);
  assert.throws(() => authorizeAdministratorChange(owner, owner, { ...change, confirmation: "someone@example.invalid" }, 2), /exact administrator email/);
});
test("administrator change input cannot smuggle arbitrary roles or statuses", () => {
  assert.deepEqual(parseAdministratorChange(change), change);
  for (const invalid of [{ ...change, role: "owner" }, { ...change, status: "deleted" }, { ...change, version: -1 }, { ...change, userId: "invalid" }])
    assert.throws(() => parseAdministratorChange(invalid));
});
test("invitation template contains no recipient identity and is not activated", () => {
  assert.equal(invitationProposalTemplate.role, "admin");
  assert.equal(invitationProposalTemplate.workspaces.length, 4);
  assert.match(invitationProposalTemplate.status, /not sent or activated/);
  assert.equal(invitationProposalTemplate.name, "Awaiting owner-approved recipient");
  assert.equal(invitationProposalTemplate.email, "Not configured");
  assert.doesNotMatch(JSON.stringify(invitationProposalTemplate), /@/);
});
test("disabled role setup preserves legacy privileges without touching the database", async () => {
  const load = async () => { throw new Error("Unexpected database lookup"); };
  assert.equal(await resolveAdministratorAccess(false, true, load), true);
  assert.equal(await resolveAdministratorAccess(false, false, load), false);
});
test("activated membership access denies disabled, revoked, missing or failed lookups even for legacy allowlist", async () => {
  for (const membership of [null, { role: "super_admin", status: "disabled" }, { role: "admin", status: "revoked" }, { role: "partner", status: "active" }])
    assert.equal(await resolveAdministratorAccess(true, true, async () => membership), false);
  assert.equal(await resolveAdministratorAccess(true, true, async () => { throw new Error("Database unavailable"); }), false);
  assert.equal(await resolveAdministratorAccess(true, false, async () => ({ role: "admin", status: "active" })), true);
  assert.equal(await resolveAdministratorAccess(true, false, async () => ({ role: "super_admin", status: "active" })), true);
});
test("candidate migration restricts browser mutation and serializes audited transitions", () => {
  const sql = readFileSync(new URL("../supabase/migrations/202611120001_administrator_management.sql", import.meta.url), "utf8");
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /insert into public\.administrator_audit/);
  assert.match(sql, /revoke all on function.*from public, anon, authenticated/);
  assert.match(sql, /enable row level security/g);
  assert.doesNotMatch(sql, /insert into public\.administrator_memberships/i);
});
