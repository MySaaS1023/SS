import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as core from "../lib/portal-auth/core";

type Adapter = { sendPortalEmailLink(value: unknown, portal: core.Portal): Promise<string>; finishPortalEmailLink(hash: string, portal: core.Portal): Promise<string | null> };
function fixture(options: { enabled?: boolean; existing?: boolean; confirmed?: boolean; providerError?: boolean; approved?: boolean; sessionError?: boolean; missingSession?: boolean } = {}) {
  const events: unknown[] = [];
  const user = { id: "11111111-1111-4111-8111-111111111111", email: "owner@example.invalid", email_confirmed_at: options.confirmed === false ? null : "2026-11-12T00:00:00Z", app_metadata: {} };
  const database = {
    from: (table: string) => {
      events.push(["table", table]);
      const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: options.approved === false ? null : { id: "synthetic-partner", user_id: user.id, email: user.email, role: "admin", status: "active" }, error: null }) };
      return query;
    },
    auth: { admin: { listUsers: async () => { events.push("directory"); return { data: { users: [user] }, error: null }; }, getUserById: async (id: string) => { assert.equal(id, user.id); events.push("getUserById"); return { data: { user }, error: null }; } } },
  };
  const client = { auth: {
    getUser: async () => { events.push("existing-session"); return { data: { user: options.existing ? user : null }, error: options.sessionError ? { name: "AuthRetryableFetchError" } : options.missingSession ? { name: "AuthSessionMissingError" } : null }; },
    verifyOtp: async (params: unknown) => { events.push(["verify", params]); return { data: { user, session: options.providerError ? null : { access_token: "SYNTHETIC-ONLY" } }, error: options.providerError ? { message: "Private provider details" } : null }; },
    signOut: async () => { events.push("signout"); return { error: null }; },
  } };
  const exports = {} as Adapter;
  const mocks: Record<string, unknown> = {
    "server-only": {},
    "@supabase/supabase-js": {
      createClient: (_url: string, _anon: string, configuration: unknown) => {
        events.push(["stateless-client", configuration]);
        return { auth: {
          signInWithOtp: async (params: unknown) => {
            events.push(["otp-send", params]);
            return { error: options.providerError ? { message: "Private provider details" } : null };
          },
        } };
      },
    },
    "@/lib/supabase/server": { administratorRolesEnabled: () => false, createAdminSupabaseClient: () => database, createServerSupabaseClient: async () => client, hasAdministratorAccess: async () => true, isAdminEmail: (email: string) => email === user.email, adminMustChangePassword: () => false },
    "@/lib/admin-management/core": { isActiveAdministrator: () => true }, "@/lib/referrals/config": { getSiteUrl: () => "https://steadystart.example.invalid" },
    "@/lib/referrals/server": { rateLimit: () => true }, "@/lib/referrals/partner-access": { partnerMustChangePassword: () => false },
    "./core": { ...core, emailLinksEnabled: () => options.enabled !== false },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync("lib/portal-auth/server.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    module: { exports }, exports, process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "SYNTHETIC-ANON-NOT-A-CREDENTIAL" } },
    require: (name: string) => { if (name in mocks) return mocks[name]; throw Error("Unexpected dependency " + name); },
  });
  return { adapter: exports, events, user };
}
test("server adapter uses existing confirmed Auth UUID and Supabase OTP with shouldCreateUser=false, never Resend", async () => {
  const f = fixture(); assert.equal(await f.adapter.sendPortalEmailLink(f.user.email, "admin"), core.emailLinkMessage);
  const sent = f.events.find(event => Array.isArray(event) && event[0] === "otp-send") as unknown[];
  assert.deepEqual(JSON.parse(JSON.stringify(sent[1])), { email: f.user.email, options: { shouldCreateUser: false, emailRedirectTo: "https://steadystart.example.invalid/auth/email-access?portal=admin" } });
  assert.ok(f.events.indexOf("getUserById") < f.events.indexOf(sent));
  assert.doesNotMatch(JSON.stringify(f.events), /RESEND|REFERRAL_|createUser|generateLink|updateUser/);
});
test("OFF or unconfirmed existing accounts cannot reach sending; no production dependencies are used", async () => {
  const off = fixture({ enabled: false }); await off.adapter.sendPortalEmailLink(off.user.email, "admin"); assert.deepEqual(off.events, []);
  const unconfirmed = fixture({ confirmed: false }); await unconfirmed.adapter.sendPortalEmailLink(unconfirmed.user.email, "admin"); assert.ok(!unconfirmed.events.some(event => Array.isArray(event) && event[0] === "otp-send"));
});
test("server adapter preserves an existing session and never verifies, overwrites, or signs out that account", async () => {
  const f = fixture({ existing: true }); assert.equal(await f.adapter.finishPortalEmailLink("a".repeat(64), "admin"), null);
  assert.deepEqual(f.events, ["existing-session"]);
});
test("provider session-check failures preserve cookies and cannot initiate a different account exchange", async () => {
  const failure = fixture({ sessionError: true }); assert.equal(await failure.adapter.finishPortalEmailLink("a".repeat(64), "admin"), null); assert.deepEqual(failure.events, ["existing-session"]);
  const absent = fixture({ missingSession: true }); assert.equal(await absent.adapter.finishPortalEmailLink("a".repeat(64), "admin"), "/admin"); assert.ok(absent.events.some(event => Array.isArray(event) && event[0] === "verify"));
});
test("server verifies only magiclink tokens and re-checks role from the returned confirmed user", async () => {
  const f = fixture(); assert.equal(await f.adapter.finishPortalEmailLink("a".repeat(64), "admin"), "/admin");
  const verified = f.events.find(event => Array.isArray(event) && event[0] === "verify") as unknown[];
  assert.deepEqual(JSON.parse(JSON.stringify(verified[1])), { token_hash: "a".repeat(64), type: "magiclink" });
  const wrongRole = fixture(); assert.equal(await wrongRole.adapter.finishPortalEmailLink("a".repeat(64), "partner"), null); assert.ok(wrongRole.events.includes("signout"));
  const failure = fixture({ providerError: true }); assert.equal(await failure.adapter.finishPortalEmailLink("a".repeat(64), "admin"), null); assert.ok(failure.events.includes("signout"));
});
