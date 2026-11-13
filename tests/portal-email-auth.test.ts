import assert from "node:assert/strict";
import test from "node:test";
import { allowedPortalIdentity, completeEmailLink, emailLinkMessage, emailLinksEnabled, emailRateKey, normalizeLoginEmail, parsePortal, requestEmailLink, type PortalIdentity } from "../lib/portal-auth/core";

const partner: PortalIdentity = { userId: "synthetic-partner", email: "partner@example.invalid", confirmed: true, administrator: false, approvedPartner: true, mustChangePassword: false };
const owner: PortalIdentity = { ...partner, userId: "synthetic-owner", email: "owner@example.invalid", administrator: true, approvedPartner: false };
const token = "a".repeat(64);
test("email-link gate is OFF unless exactly true and input identifiers never serve as credentials", () => {
  const before = process.env.PORTAL_EMAIL_LINK_ENABLED;
  try {
    delete process.env.PORTAL_EMAIL_LINK_ENABLED;
    assert.equal(emailLinksEnabled(), false);
    for (const value of ["false", "TRUE", "1", "preview"]) { process.env.PORTAL_EMAIL_LINK_ENABLED = value; assert.equal(emailLinksEnabled(), false); }
    process.env.PORTAL_EMAIL_LINK_ENABLED = "true"; assert.equal(emailLinksEnabled(), true);
  } finally { if (before === undefined) delete process.env.PORTAL_EMAIL_LINK_ENABLED; else process.env.PORTAL_EMAIL_LINK_ENABLED = before; }
  assert.equal(normalizeLoginEmail(" PARTNER@example.invalid "), partner.email);
  for (const value of [null, {}, "invalid", "x".repeat(255) + "@example.invalid", "a@b\nc.invalid"]) assert.equal(normalizeLoginEmail(value), null);
  for (const value of ["https://evil.example.invalid", "/admin", "customer", null]) assert.equal(parsePortal(value), null);
  assert.equal(parsePortal("admin"), "admin");
  assert.match(emailRateKey(partner.email), /^[a-f0-9]{64}$/);
});
test("OFF, malformed, rate limited, unknown, unconfirmed, wrong-role and failed sends share one generic response", async () => {
  for (const value of [null, { ...partner, confirmed: false }, { ...partner, approvedPartner: false }, owner, { ...partner, email: "other@example.invalid" }]) {
    let sent = 0;
    const message = await requestEmailLink(partner.email, "partner", { enabled: true, limit: () => true, find: async () => value, send: async () => { sent++; } });
    assert.equal(message, emailLinkMessage); assert.equal(sent, 0); assert.doesNotMatch(message, /partner@example|synthetic|user_id|access_token/);
  }
  const never = async (): Promise<never> => { throw Error("Must not reach directory/provider"); };
  for (const value of [{ enabled: false, email: partner.email, limited: false }, { enabled: true, email: "invalid", limited: false }, { enabled: true, email: partner.email, limited: true }]) {
    assert.equal(await requestEmailLink(value.email, "partner", { enabled: value.enabled, limit: () => !value.limited, find: never, send: never }), emailLinkMessage);
  }
  assert.equal(await requestEmailLink(partner.email, "partner", { enabled: true, limit: () => true, find: async () => partner, send: async () => { throw Error("Private provider details"); } }), emailLinkMessage);
});
test("verified eligibility and exact role/email precede sending; hashed per-portal target limits hide identifiers", async () => {
  const events: string[] = [];
  const result = await requestEmailLink(owner.email, "admin", { enabled: true, limit: key => { events.push(key); return true; }, find: async (email, portal) => { assert.equal(email, owner.email); assert.equal(portal, "admin"); return owner; }, send: async (email, portal) => { assert.equal(email, owner.email); assert.equal(portal, "admin"); events.push("sent"); } });
  assert.equal(result, emailLinkMessage); assert.match(events[0], /^admin:[a-f0-9]{64}$/); assert.equal(events[1], "sent");
  assert.equal(allowedPortalIdentity(partner, "admin"), false); assert.equal(allowedPortalIdentity(owner, "partner"), false);
});
test("both portal completions require provider-confirmed one-time magiclink proof, never an ordinary session", async () => {
  for (const [portal, identity] of [["admin", owner], ["partner", partner]] as const) {
    let used = false, signedOut = 0;
    const deps = { enabled: true, verify: async (hash: string) => { if (used || hash !== token) return null; used = true; return identity; }, signOut: async () => { signedOut++; } };
    assert.equal(await completeEmailLink(token, "magiclink", portal, deps), `/${portal}`);
    assert.equal(await completeEmailLink(token, "magiclink", portal, deps), null);
    assert.equal(signedOut, 1);
  }
});
test("expired, invalid, wrong-type, disabled and manipulated links cannot invoke or replace provider verification", async () => {
  let verified = 0, signedOut = 0;
  const deps = { enabled: true, verify: async () => { verified++; return null; }, signOut: async () => { signedOut++; } };
  for (const type of ["recovery", "invite", "email", null]) assert.equal(await completeEmailLink(token, type, "admin", deps), null);
  for (const invalid of ["", "manipulated", "<script>", "a".repeat(257)]) assert.equal(await completeEmailLink(invalid, "magiclink", "admin", deps), null);
  assert.equal(await completeEmailLink(token, "magiclink", "admin", { ...deps, enabled: false }), null); assert.equal(verified, 0);
  assert.equal(await completeEmailLink(token, "magiclink", "admin", deps), null); assert.equal(verified, 1); assert.equal(signedOut, 1);
});
test("current authorization is checked after verification, including wrong-role and revoked partner/admin membership", async () => {
  for (const [portal, identity] of [["admin", partner], ["partner", owner], ["admin", { ...owner, administrator: false }], ["partner", { ...partner, approvedPartner: false }], ["partner", { ...partner, confirmed: false }]] as const) {
    let signedOut = false;
    assert.equal(await completeEmailLink(token, "magiclink", portal, { enabled: true, verify: async () => identity, signOut: async () => { signedOut = true; } }), null);
    assert.equal(signedOut, true);
  }
});
test("simultaneous confirmations and stale links cannot create two provider sessions in a single-use fixture", async () => {
  let consumed = false;
  const deps = { enabled: true, verify: async () => { if (consumed) return null; consumed = true; return partner; }, signOut: async () => {} };
  const results = await Promise.all([completeEmailLink(token, "magiclink", "partner", deps), completeEmailLink(token, "magiclink", "partner", deps)]);
  assert.equal(results.filter(Boolean).length, 1);
});
test("forced-password restrictions remain and provider/directory failures fail closed without metadata changes", async () => {
  assert.equal(await completeEmailLink(token, "magiclink", "admin", { enabled: true, verify: async () => ({ ...owner, mustChangePassword: true }), signOut: async () => {} }), "/admin/change-password");
  assert.equal(await completeEmailLink(token, "magiclink", "partner", { enabled: true, verify: async () => ({ ...partner, mustChangePassword: true }), signOut: async () => {} }), "/partner/change-password");
  let signedOut = 0;
  assert.equal(await completeEmailLink(token, "magiclink", "admin", { enabled: true, verify: async () => { throw Error("Secret directory failure"); }, signOut: async () => { signedOut++; } }), null);
  assert.equal(signedOut, 1);
});
test("an existing authenticated account is preserved and cannot be silently replaced by a link", async () => {
  let verified = 0, signedOut = 0;
  const deps = { enabled: true, hasExistingSession: async () => true, verify: async () => { verified++; return partner; }, signOut: async () => { signedOut++; } };
  assert.equal(await completeEmailLink(token, "magiclink", "partner", deps), null);
  assert.equal(await completeEmailLink(token, "magiclink", "admin", deps), null);
  assert.equal(await completeEmailLink(token, "invite", "partner", deps), null);
  assert.equal(verified, 0); assert.equal(signedOut, 0);
  assert.equal(await completeEmailLink(token, "magiclink", "partner", { ...deps, hasExistingSession: async () => { throw Error("Identity service unavailable"); } }), null);
  assert.equal(verified, 0); assert.equal(signedOut, 0);
});
