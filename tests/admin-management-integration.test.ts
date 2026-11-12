import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

type Membership = { role: string; status: string; user_id?: string };
type ManagementServer = {
  getAdministratorManagementContext: () => Promise<unknown>;
  loadAdministratorManagement: () => Promise<unknown>;
  changeAdministrator: (input: object) => Promise<{ ok: boolean; status: number }>;
};

function fixture(options: { enabled?: boolean; anonymous?: boolean; forced?: boolean; membership?: Membership | null; databaseError?: boolean; rpcError?: boolean } = {}) {
  const events: { operation: string; args?: unknown }[] = [];
  const actorId = "11111111-1111-4111-8111-111111111111";
  const database = {
    from(table: string) {
      events.push({ operation: "from", args: table });
      const query = {
        select: () => query, eq: () => query, order: () => query, limit: () => query,
        maybeSingle: async () => ({ data: options.membership === undefined ? { user_id: actorId, role: "super_admin", status: "active" } : options.membership, error: options.databaseError ? { message: "PRIVATE_DATABASE_DETAILS" } : null }),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve),
      };
      return query;
    },
    rpc: async (name: string, args: unknown) => { events.push({ operation: name, args }); return { error: options.rpcError ? { message: "PRIVATE_DATABASE_DETAILS" } : null }; },
  };
  const container = { exports: {} as ManagementServer };
  const source = ts.transpileModule(readFileSync("lib/admin-management/server.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    module: container, exports: container.exports,
    require: (name: string) => {
      assert.equal(name, "@/lib/supabase/server");
      return {
        administratorRolesEnabled: () => options.enabled ?? true,
        isAdminEmail: () => true,
        requireUser: async () => { events.push({ operation: "authenticate" }); return options.anonymous ? null : { id: actorId }; },
        adminMustChangePassword: () => options.forced ?? false,
        createAdminSupabaseClient: () => { events.push({ operation: "database" }); return database; },
      };
    },
  }, { filename: "lib/admin-management/server.ts" });
  return { server: container.exports, events, actorId };
}

test("disabled administrator setup cannot read identities, mutate roles or call authentication/database", async () => {
  const { server, events } = fixture({ enabled: false });
  assert.equal(await server.getAdministratorManagementContext(), null);
  assert.equal(await server.loadAdministratorManagement(), null);
  assert.equal((await server.changeAdministrator({})).status, 403);
  assert.deepEqual(events, []);
});

test("anonymous and forced-password sessions cannot read administrator memberships", async () => {
  for (const options of [{ anonymous: true }, { forced: true }]) {
    const { server, events } = fixture(options);
    assert.equal(await server.loadAdministratorManagement(), null);
    assert.deepEqual(events.map(event => event.operation), ["authenticate"]);
  }
});

test("operational administrators and failed membership lookups never load the roster, invitations or audit", async () => {
  for (const options of [{ membership: { role: "admin", status: "active" } }, { membership: null }, { databaseError: true }]) {
    const { server, events } = fixture(options);
    assert.equal(await server.loadAdministratorManagement(), null);
    assert.deepEqual(events.filter(event => event.operation === "from").map(event => event.args), ["administrator_memberships"]);
    assert.ok(!events.some(event => event.operation === "manage_administrator"));
  }
});

test("confirmed Super Admin management loads only the three dedicated administrator tables", async () => {
  const { server, events } = fixture();
  assert.ok(await server.loadAdministratorManagement());
  assert.deepEqual(events.filter(event => event.operation === "from").map(event => event.args), ["administrator_memberships", "administrator_memberships", "administrator_invitations", "administrator_audit"]);
  assert.ok(!events.some(event => event.operation === "manage_administrator"));
});

test("administrator changes bind the RPC actor to getUser and keep database errors private", async () => {
  const { server, events, actorId } = fixture();
  const change = { userId: "22222222-2222-4222-8222-222222222222", role: "admin", status: "disabled", version: 1, confirmation: "synthetic@example.invalid", actor: "untrusted" };
  assert.equal((await server.changeAdministrator(change)).ok, true);
  const operation = events.find(event => event.operation === "manage_administrator");
  assert.deepEqual(JSON.parse(JSON.stringify(operation?.args)), { p_actor: actorId, p_target: change.userId, p_role: "admin", p_status: "disabled", p_expected_version: 1, p_confirmation: change.confirmation });
  const rejected = fixture({ rpcError: true });
  const result = await rejected.server.changeAdministrator(change);
  assert.equal(result.status, 409);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_DATABASE_DETAILS/);
});
