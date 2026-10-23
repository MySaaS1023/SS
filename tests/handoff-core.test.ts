import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  createHandoffService,
  decryptToken,
  encryptToken,
  HandoffError,
  hashToken,
  tokenKey,
  validToken,
  validateWebsiteUrl,
  type HandoffRow,
  type HandoffStore,
} from "../lib/handoff/core";
import {
  getGoogleReviewUrl,
  getHandoffSocialLinks,
  socialLinks,
} from "../lib/social-links";

const key = "ab".repeat(32); // Isolated fixture, never used outside tests.
const details = {
  businessName: "Apex",
  businessPhone: "+1 303-555-0198",
  businessEmail: "client@example.com",
  contactName: "Avery Client",
  websiteUrl: "https://apex.example.com",
  message: "Thank you!",
  sourceReferralId: null,
};
function fixture(
  options: { authorized?: boolean; encryptionKey?: string } = {},
) {
  const rows: HandoffRow[] = [];
  let calls = 0;
  const store: HandoffStore = {
    async insert(row) {
      calls++;
      const result: HandoffRow = {
        ...row,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: "active",
      };
      rows.unshift(result);
      return result;
    },
    async list(page = 1) {
      calls++;
      return rows.slice((page - 1) * 100, page * 100);
    },
    async findById(id) {
      calls++;
      return rows.find((r) => r.id === id) || null;
    },
    async findActiveByHash(hash) {
      calls++;
      return (
        rows.find((r) => r.tokenHash === hash && r.status === "active") || null
      );
    },
    async deactivate(id) {
      calls++;
      const row = rows.find((r) => r.id === id);
      if (row) row.status = "inactive";
    },
  };
  const service = createHandoffService({
    store,
    authorize: async () =>
      options.authorized === false ? null : { id: randomUUID() },
    encryptionKey: options.encryptionKey ?? key,
    origin: "https://www.steadystartco.com",
  });
  return {
    rows,
    store,
    service,
    get calls() {
      return calls;
    },
  };
}
const errorCode = (code: string) => (error: unknown) =>
  error instanceof HandoffError && error.code === code;
