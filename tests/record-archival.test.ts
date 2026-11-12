import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { archiveRequest, canPartnerRemoveReferral } from "../lib/referrals/archival";

const recordId = "11111111-1111-4111-8111-111111111111";
const actorId = "22222222-2222-4222-8222-222222222222";
const origin = "https://www.steadystartco.com";
const input = { kind: "referral", recordId, confirmation: `ARCHIVE ${recordId}` };

test("archive requests bind confirmation to the exact supported record and reject financial deletion", () => {
  assert.deepEqual(archiveRequest(input), input);
  for (const value of [
    null, {}, { ...input, kind: "commission" }, { ...input, kind: "payout" },
    { ...input, recordId: "not-a-uuid" }, { ...input, recordId: "------------------------------------" },
    { ...input, confirmation: "ARCHIVE another-record" }, { ...input, confirmation: "yes" },
  ]) assert.equal(archiveRequest(value), null);
});

test("submitted partner referrals are not silently treated as deletable drafts", () => {
  assert.equal(canPartnerRemoveReferral(), false);
});

function mockedArchiveRoute(options: { enabled?: boolean; authorized?: boolean; rpcError?: boolean } = {}) {
  const events: { name: string; args?: unknown }[] = [];
  const result = { exports: {} as { POST: (request: Request) => Promise<Response> } };
  const realRequire = createRequire(import.meta.url);
  const filename = "app/api/admin/records/archive/route.ts";
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    module: result, exports: result.exports, Request, Response, Headers, Buffer, TextDecoder, URL,
    require: (name: string) => {
      if (name === "next/server") return { NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) } };
      if (name === "next/cache") return { revalidatePath: (...args: unknown[]) => events.push({ name: "revalidate", args }) };
      if (name === "@/lib/admin-management/server") return { administratorManagementEnabled: () => options.enabled ?? true };
      if (name === "@/lib/referrals/archival") return { archiveRequest };
      if (name === "@/lib/supabase/server") return {
        getFullyAuthorizedAdminUser: async () => { events.push({ name: "authorize" }); return options.authorized === false ? null : { id: actorId }; },
        createAdminSupabaseClient: () => ({ rpc: async (name: string, args: unknown) => { events.push({ name, args }); return { error: options.rpcError ? { message: "PRIVATE_DATABASE_DETAILS" } : null }; } }),
      };
      return realRequire(name);
    },
  }, { filename });
  return { POST: result.exports.POST, events };
}

function request(body: unknown = input, headers: Record<string, string> = {}) {
  return new Request(origin + "/api/admin/records/archive", {
    method: "POST", headers: { origin, "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

test("archival disabled by default cannot authenticate or reach the database", async () => {
  const route = mockedArchiveRoute({ enabled: false });
  assert.equal((await route.POST(request())).status, 503);
  assert.deepEqual(route.events, []);
});

test("unauthorized and cross-origin archive attempts never reach the RPC", async () => {
  const unauthorized = mockedArchiveRoute({ authorized: false });
  assert.equal((await unauthorized.POST(request())).status, 403);
  assert.deepEqual(unauthorized.events.map(event => event.name), ["authorize"]);
  const crossOrigin = mockedArchiveRoute();
  assert.equal((await crossOrigin.POST(request(input, { origin: "https://example.invalid" }))).status, 403);
  assert.deepEqual(crossOrigin.events.map(event => event.name), ["authorize"]);
});

test("archive RPC uses the authenticated actor and fixed operation; client actor is ignored", async () => {
  const route = mockedArchiveRoute();
  const response = await route.POST(request({ ...input, p_actor: "attacker", permanentDelete: true }));
  assert.equal(response.status, 200);
  const operation = route.events.find(event => event.name === "archive_referral_record");
  assert.deepEqual(JSON.parse(JSON.stringify(operation?.args)), {
    p_actor: actorId, p_kind: "referral", p_record: recordId, p_confirmation: input.confirmation,
  });
  assert.equal(route.events.filter(event => event.name === "archive_referral_record").length, 1);
  assert.ok(route.events.some(event => event.name === "revalidate"));
});

test("dependency or audit rejection never reports success or exposes raw database errors", async () => {
  const route = mockedArchiveRoute({ rpcError: true });
  const response = await route.POST(request());
  assert.equal(response.status, 409);
  assert.doesNotMatch(await response.text(), /PRIVATE_DATABASE_DETAILS/);
  assert.ok(!route.events.some(event => event.name === "revalidate"));
});

test("invalid record confirmation is rejected before any archive operation", async () => {
  const route = mockedArchiveRoute();
  assert.equal((await route.POST(request({ ...input, confirmation: "yes" }))).status, 400);
  assert.ok(!route.events.some(event => event.name === "archive_referral_record"));
});

test("actual streamed byte limits reject oversize JSON even without a truthful content length", async () => {
  const headerCases: Record<string, string>[] = [{}, { "content-length": "1" }];
  for (const headers of headerCases) {
    const route = mockedArchiveRoute();
    const response = await route.POST(request({ ...input, notes: "é".repeat(1100) }, headers));
    assert.equal(response.status, 413);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.ok(!route.events.some(event => event.name === "archive_referral_record"));
  }
});

test("unsupported media, malformed JSON and every authorization outcome stay non-cacheable", async () => {
  const wrongMedia = mockedArchiveRoute();
  const mediaResponse = await wrongMedia.POST(request(input, { "content-type": "text/plain" }));
  assert.equal(mediaResponse.status, 415);
  assert.equal(mediaResponse.headers.get("cache-control"), "no-store");
  const malformed = mockedArchiveRoute();
  const malformedResponse = await malformed.POST(new Request(origin + "/api/admin/records/archive", {
    method: "POST", headers: { origin, "content-type": "application/json" }, body: "{",
  }));
  assert.equal(malformedResponse.status, 400);
  assert.equal(malformedResponse.headers.get("cache-control"), "no-store");
  for (const options of [{ enabled: false }, { authorized: false }, { rpcError: true }, {}]) {
    const route = mockedArchiveRoute(options);
    assert.equal((await route.POST(request())).headers.get("cache-control"), "no-store");
  }
});
