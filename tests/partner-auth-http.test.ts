import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { representativeAccessMessage } from "../lib/partner-auth/passwordless-core";
import { validRecoveryTokenHash, recoveryPortal } from "../lib/partner-auth/recovery-core";
import { readLimitedAuthBody } from "../lib/partner-auth/http-body";

type HttpRoute = { GET: (request: Request) => Promise<Response>; POST: (request: Request) => Promise<Response> };
function route(filename: string, mocks: Record<string, unknown>) {
  const container = { exports: {} as HttpRoute };
  const source = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {
    module: container, exports: container.exports, Request, Response, Headers, URL, TextDecoder,
    Date, Buffer,
    require: (name: string) => {
      if (name in mocks) return mocks[name];
      throw new Error("Unexpected isolated route dependency " + name);
    },
  }, { filename });
  return container.exports;
}
const origin = "https://steadystart.example.invalid";
const jsonResponse = { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) };
const nextResponse = {
  ...jsonResponse,
  redirect: (url: URL, init?: ResponseInit) => new Response(null, { ...init, status: 307, headers: { ...init?.headers, location: url.href } }),
};

test("representative request returns one private response before any lookup/provider work and never sets verifier cookies", async () => {
  const deferred: (() => Promise<void>)[] = [], requested: unknown[] = [];
  const handler = route("app/api/partner/auth/representative-access/route.ts", {
    "next/server": { NextResponse: jsonResponse, after: (work: () => Promise<void>) => deferred.push(work) },
    "node:crypto": { randomInt: () => 700 }, "node:timers/promises": { setTimeout: async () => {} },
    "@/lib/partner-auth/passwordless-core": { representativeAccessMessage },
    "@/lib/partner-auth/passwordless-server": { sendRepresentativeAccess: async (id: unknown) => { requested.push(id); } },
    "@/lib/referrals/server": { rateLimit: () => true },
    "@/lib/partner-auth/http-body": { readLimitedAuthBody },
  });
  const response = await handler.POST(new Request(origin + "/api/partner/auth/representative-access", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ representativeId: "SS-ABC234" }) }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: representativeAccessMessage });
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(requested, []);
  assert.equal(deferred.length, 1);
  await deferred[0]();
  assert.deepEqual(requested, ["SS-ABC234"]);
});

test("cross-origin, media, rate, malformed and oversized representative attempts cannot schedule delivery or reveal eligibility", async () => {
  const cases: { headers: Record<string, string>; body: string; limit: boolean }[] = [
    { headers: { origin: "https://other.example.invalid", "content-type": "application/json" }, body: "{}", limit: true },
    { headers: { origin, "content-type": "text/plain" }, body: "{}", limit: true },
    { headers: { origin, "content-type": "application/json" }, body: "{}", limit: false },
    { headers: { origin, "content-type": "application/json" }, body: "{", limit: true },
    { headers: { origin, "content-type": "application/json", "content-length": "1" }, body: JSON.stringify({ representativeId: "SS-ABC234", extra: "é".repeat(1100) }), limit: true },
  ];
  for (const item of cases) {
    let scheduled = 0;
    const handler = route("app/api/partner/auth/representative-access/route.ts", {
      "next/server": { NextResponse: jsonResponse, after: () => { scheduled++; } },
      "node:crypto": { randomInt: () => 700 }, "node:timers/promises": { setTimeout: async () => {} },
      "@/lib/partner-auth/passwordless-core": { representativeAccessMessage },
      "@/lib/partner-auth/passwordless-server": { sendRepresentativeAccess: async () => { throw new Error("Unexpected provider"); } },
      "@/lib/referrals/server": { rateLimit: () => item.limit },
      "@/lib/partner-auth/http-body": { readLimitedAuthBody },
    });
    const response = await handler.POST(new Request(origin + "/api/partner/auth/representative-access", { method: "POST", headers: item.headers, body: item.body }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: representativeAccessMessage });
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(scheduled, 0);
  }
});

