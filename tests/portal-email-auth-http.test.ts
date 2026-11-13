import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as core from "../lib/portal-auth/core";
import { readLimitedAuthBody } from "../lib/partner-auth/http-body";

type Route = { GET(request: Request): Promise<Response>; POST(request: Request): Promise<Response> };
function isolated(filename: string, mocks: Record<string, unknown>) {
  const container = { exports: {} as Route };
  vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    module: container, exports: container.exports, Request, Response, Headers, URL, URLSearchParams, TextDecoder, Date,
    process: { env: { NODE_ENV: "production" } },
    require: (name: string) => { if (name in mocks) return mocks[name]; throw Error("Unexpected dependency " + name); },
  }, { filename });
  return container.exports;
}
const origin = "https://steadystart.example.invalid";
const hash = "b".repeat(64);
class MockNextResponse extends Response {
  cookies = { set: (name: string, value: string, options: { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: string }) => { this.headers.append("set-cookie", `${name}=${value}; Max-Age=${options.maxAge}; Path=${options.path}; ${options.httpOnly ? "HttpOnly; " : ""}${options.secure ? "Secure; " : ""}SameSite=${options.sameSite}`); } };
  static redirect(url: URL | string, init?: ResponseInit | number) { const settings = typeof init === "number" ? { status: init } : init; return new MockNextResponse(null, { ...settings, status: settings?.status ?? 307, headers: { ...settings?.headers, location: String(url) } }); }
  static json(body: unknown, init?: ResponseInit) { return new MockNextResponse(JSON.stringify(body), { ...init, headers: { ...init?.headers, "content-type": "application/json" } }); }
}
function confirmationFixture(input: { enabled?: boolean; pending?: string; destination?: string | null; limited?: boolean } = {}) {
  const calls: unknown[] = [];
  const handler = isolated("app/auth/email-access/route.ts", {
    "next/headers": { cookies: async () => ({ get: () => input.pending ? { value: input.pending } : undefined }) },
    "next/server": { NextResponse: MockNextResponse },
    "@/lib/referrals/config": { getSiteUrl: () => origin },
    "@/lib/referrals/server": { rateLimit: () => input.limited !== true },
    "@/lib/partner-auth/http-body": { readLimitedAuthBody },
    "@/lib/portal-auth/core": { ...core, emailLinksEnabled: () => input.enabled !== false },
    "@/lib/portal-auth/server": { finishPortalEmailLink: async (...values: unknown[]) => { calls.push(values); return input.destination ?? null; } },
  });
  return { handler, calls };
}
test("mail-scanner GET never verifies a token; callback parks only an opaque 5-minute secure cookie and removes the token URL", async () => {
  const f = confirmationFixture();
  const response = await f.handler.GET(new Request(origin + "/auth/email-access?portal=partner&type=magiclink&token_hash=" + hash + "&next=https://evil.example.invalid"));
  assert.equal(response.status, 303); assert.equal(response.headers.get("location"), origin + "/auth/email-access?portal=partner&confirm=1"); assert.deepEqual(f.calls, []);
  assert.match(response.headers.get("set-cookie")!, /ss-email-access-partner=.*Max-Age=300; Path=\/auth\/email-access; HttpOnly; Secure; SameSite=lax/);
  assert.equal(await response.text(), ""); assert.match(response.headers.get("cache-control")!, /no-store/); assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});
