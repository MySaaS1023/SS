import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

function notesFixture(options: { authorized?: boolean; readError?: boolean; updateError?: boolean } = {}) {
  const events: { operation: string; args?: unknown }[] = [];
  const id = "11111111-1111-4111-8111-111111111111";
  const before = { id, internal_notes: "Previous synthetic notes" };
  const query = {
    select: () => query,
    eq: (field: string, value: string) => { events.push({ operation: "filter", args: [field, value] }); return query; },
    single: async () => ({ data: options.readError ? null : before, error: options.readError ? { message: "PRIVATE_DATABASE_ERROR" } : null }),
    update: (value: unknown) => { events.push({ operation: "update", args: value }); return query; },
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: options.updateError ? { message: "PRIVATE_DATABASE_ERROR" } : null }).then(resolve),
  };
  const database = { from: (table: string) => { events.push({ operation: "table", args: table }); return query; } };
  const exports = {} as { savePartnerNotes: (form: FormData) => Promise<void> };
  const source = ts.transpileModule(readFileSync("app/admin/(protected)/referral-program/actions.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {
    exports, module: { exports },
    require: (name: string) => {
      if (name === "next/cache") return { revalidatePath: (...args: unknown[]) => { events.push({ operation: "revalidate", args }); } };
      if (name === "@/lib/supabase/server") return { getFullyAuthorizedAdminUser: async () => options.authorized === false ? null : { id: "authenticated-admin" }, createAdminSupabaseClient: () => { events.push({ operation: "database" }); return database; } };
      if (name === "@/lib/referrals/server") return { normalizeText: (value: unknown, cap: number) => typeof value === "string" ? value.trim().slice(0, cap) : "", writeAudit: async (entry: unknown) => { events.push({ operation: "audit", args: entry }); } };
      return new Proxy({}, { get: () => () => { events.push({ operation: "forbidden-auth-or-provider-call" }); throw new Error("Unexpected dependency during note-only update"); } });
    },
  }, { filename: "app/admin/(protected)/referral-program/actions.ts" });
  return { save: exports.savePartnerNotes, events, id, before };
}

test("unauthorized partner-note action cannot read or mutate a partner or contact a provider", async () => {
  const fixture = notesFixture({ authorized: false });
  await assert.rejects(() => fixture.save(new FormData()), /Administrator access required/);
  assert.deepEqual(fixture.events, []);
});

test("saving partner notes cannot change account status, Auth credentials, contact fields or the stable representative ID", async () => {
  const fixture = notesFixture();
  const form = new FormData();
  form.set("id", fixture.id);
  form.set("notes", "n".repeat(4100));
  for (const name of ["status", "email", "phone", "referral_code", "password", "actorUserId"]) form.set(name, "untrusted");
  await fixture.save(form);
  const updates = fixture.events.filter(event => event.operation === "update");
  assert.equal(updates.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(updates[0].args)), { internal_notes: "n".repeat(4000) });
  const audit = fixture.events.find(event => event.operation === "audit");
  assert.deepEqual(JSON.parse(JSON.stringify(audit?.args)), { actorUserId: "authenticated-admin", action: "partner_notes_updated", entityType: "partner", entityId: fixture.id, before: fixture.before, after: { internal_notes: "n".repeat(4000) } });
  assert.deepEqual(fixture.events.filter(event => event.operation === "revalidate").map(event => event.args), [["/admin/referral-program", "layout"]]);
  assert.ok(!fixture.events.some(event => event.operation === "forbidden-auth-or-provider-call"));
  assert.ok(fixture.events.filter(event => event.operation === "table").every(event => event.args === "referral_partners"));
});

test("missing partner or database update failure never produces a success audit or list invalidation", async () => {
  for (const options of [{ readError: true }, { updateError: true }]) {
    const fixture = notesFixture(options);
    const form = new FormData(); form.set("id", fixture.id); form.set("notes", "Synthetic update");
    await assert.rejects(() => fixture.save(form), /Partner (could not be loaded|notes could not be saved)/);
    assert.ok(!fixture.events.some(event => ["audit", "revalidate", "forbidden-auth-or-provider-call"].includes(event.operation)));
  }
});
