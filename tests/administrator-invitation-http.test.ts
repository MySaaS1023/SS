import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

type InvitationRoute = { POST: (request: Request, args?: { params: Promise<{ id: string }> }) => Promise<Response>; GET: (request: Request) => Promise<Response> };
function invitationRoute(filename: string, mocks: Record<string, unknown>) {
  const container = { exports: {} as InvitationRoute };
  vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    module: container, exports: container.exports, Request, Response, URL,
    require: (name: string) => { if (name in mocks) return mocks[name]; throw new Error("Unexpected isolated invitation dependency " + name); },
  }, { filename });
  return container.exports;
}
const origin = "https://steadystart.example.invalid";
const responseHeaders = { "cache-control": "private, no-store, max-age=0", "referrer-policy": "no-referrer" };
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: responseHeaders });
const request = () => new Request(origin + "/api/admin/management/invitations", { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{}" });

test("administrator invitation API rejects unauthorized context before parsing or accessing provider/database work", async () => {
  for (const filename of ["app/api/admin/management/invitations/route.ts", "app/api/admin/management/invitations/[id]/route.ts"]) {
    const events: string[] = [];
    const route = invitationRoute(filename, {
      "@/lib/admin-management/invitations-server": {
        administratorInvitationContext: async () => null,
        prepareAdministratorInvitation: async () => { events.push("prepare"); },
        sendAdministratorInvitation: async () => { events.push("send"); },
        revokeAdministratorInvitation: async () => { events.push("revoke"); },
      },
      "@/lib/admin-management/invitations-http": { invitationResponse: respond, readInvitationRequest: async () => { events.push("parse"); return { body: {} }; } },
    });
    const result = await route.POST(request(), { params: Promise.resolve({ id: "synthetic-id" }) });
    assert.equal(result.status, 403);
    assert.match(result.headers.get("cache-control")!, /no-store/);
    assert.deepEqual(events, []);
  }
});

test("send requires explicit confirmation and uses server context and URL invitation ID instead of browser actor or identity", async () => {
  const context = { user: { id: "authenticated-super-admin" } };
  let body: Record<string, unknown> = { action: "send", confirmation: "synthetic@example.invalid", actor: "untrusted", id: "untrusted-id", role: "super_admin" };
  const calls: unknown[][] = [];
  const route = invitationRoute("app/api/admin/management/invitations/[id]/route.ts", {
    "@/lib/admin-management/invitations-server": {
      administratorInvitationContext: async () => context,
      sendAdministratorInvitation: async (...args: unknown[]) => { calls.push(args); return { status: "unknown", message: "Unknown provider outcome. Do not retry." }; },
      revokeAdministratorInvitation: async () => false,
    },
    "@/lib/admin-management/invitations-http": { invitationResponse: respond, readInvitationRequest: async () => ({ body }) },
  });
  assert.equal((await route.POST(request(), { params: Promise.resolve({ id: "url-invitation-id" }) })).status, 400);
  assert.equal(calls.length, 0);
  body = { ...body, ownerConfirmed: true };
  const result = await route.POST(request(), { params: Promise.resolve({ id: "url-invitation-id" }) });
  assert.equal(result.status, 409);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], context);
  assert.deepEqual(calls[0].slice(1), ["url-invitation-id", "synthetic@example.invalid"]);
  assert.match(await result.text(), /Do not retry/);
});

test("provider or SQL exceptions are never echoed from administrator invitation APIs", async () => {
  const secret = "PRIVATE_PROVIDER_BODY_AND_CREDENTIAL";
  const route = invitationRoute("app/api/admin/management/invitations/[id]/route.ts", {
    "@/lib/admin-management/invitations-server": {
      administratorInvitationContext: async () => ({ user: { id: "authenticated-super-admin" } }),
      sendAdministratorInvitation: async () => { throw new Error(secret); },
      revokeAdministratorInvitation: async () => false,
    },
    "@/lib/admin-management/invitations-http": { invitationResponse: respond, readInvitationRequest: async () => ({ body: { action: "send", ownerConfirmed: true, confirmation: "synthetic@example.invalid" } }) },
  });
  const result = await route.POST(request(), { params: Promise.resolve({ id: "synthetic-id" }) });
  assert.equal(result.status, 409);
  assert.doesNotMatch(await result.text(), new RegExp(secret));
});

test("acceptance is gated and requires explicit consent, forwarding only the proposed password pair to cookie-bound verification", async () => {
  let enabled = false;
  let body: Record<string, unknown> = { password: "SYNTHETIC-password-123", confirmation: "SYNTHETIC-password-123", userId: "untrusted", role: "super_admin", nonce: "untrusted" };
  const calls: unknown[][] = [];
  const route = invitationRoute("app/auth/admin-invite/complete/route.ts", {
    "@/lib/admin-management/invitations-core": { invitationsEnabled: () => enabled },
    "@/lib/admin-management/invitations-server": { completeAdministratorInvitation: async (...args: unknown[]) => { calls.push(args); return true; } },
    "@/lib/admin-management/invitations-http": { invitationResponse: respond, readInvitationRequest: async () => ({ body }) },
  });
  assert.equal((await route.POST(request())).status, 403);
  enabled = true;
  assert.equal((await route.POST(request())).status, 400);
  assert.deepEqual(calls, []);
  body = { ...body, accept: true };
  const result = await route.POST(request());
  assert.equal(result.status, 200);
  assert.deepEqual(calls, [[body.password, body.confirmation]]);
  assert.doesNotMatch(await result.text(), /untrusted|SYNTHETIC-password|super_admin/);
});

test("invitation callback never forwards token proof or attacker-controlled next destinations", async () => {
  for (const allowed of [false, true]) {
    const route = invitationRoute("app/auth/admin-invite/route.ts", {
      "next/server": { NextResponse: { redirect: (url: URL, init: ResponseInit) => new Response(null, { status: 307, headers: { ...init.headers, location: url.href } }) } },
      "@/lib/admin-management/invitations-server": { beginAdministratorInvitation: async () => allowed },
      "@/lib/admin-management/invitations-http": { invitationResponseHeaders: responseHeaders },
      "@/lib/referrals/server": { rateLimit: () => true },
    });
    const result = await route.GET(new Request(origin + "/auth/admin-invite?id=synthetic-id&nonce=synthetic-secret&token_hash=synthetic-hash&type=invite&next=https://evil.example.invalid"));
    const location = new URL(result.headers.get("location")!);
    assert.equal(location.origin, origin);
    assert.equal(location.pathname, allowed ? "/auth/admin-invite/accept" : "/admin/login");
    assert.doesNotMatch(location.href, /synthetic-secret|synthetic-hash|evil\.example/);
    assert.equal(result.headers.get("referrer-policy"), "no-referrer");
  }
});