test("confirmation page has no raw tokens, script, third-party assets or referral tracking and never establishes a session", async () => {
  const f = confirmationFixture({ pending: hash });
  const response = await f.handler.GET(new Request(origin + "/auth/email-access?portal=admin&confirm=1"));
  const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /Confirm Sign-In/); assert.match(html, /method="post" action="\/auth\/email-access"/); assert.doesNotMatch(html, new RegExp(hash)); assert.doesNotMatch(html, /<script|<img|<iframe|token_hash|referral-tracker|https:\/\//);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow"); assert.match(response.headers.get("content-security-policy")!, /default-src 'none'/); assert.equal(response.headers.get("referrer-policy"), "no-referrer"); assert.deepEqual(f.calls, []);
});
test("OFF, invalid, repeated parameters, wrong token types and unknown portals never reach provider or set pending cookie", async () => {
  for (const query of ["portal=admin&type=recovery&token_hash=" + hash, "portal=admin&type=invite&token_hash=" + hash, "portal=customer&type=magiclink&token_hash=" + hash, "portal=admin&type=magiclink&token_hash=invalid", "portal=admin&portal=partner&type=magiclink&token_hash=" + hash, "portal=admin&type=magiclink&type=recovery&token_hash=" + hash, "portal=admin&type=magiclink&token_hash=" + hash + "&token_hash=" + hash]) {
    const f = confirmationFixture(); const response = await f.handler.GET(new Request(origin + "/auth/email-access?" + query));
    assert.equal(response.status, 303); assert.equal(response.headers.get("set-cookie"), null); assert.deepEqual(f.calls, []); assert.doesNotMatch(response.headers.get("location")!, /token_hash|evil/);
  }
  const off = confirmationFixture({ enabled: false }); assert.equal((await off.handler.GET(new Request(origin + "/auth/email-access?portal=admin&type=magiclink&token_hash=" + hash))).headers.get("set-cookie"), null); assert.deepEqual(off.calls, []);
});
test("confirmation POST requires same origin, bounded form, explicit confirmation and matching portal cookie", async () => {
  for (const input of [
    { body: "portal=admin&confirmation=yes", origin: "https://evil.example.invalid", media: "application/x-www-form-urlencoded", pending: hash },
    { body: "portal=admin&confirmation=yes", origin, media: "application/json", pending: hash },
    { body: "portal=admin&confirmation=no", origin, media: "application/x-www-form-urlencoded", pending: hash },
    { body: "portal=external&confirmation=yes", origin, media: "application/x-www-form-urlencoded", pending: hash },
    { body: "portal=admin&confirmation=yes", origin, media: "application/x-www-form-urlencoded", pending: undefined },
    { body: "portal=admin&confirmation=yes&extra=" + "é".repeat(1100), origin, media: "application/x-www-form-urlencoded", pending: hash },
  ]) {
    const f = confirmationFixture({ pending: input.pending, destination: "/admin" });
    const response = await f.handler.POST(new Request(origin + "/auth/email-access", { method: "POST", headers: { origin: input.origin, "content-type": input.media }, body: input.body }));
    assert.equal(response.status, 303); assert.deepEqual(f.calls, []); assert.match(response.headers.get("location")!, /\/admin\/login\?error=invalid-link$/);
  }
});
test("confirmed verification uses server-side cookie only, clears it, and only redirects to fixed same-role destinations", async () => {
  for (const [portal, destination, expected] of [["admin", "/admin", "/admin"], ["partner", "/partner", "/partner"], ["partner", "/admin", "/partner/login?error=invalid-link"], ["admin", "https://evil.example.invalid", "/admin/login?error=invalid-link"], ["admin", null, "/admin/login?error=invalid-link"]] as const) {
    const f = confirmationFixture({ pending: hash, destination });
    const response = await f.handler.POST(new Request(origin + "/auth/email-access?next=https://evil.example.invalid", { method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" }, body: `portal=${portal}&confirmation=yes&token_hash=attacker` }));
    assert.equal(response.headers.get("location"), origin + expected); assert.match(response.headers.get("set-cookie")!, /Max-Age=0/); assert.deepEqual(JSON.parse(JSON.stringify(f.calls)), [[hash, portal]]); assert.equal(await response.text(), "");
  }
});
test("request endpoint responds generically before directory/provider work, with no account-dependent cookies", async () => {
  const deferred: (() => Promise<void>)[] = [], calls: unknown[] = [];
  const requestHandler = isolated("lib/portal-auth/http.ts", {
    "next/server": { NextResponse: MockNextResponse, after: (work: () => Promise<void>) => deferred.push(work) },
    "node:crypto": { randomInt: () => 700 }, "node:timers/promises": { setTimeout: async () => {} },
    "@/lib/referrals/server": { rateLimit: () => true }, "@/lib/partner-auth/http-body": { readLimitedAuthBody },
    "./core": { ...core, emailLinksEnabled: () => true }, "./server": { sendPortalEmailLink: async (...args: unknown[]) => { calls.push(args); } },
  }) as unknown as { portalEmailLinkRequest(request: Request, portal: core.Portal): Promise<Response> };
  const response = await requestHandler.portalEmailLinkRequest(new Request(origin + "/api/admin/auth/email-link", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ email: "owner@example.invalid" }) }), "admin");
  assert.deepEqual(await response.json(), { message: core.emailLinkMessage }); assert.equal(response.headers.get("set-cookie"), null); assert.deepEqual(calls, []); assert.equal(deferred.length, 1); await deferred[0](); assert.deepEqual(calls, [["owner@example.invalid", "admin"]]);
});
test("OFF email request endpoints cannot read a body, query identity, change cookies, or schedule a provider", async () => {
  const never = () => { throw Error("Disabled flow must not execute"); };
  const requestHandler = isolated("lib/portal-auth/http.ts", {
    "next/server": { NextResponse: MockNextResponse, after: never },
    "node:crypto": { randomInt: () => 700 }, "node:timers/promises": { setTimeout: async () => {} },
    "@/lib/referrals/server": { rateLimit: never }, "@/lib/partner-auth/http-body": { readLimitedAuthBody: never },
    "./core": { ...core, emailLinksEnabled: () => false }, "./server": { sendPortalEmailLink: never },
  }) as unknown as { portalEmailLinkRequest(request: Request, portal: core.Portal): Promise<Response> };
  for (const portal of ["admin", "partner"] as const) {
    const response = await requestHandler.portalEmailLinkRequest(new Request(origin + `/api/${portal}/auth/email-link`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ email: "owner@example.invalid" }) }), portal);
    assert.deepEqual(await response.json(), { message: core.emailLinkMessage }); assert.equal(response.headers.get("set-cookie"), null);
  }
});
test("cross-origin, incorrect media, oversized/malformed bodies and rate limits cannot schedule authentication delivery", async () => {
  for (const item of [
    { origin: "https://evil.example.invalid", media: "application/json", body: "{}", limit: true },
    { origin, media: "text/plain", body: "{}", limit: true },
    { origin, media: "application/json", body: "{", limit: true },
    { origin, media: "application/json", body: JSON.stringify({ email: "owner@example.invalid", extra: "é".repeat(1100) }), limit: true },
    { origin, media: "application/json", body: JSON.stringify({ email: "owner@example.invalid" }), limit: false },
  ]) {
    let scheduled = 0;
    const requestHandler = isolated("lib/portal-auth/http.ts", {
      "next/server": { NextResponse: MockNextResponse, after: () => { scheduled++; } },
      "node:crypto": { randomInt: () => 700 }, "node:timers/promises": { setTimeout: async () => {} },
      "@/lib/referrals/server": { rateLimit: () => item.limit }, "@/lib/partner-auth/http-body": { readLimitedAuthBody },
      "./core": { ...core, emailLinksEnabled: () => true }, "./server": { sendPortalEmailLink: async () => {} },
    }) as unknown as { portalEmailLinkRequest(request: Request, portal: core.Portal): Promise<Response> };
    const response = await requestHandler.portalEmailLinkRequest(new Request(origin + "/api/admin/auth/email-link", { method: "POST", headers: { origin: item.origin, "content-type": item.media, "content-length": "1" }, body: item.body }), "admin");
    assert.deepEqual(await response.json(), { message: core.emailLinkMessage }); assert.equal(scheduled, 0); assert.equal(response.headers.get("set-cookie"), null);
  }
});
