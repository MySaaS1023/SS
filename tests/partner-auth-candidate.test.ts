import assert from "node:assert/strict";
import test from "node:test";
import { createRecoveryService, hashRecoveryValue, validateRecoveryPasswords, recoveryEnabled, type RecoveryGrant, type RecoveryIdentity } from "../lib/partner-auth/recovery-core";
import { normalizeRepresentativeId, requestRepresentativeAccess, representativeAccessMessage, passwordlessEnabled, type PartnerAccessIdentity } from "../lib/partner-auth/passwordless-core";
import { AuthBodyLimitError, readLimitedAuthBody } from "../lib/partner-auth/http-body";

const identity: RecoveryIdentity = { userId: "synthetic-user", sessionFingerprint: hashRecoveryValue("synthetic-auth-session") };
const token = "a".repeat(64);
function recoveryFixture() {
  let now = 1_800_000_000_000;
  let providerUsed = false;
  let passwordResult = true;
  let signOutFailure = false;
  const grants = new Map<string, RecoveryGrant>();
  const events: string[] = [];
  const service = createRecoveryService({
    now: () => now,
    verify: async (hash, portal) => {
      events.push("verify");
      if (providerUsed || hash !== token || portal !== "partner") return null;
      providerUsed = true;
      return identity;
    },
    save: async grant => { grants.set(grant.nonceHash, grant); events.push("save"); },
    check: async supplied => {
      const stored = grants.get(supplied.nonceHash);
      return Boolean(stored && stored.userId === supplied.userId && stored.sessionFingerprint === supplied.sessionFingerprint && stored.portal === supplied.portal && Date.parse(stored.expiresAt) > now);
    },
    consume: async supplied => {
      const stored = grants.get(supplied.nonceHash);
      if (!stored || stored.userId !== supplied.userId || stored.sessionFingerprint !== supplied.sessionFingerprint || stored.portal !== supplied.portal || Date.parse(stored.expiresAt) <= now) return false;
      grants.delete(supplied.nonceHash); events.push("consume"); return true;
    },
    updatePassword: async () => { events.push("password"); return passwordResult; },
    signOut: async () => { events.push("signout"); if (signOutFailure) throw new Error("Provider signout failed"); },
  });
  return { service, events, grants, expire: () => { now += 600_001; }, failPassword: () => { passwordResult = false; }, failSignOut: () => { signOutFailure = true; } };
}

