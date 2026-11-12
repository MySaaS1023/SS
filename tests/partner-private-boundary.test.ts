import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { resolveAdministratorAccess, isActiveAdministrator } from "../lib/admin-management/core";
import { partnerMustChangePassword } from "../lib/referrals/partner-access";

function boundaryFixture(mode: "anonymous" | "admin" | "forced" | "customer" | "error" | "approved") {
  const queries: { table: string; select: string; filters: unknown[] }[] = [];
  const user = mode === "anonymous" ? null : { id: "synthetic-user", email: mode === "admin" ? "owner@example.invalid" : "partner@example.invalid", app_metadata: { must_change_password: mode === "forced" } };
  const partner = { id: "synthetic-partner", user_id: "synthetic-user", status: "approved", email: "PRIVATE_SYNTHETIC@example.invalid", payout_details_encrypted: "SYNTHETIC_CIPHERTEXT" };
  const database = { from(table: string) { const entry = { table, select: "", filters: [] as unknown[] }; queries.push(entry); const query = {
    select: (selection: string) => { entry.select = selection; return query; },
    eq: (field: string, value: unknown) => { entry.filters.push([field, value]); return query; },
    maybeSingle: async () => ({ data: mode === "approved" ? entry.select === "id,user_id,status" ? { id: partner.id, user_id: partner.user_id, status: partner.status } : partner : null, error: mode === "error" ? { message: "SYNTHETIC_QUERY_ERROR" } : null }),
  }; return query; } };
  const client = { auth: { getUser: async () => ({ data: { user }, error: null }) } };
  function load<T>(filename: string): T {
    const container = { exports: {} as T };
    vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
      module: container, exports: container.exports,
      process: { env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3145", NEXT_PUBLIC_SUPABASE_ANON_KEY: "synthetic", SUPABASE_SERVICE_ROLE_KEY: "synthetic", ADMIN_EMAILS: "owner@example.invalid" } },
      require: (name: string) => {
        if (name === "server-only") return {};
        if (name === "react") return { cache: (fn: unknown) => fn };
        if (name === "next/navigation") return { redirect: (destination: string) => { throw new Error("REDIRECT " + destination); } };
        if (name === "next/headers") return { cookies: async () => ({ getAll: () => [], set: () => {} }) };
        if (name === "@supabase/ssr") return { createServerClient: () => client };
        if (name === "@supabase/supabase-js") return { createClient: () => database };
        if (name === "@/lib/admin-management/core") return { resolveAdministratorAccess, isActiveAdministrator };
        if (name === "@/lib/referrals/partner-access") return { partnerMustChangePassword };
        if (name === "@/lib/supabase/server") return { requireUser: async () => user, hasAdministratorAccess: async () => mode === "admin", createAdminSupabaseClient: () => database };
        throw new Error("Unexpected isolated boundary dependency " + name);
      },
    }, { filename });
    return container.exports;
  }
  return { load, queries };
}

test("partner page boundary denies anonymous/admin/forced identities without queries and nonmembers without any private-column read", async () => {
  for (const mode of ["anonymous", "admin", "forced", "customer", "error"] as const) {
    const fixture = boundaryFixture(mode);
    const boundary = fixture.load<{ requirePartnerRecordAccess: () => Promise<unknown> }>("lib/referrals/partner-record-access.ts");
    await assert.rejects(() => boundary.requirePartnerRecordAccess(), /REDIRECT/);
    assert.equal(fixture.queries.length, ["customer", "error"].includes(mode) ? 1 : 0);
    assert.ok(fixture.queries.every(query => query.select === "id,user_id,status"));
  }
});

test("partner API boundary returns null before private queries for denied identities and scopes approved profiles to membership and Auth UUID", async () => {
  for (const mode of ["anonymous", "admin", "forced", "customer", "error", "approved"] as const) {
    const fixture = boundaryFixture(mode);
    const server = fixture.load<{ getFullyAuthorizedPartner: () => Promise<unknown> }>("lib/supabase/server.ts");
    const result = await server.getFullyAuthorizedPartner();
    if (mode === "approved") {
      assert.ok(result);
      assert.equal(fixture.queries.length, 2);
      assert.deepEqual(fixture.queries[1].filters, [["id", "synthetic-partner"], ["user_id", "synthetic-user"], ["status", "approved"]]);
    } else {
      assert.equal(result, null);
      assert.equal(fixture.queries.length, ["customer", "error"].includes(mode) ? 1 : 0);
      assert.ok(fixture.queries.every(query => query.select === "id,user_id,status"));
    }
  }
});
