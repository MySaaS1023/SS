import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function compile<T>(file: string, dependency: (name: string) => unknown): T {
  const container = { exports: {} as T };
  vm.runInNewContext(ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    module: container, exports: container.exports, require: dependency,
  }, { filename: file });
  return container.exports;
}
function pages(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? pages(path.join(folder, entry.name)) : entry.name === "page.tsx" ? [path.join(folder, entry.name)] : []);
}

test("every private admin page and record renderer awaits its own authorization before params, queries or serialization", async () => {
  const targets = [
    ...pages("app/admin/(protected)").map(file => [file, "default"]),
    ...["applications", "partners", "referrals", "commissions"].map((name, index) => [`components/admin/referral-records/${name}.tsx`, ["ApplicationRecords", "PartnerRecords", "ReferralRecords", "CommissionRecords"][index]]),
  ];
  assert.equal(targets.length, 19);
  for (const [file, exported] of targets) for (const state of ["anonymous", "partner", "forced-password"]) {
    const work: string[] = [];
    const guard = async () => { work.push("guard"); throw new Error("SYNTHETIC_DENIED_" + state); };
    const loaded = compile<Record<string, (props: unknown) => Promise<unknown>>>(file, name => {
      if (name === "@/lib/admin-management/private-page") return { requirePrivateAdministrator: guard };
      return new Proxy({}, { get: (_, member) => () => { work.push(name + ":" + String(member)); throw new Error("Private work before authorization"); } });
    });
    const params = { then: () => { work.push("params"); throw new Error("Params awaited before authorization"); } };
    await assert.rejects(() => loaded[exported]({ searchParams: params, params }), /SYNTHETIC_DENIED/, file);
    assert.deepEqual(work, ["guard"], file);
  }
});

test("all private partner pages, layout and navigation deny before private reads or client-prop serialization", async () => {
  const targets = [...pages("app/partner/(portal)").map(file => [file, "default"]), ["app/partner/(portal)/layout.tsx", "default"], ["components/referrals/partner-nav.tsx", "PartnerNav"]];
  assert.equal(targets.length, 9);
  for (const [file, exported] of targets) for (const state of ["anonymous", "admin", "forced-password"]) {
    const work: string[] = [];
    const loaded = compile<Record<string, (props: unknown) => Promise<unknown>>>(file, name => {
      if (name === "@/lib/referrals/partner-record-access") return { requirePartnerRecordAccess: async () => { work.push("guard"); throw new Error("SYNTHETIC_DENIED_" + state); } };
      return new Proxy({}, { get: (_, member) => () => { work.push(name + ":" + String(member)); throw new Error("Private work before authorization"); } });
    });
    await assert.rejects(() => loaded[exported]({ children: "synthetic", searchParams: Promise.resolve({}) }), /SYNTHETIC_DENIED/, file);
    assert.deepEqual(work, ["guard"], file);
  }
});

test("actual admin boundary fails closed for missing/error, partner and forced-password identities before private queries", async () => {
  for (const state of ["anonymous", "error", "partner", "forced-password"]) {
    const events: string[] = [];
    const boundary = compile<{ requirePrivateAdministrator: () => Promise<unknown> }>("lib/admin-management/private-page.ts", name => {
      if (name === "server-only") return {};
      if (name === "react") return { cache: (fn: unknown) => fn };
      if (name === "next/navigation") return { redirect: (destination: string) => { throw new Error("REDIRECT " + destination); } };
      if (name === "@/lib/supabase/server") return {
        getAdminAccessState: async () => { if (state === "error") throw new Error("Synthetic unavailable"); return state === "forced-password" ? { user: { id: "synthetic-admin" }, mustChangePassword: true } : null; },
        getUserReferralRole: async () => state === "partner" ? "partner" : null,
        createAdminSupabaseClient: () => { events.push("PRIVATE_DATABASE"); throw new Error("Unexpected private read"); },
      };
      throw new Error("Unexpected dependency " + name);
    });
    await assert.rejects(() => boundary.requirePrivateAdministrator(), state === "partner" ? /REDIRECT \/partner/ : state === "forced-password" ? /REDIRECT \/admin\/change-password/ : /REDIRECT \/admin\/login/);
    assert.deepEqual(events, []);
  }
});