test("ordinary session, invalid hash and wrong OTP type cannot establish recovery", async () => {
  const f = recoveryFixture();
  assert.equal(await f.service.valid(undefined, "partner", identity), false);
  assert.equal(await f.service.begin(token, "magiclink", "partner"), null);
  assert.equal(await f.service.begin("manipulated", "recovery", "partner"), null);
  assert.equal(await f.service.begin(token, "recovery", "admin"), null);
  assert.equal(f.grants.size, 0);
  assert.equal(f.events.filter(event => event === "save").length, 0);
});
test("recovery provider token is single-use and no raw nonce is persisted", async () => {
  const f = recoveryFixture();
  const nonce = await f.service.begin(token, "recovery", "partner");
  assert.ok(nonce);
  assert.equal(await f.service.begin(token, "recovery", "partner"), null);
  assert.equal(f.grants.has(nonce), false);
  assert.equal(f.grants.has(hashRecoveryValue(nonce)), true);
});
test("recovery grant binds user, session and portal, and expires", async () => {
  const f = recoveryFixture();
  const nonce = await f.service.begin(token, "recovery", "partner");
  assert.ok(nonce);
  assert.equal(await f.service.valid(nonce, "partner", identity), true);
  assert.equal(await f.service.valid(nonce, "admin", identity), false);
  assert.equal(await f.service.valid(nonce, "partner", { ...identity, userId: "another-user" }), false);
  assert.equal(await f.service.valid(nonce, "partner", { ...identity, sessionFingerprint: "another-session" }), false);
  assert.equal(await f.service.valid("Z".repeat(43), "partner", identity), false);
  f.expire();
  assert.equal(await f.service.valid(nonce, "partner", identity), false);
  assert.equal(await f.service.complete(nonce, "partner", identity, "synthetic-password-long", "synthetic-password-long"), false);
  assert.equal(f.events.includes("password"), false);
});
test("atomic consumption precedes password write, rejects concurrent/reused attempts, then signs out", async () => {
  const f = recoveryFixture();
  const nonce = await f.service.begin(token, "recovery", "partner");
  assert.ok(nonce);
  const results = await Promise.all([f.service.complete(nonce, "partner", identity, "synthetic-password-long", "synthetic-password-long"), f.service.complete(nonce, "partner", identity, "synthetic-password-long", "synthetic-password-long")]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.deepEqual(f.events, ["verify", "save", "consume", "password", "signout"]);
});
test("failed password update consumes the grant and never reports completion", async () => {
  const f = recoveryFixture(); f.failPassword();
  const nonce = await f.service.begin(token, "recovery", "partner");
  assert.ok(nonce);
  assert.equal(await f.service.complete(nonce, "partner", identity, "synthetic-password-long", "synthetic-password-long"), false);
  assert.equal(await f.service.valid(nonce, "partner", identity), false);
  assert.equal(f.events.at(-1), "signout");
});
test("signout failure cannot be reported as a fully completed recovery", async () => {
  const f = recoveryFixture(); f.failSignOut();
  const nonce = await f.service.begin(token, "recovery", "partner");
  assert.ok(nonce);
  await assert.rejects(() => f.service.complete(nonce, "partner", identity, "synthetic-password-long", "synthetic-password-long"), /signout failed/);
});
test("recovery password confirmation and length are enforced before consuming a grant", () => {
  assert.throws(() => validateRecoveryPasswords("short", "short"), /12/);
  assert.throws(() => validateRecoveryPasswords("a".repeat(257), "a".repeat(257)), /256/);
  assert.throws(() => validateRecoveryPasswords("synthetic-password-long", "different-password"), /do not match/);
});

const partner: PartnerAccessIdentity = { userId: "synthetic-partner", email: "partner@example.invalid", confirmed: true, approved: true, protectedAdministrator: false };
test("representative IDs are stable lookup identifiers and never authenticate by themselves", async () => {
  assert.equal(normalizeRepresentativeId(" ss-abc234 "), "SS-ABC234");
  assert.equal(normalizeRepresentativeId("SS-000000"), null);
  let sent = 0;
  const result = await requestRepresentativeAccess("SS-ABC234", { enabled: true, limit: () => true, find: async () => partner, send: async () => { sent++; } });
  assert.equal(result, representativeAccessMessage); assert.equal(sent, 1);
  assert.doesNotMatch(result, /partner@example|synthetic-partner|access_token/);
});
test("passwordless OFF preserves existing login without database calls or delivery", async () => {
  const unreachable = async (): Promise<never> => { throw new Error("Must not call provider"); };
  assert.equal(await requestRepresentativeAccess("SS-ABC234", { enabled: false, limit: () => { throw new Error("Must not rate"); }, find: unreachable, send: unreachable }), representativeAccessMessage);
});
test("unknown, suspended, mismatched/unverified, or administrator identities have identical private responses", async () => {
  const identities = [null, { ...partner, approved: false }, { ...partner, confirmed: false }, { ...partner, email: "" }, { ...partner, userId: "" }, { ...partner, protectedAdministrator: true }];
  for (const value of identities) {
    let sent = 0;
    const result = await requestRepresentativeAccess("SS-ABC234", { enabled: true, limit: () => true, find: async () => value, send: async () => { sent++; } });
    assert.equal(result, representativeAccessMessage); assert.equal(sent, 0);
  }
});
test("rate limit and provider failures do not disclose eligibility or provider details", async () => {
  let attempts = 0;
  const keys: string[] = [];
  const deps = { enabled: true, limit: (key: string) => { keys.push(key); return attempts++ === 0; }, find: async () => partner, send: async () => { throw new Error("Secret provider response"); } };
  assert.equal(await requestRepresentativeAccess("SS-ABC234", deps), representativeAccessMessage);
  assert.equal(await requestRepresentativeAccess("SS-ABC234", deps), representativeAccessMessage);
  assert.match(keys[0], /^[a-f0-9]{64}$/); assert.doesNotMatch(keys[0], /SS-ABC234/);
});
test("authentication body limits count streamed UTF-8 bytes without trusting Content-Length", async () => {
  assert.equal(await readLimitedAuthBody(new Request("https://example.invalid", { method: "POST", body: "small" }), 5), "small");
  await assert.rejects(() => readLimitedAuthBody(new Request("https://example.invalid", { method: "POST", body: "ééé", headers: { "Content-Length": "1" } }), 5), AuthBodyLimitError);
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(3)); controller.enqueue(new Uint8Array(3)); },
    cancel() { cancelled = true; },
  });
  const request = new Request("https://example.invalid", { method: "POST", body: stream, duplex: "half" } as RequestInit);
  await assert.rejects(() => readLimitedAuthBody(request, 5), AuthBodyLimitError);
  assert.equal(cancelled, true);
});
test("authentication transitions are OFF by default and require exact explicit true gates", () => {
  const recovery = process.env.AUTH_RECOVERY_V2_ENABLED;
  const passwordless = process.env.PARTNER_PASSWORDLESS_ENABLED;
  try {
    delete process.env.AUTH_RECOVERY_V2_ENABLED; delete process.env.PARTNER_PASSWORDLESS_ENABLED;
    assert.equal(recoveryEnabled(), false); assert.equal(passwordlessEnabled(), false);
    for (const disabled of ["false", "TRUE", "1", "", "preview"]) {
      process.env.AUTH_RECOVERY_V2_ENABLED = disabled; process.env.PARTNER_PASSWORDLESS_ENABLED = disabled;
      assert.equal(recoveryEnabled(), false); assert.equal(passwordlessEnabled(), false);
    }
    process.env.AUTH_RECOVERY_V2_ENABLED = "true"; process.env.PARTNER_PASSWORDLESS_ENABLED = "true";
    assert.equal(recoveryEnabled(), true); assert.equal(passwordlessEnabled(), true);
  } finally {
    if (recovery === undefined) delete process.env.AUTH_RECOVERY_V2_ENABLED; else process.env.AUTH_RECOVERY_V2_ENABLED = recovery;
    if (passwordless === undefined) delete process.env.PARTNER_PASSWORDLESS_ENABLED; else process.env.PARTNER_PASSWORDLESS_ENABLED = passwordless;
  }
});