test("create, stable admin copy, public projection, preview and immediate revocation", async () => {
  const f = fixture();
  const created = await f.service.create(details);
  assert.ok(created.url);
  const token = created.url.split("/").pop()!;
  assert.equal(validToken(token), true);
  assert.equal(f.rows[0].tokenHash, hashToken(token));
  assert.ok(!JSON.stringify(f.rows).includes(token));
  assert.deepEqual(await f.service.resolve(token), {
    businessName: details.businessName,
    websiteUrl: "https://apex.example.com/",
    message: details.message,
  });
  assert.deepEqual(Object.keys((await f.service.resolve(token))!).sort(), [
    "businessName",
    "message",
    "websiteUrl",
  ]);
  assert.equal((await f.service.list())[0].url, created.url);
  assert.deepEqual(
    await f.service.preview(created.id),
    await f.service.resolve(token),
  );
  await f.service.deactivate(created.id);
  assert.equal(await f.service.resolve(token), null);
  assert.equal((await f.service.list())[0].url, null);
});
test("every admin operation authorizes before accessing storage", async () => {
  const f = fixture({ authorized: false });
  for (const run of [
    () => f.service.create(details),
    () => f.service.list(),
    () => f.service.preview(randomUUID()),
    () => f.service.deactivate(randomUUID()),
  ])
    await assert.rejects(run, errorCode("unauthorized"));
  assert.equal(f.calls, 0);
});
test("public resolve and admin revoke work without token encryption key", async () => {
  const f = fixture();
  const created = await f.service.create(details);
  const withoutKey = createHandoffService({
    store: f.store,
    authorize: async () => ({ id: randomUUID() }),
  });
  assert.ok(await withoutKey.resolve(created.url!.split("/").pop()!));
  assert.equal((await withoutKey.list())[0].url, null);
  await assert.rejects(
    () => withoutKey.create(details),
    errorCode("configuration"),
  );
  assert.equal(f.rows.length, 1);
  await withoutKey.deactivate(created.id);
  assert.equal(f.rows[0].status, "inactive");
});
test("invalid inputs cannot persist; normalization and maximums enforced", async () => {
  const f = fixture();
  for (const input of [
    { ...details, businessName: " " },
    { ...details, businessName: "x".repeat(121) },
    { ...details, message: "x".repeat(1501) },
    { ...details, businessEmail: "not-an-email" },
    { ...details, businessPhone: "123" },
    { ...details, contactName: " " },
    { ...details, websiteUrl: "javascript:alert(1)" },
  ])
    await assert.rejects(
      () => f.service.create(input),
      errorCode("validation"),
    );
  assert.equal(f.calls, 0);
  const row = await f.service.create({
    ...details,
    businessName: "  Apex\n  Business ",
    message: "\u0000 Hello\r\nclient ",
  });
  assert.equal(row.businessName, "Apex Business");
  assert.equal(row.message, "Hello\nclient");
});
test("unsafe URLs are rejected and public tokens are canonical", async () => {
  for (const url of [
    "http://example.com",
    "https://user:pass@example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://2130706433",
    "https://0x7f000001",
    "https://[::1]",
    "https://10.0.0.1",
    "https://host.local",
    "file:///secret",
  ])
    assert.throws(() => validateWebsiteUrl(url), HandoffError);
  const f = fixture();
  for (const token of [
    "",
    "x".repeat(42),
    "x".repeat(44),
    "-".repeat(43),
    "a/b".repeat(15),
  ])
    assert.equal(await f.service.resolve(token), null);
  assert.equal(f.calls, 0);
});
test("random tokens differ, encryption authenticates tampering and wrong keys", async () => {
  const f = fixture();
  const a = await f.service.create(details);
  const b = await f.service.create(details);
  assert.notEqual(a.url, b.url);
  const token = a.url!.split("/").pop()!;
  const encrypted = encryptToken(token, tokenKey(key));
  assert.equal(decryptToken(encrypted, tokenKey(key)), token);
  assert.throws(
    () => decryptToken(encrypted, tokenKey("cd".repeat(32))),
    HandoffError,
  );
  const parts = encrypted.split(".");
  parts[2] = "A" + parts[2].slice(1);
  if (parts.join(".") === encrypted) parts[2] = "B" + parts[2].slice(1);
  assert.throws(
    () => decryptToken(parts.join("."), tokenKey(key)),
    HandoffError,
  );
  const swapped = encrypted.split(".");
  [swapped[1], swapped[2]] = [swapped[2], swapped[1]];
  assert.throws(
    () => decryptToken(swapped.join("."), tokenKey(key)),
    HandoffError,
  );
});
test("storage failures cannot expose backend errors or secrets", async () => {
  const f = fixture();
  f.store.list = async () => {
    throw new Error("SECRET credential database raw message");
  };
  await assert.rejects(
    () => f.service.list(),
    (error: unknown) =>
      error instanceof HandoffError &&
      error.code === "storage_unavailable" &&
      !error.message.includes("SECRET"),
  );
});
test("admin input rejects malformed IDs before storage and limits management results", async () => {
  const f = fixture();
  await assert.rejects(
    () => f.service.preview("bad-id"),
    errorCode("validation"),
  );
  await assert.rejects(
    () => f.service.deactivate("bad-id"),
    errorCode("validation"),
  );
  assert.equal(f.calls, 0);
  const row = await f.service.create(details);
  f.rows.push(
    ...Array.from({ length: 105 }, () => ({ ...f.rows[0], id: randomUUID() })),
  );
  const listed = await f.service.list();
  assert.equal(listed.length, 100);
  assert.equal(listed[0].id, row.id);
  assert.equal(await f.service.preview(randomUUID()), null);
  const older = await f.service.list(2);
  assert.equal(older.length, 6);
  await f.service.deactivate(older[0].id);
  assert.equal((await f.service.list(2))[0].status, "inactive");
  const calls = f.calls;
  for (const page of [0, -1, 1.5, 100001, NaN, Infinity])
    await assert.rejects(() => f.service.list(page), errorCode("validation"));
  assert.equal(f.calls, calls);
});
test("Google reviews require explicit eligibility and an allowed Google review URL", () => {
  assert.equal(getGoogleReviewUrl(), null);
  for (const url of [
    "https://evil.example/review",
    "https://g.page.evil.example/r/token/review",
    "https://google.com",
    "javascript:alert(1)",
    "https://user:pass@g.page/r/token/review",
  ])
    assert.equal(
      getGoogleReviewUrl({
        ...socialLinks,
        googleBusinessProfileVerifiedEligible: true,
        googleReviewUrl: url,
      }),
      null,
    );
  const googleReviewUrl = "https://g.page/r/official-token/review";
  assert.equal(getGoogleReviewUrl({ ...socialLinks, googleReviewUrl }), null);
  assert.equal(
    getGoogleReviewUrl({
      ...socialLinks,
      googleReviewUrl,
      googleBusinessProfileVerifiedEligible: true,
    }),
    googleReviewUrl,
  );
  assert.equal(getHandoffSocialLinks().length, 3);
  assert.deepEqual(
    getHandoffSocialLinks({
      ...socialLinks,
      facebook: null,
      youtube: "javascript:alert(1)",
      tiktok: "https://tiktok.com.evil.example/account",
    }),
    [],
  );
  assert.deepEqual(
    getHandoffSocialLinks({
      ...socialLinks,
      facebook: "",
      youtube: "https://user:secret@www.youtube.com/channel/account",
      tiktok: "http://www.tiktok.com/account",
    }),
    [],
  );
  assert.equal(
    getHandoffSocialLinks({
      ...socialLinks,
      facebook: "https://www.facebook.com/example",
      youtube: null,
      tiktok: null,
    })[0].label,
    "Facebook",
  );
});