test("recovery callback is gated, rejects invalid portals/provider failures and redirects only to the dedicated reset screen", async () => {
  for (const item of [{ enabled: false, portal: "admin", nonce: "synthetic-nonce" }, { enabled: true, portal: "external", nonce: "synthetic-nonce" }, { enabled: true, portal: "admin", nonce: null }, { enabled: true, portal: "admin", nonce: "synthetic-nonce" }]) {
    const events: unknown[] = [];
    const handler = route("app/auth/recovery/route.ts", {
      "next/server": { NextResponse: nextResponse },
      "@/lib/partner-auth/recovery-core": { recoveryEnabled: () => item.enabled, recoveryPortal },
      "@/lib/partner-auth/recovery-server": {
        recoveryContext: async () => { events.push("context"); return { service: { begin: async (hash: string, type: string, portal: string) => { events.push([hash, type, portal]); return item.nonce; } } }; },
        setRecoveryCookie: async (portal: string, nonce: string) => { events.push(["cookie", portal, nonce]); },
      },
    });
    const response = await handler.GET(new Request(origin + "/auth/recovery?portal=" + item.portal + "&type=recovery&token_hash=" + "a".repeat(64) + "&next=https://evil.example.invalid"));
    const location = new URL(response.headers.get("location")!);
    assert.equal(location.origin, origin);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    if (!item.enabled || item.portal === "external") assert.deepEqual(events, []);
    if (item.enabled && item.portal === "admin" && item.nonce) {
      assert.equal(location.pathname, "/admin/reset-password");
      assert.ok(events.some(event => Array.isArray(event) && event[0] === "cookie"));
    } else {
      assert.ok(location.pathname.endsWith("/forgot-password"));
      assert.ok(!events.some(event => Array.isArray(event) && event[0] === "cookie"));
    }
    assert.ok(!location.href.includes("token_hash"));
  }
});

test("passwordless callback requires a one-time provider exchange and approved partner before creating portal access", async () => {
  for (const item of [{ enabled: false, type: "magiclink", provider: true, role: "partner", finish: true }, { enabled: true, type: "recovery", provider: true, role: "partner", finish: true }, { enabled: true, type: "magiclink", provider: false, role: "partner", finish: true }, { enabled: true, type: "magiclink", provider: true, role: "admin", finish: true }, { enabled: true, type: "magiclink", provider: true, role: "partner", finish: false }, { enabled: true, type: "magiclink", provider: true, role: "partner", finish: true }]) {
    const events: unknown[] = [];
    const handler = route("app/auth/partner-access/route.ts", {
      "next/server": { NextResponse: nextResponse },
      "@/lib/partner-auth/passwordless-core": { passwordlessEnabled: () => item.enabled },
      "@/lib/partner-auth/recovery-core": { validRecoveryTokenHash },
      "@/lib/supabase/server": {
        createServerSupabaseClient: async () => { events.push("client"); return { auth: { verifyOtp: async (params: unknown) => { events.push(params); return { data: { user: item.provider ? { id: "synthetic-partner" } : null }, error: item.provider ? null : { message: "PRIVATE_PROVIDER_DETAILS" } }; }, signOut: async () => { events.push("signout"); } } }; },
        getUserReferralRole: async () => item.role,
      },
      "@/lib/partner-auth/passwordless-server": { finishRepresentativeAccess: async () => { events.push("finish"); return item.finish; } },
    });
    const response = await handler.GET(new Request(origin + "/auth/partner-access?type=" + item.type + "&token_hash=" + "a".repeat(64) + "&next=https://evil.example.invalid"));
    const location = new URL(response.headers.get("location")!);
    const success = item.enabled && item.type === "magiclink" && item.provider && item.role === "partner" && item.finish;
    assert.equal(location.origin, origin);
    assert.equal(location.pathname, success ? "/partner" : "/partner/login");
    if (!item.enabled || item.type !== "magiclink") assert.deepEqual(events, []);
    if (item.enabled && item.type === "magiclink") assert.deepEqual(JSON.parse(JSON.stringify(events[1])), { token_hash: "a".repeat(64), type: "magiclink" });
    if (item.enabled && item.type === "magiclink" && !success) assert.ok(events.includes("signout"));
    assert.doesNotMatch(await response.text(), /PRIVATE_PROVIDER_DETAILS|synthetic-partner/);
  }
});
