import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import test from "node:test";

const localRequire = createRequire(
  `${process.cwd()}/tests/handoff-delivery-status.test.ts`,
);
const loader = Module as unknown as {
  _load: (request: string, parent: unknown, main: boolean) => unknown;
};
type Actions = Pick<
  typeof import("../app/admin/(protected)/handoffs/actions"),
  "refreshHandoffDeliveryAction"
>;

test("handoff status refresh preserves provider outcomes without sending another email", async (t) => {
  const filename = "../app/admin/(protected)/handoffs/actions";
  const resolved = localRequire.resolve(filename);
  const previous = localRequire.cache[resolved];
  const originalLoad = loader._load;
  const revalidated: string[] = [];
  let providerStatus = "accepted";
  let statusError: Error | null = null;
  let sends = 0;
  const mocks: Record<string, unknown> = {
    "next/cache": {
      revalidatePath: (path: string) => revalidated.push(path),
    },
    "@/lib/handoff/server": {},
    "@/lib/handoff/clients": {},
    "@/lib/handoff/delivery": {
      refreshHandoffEmailDelivery: async (id: string) => {
        assert.equal(id, "00000000-0000-4000-8000-000000000001");
        if (statusError) throw statusError;
        return { status: providerStatus, handoff_id: "synthetic-handoff" };
      },
      sendHandoffEmail: async () => {
        sends++;
        throw new Error("Status refresh must never send an email");
      },
    },
  };
  delete localRequire.cache[resolved];
  loader._load = (request, parent, main) =>
    request in mocks ? mocks[request] : originalLoad(request, parent, main);
  try {
    const { refreshHandoffDeliveryAction } = localRequire(filename) as Actions;
    const refresh = () => {
      revalidated.length = 0;
      const form = new FormData();
      form.set("deliveryId", "00000000-0000-4000-8000-000000000001");
      return refreshHandoffDeliveryAction(
        { ok: false, status: "idle", message: "" },
        form,
      );
    };
    const expectedRevalidation = [
      "/admin/handoffs",
      "/admin/handoffs/synthetic-handoff/preview",
    ];

    await t.test(
      "provider rejection is a failed action, not acceptance",
      async () => {
        providerStatus = "delivery_failed";
        const result = await refresh();
        assert.equal(result.ok, false);
        assert.equal(result.status, "failed");
        assert.match(result.message, /provider reports a delivery failure/i);
        assert.match(result.message, /No duplicate message was sent/);
        assert.deepEqual(revalidated, expectedRevalidation);
      },
    );

    await t.test(
      "accepted remains distinct from confirmed delivery",
      async () => {
        providerStatus = "accepted";
        const result = await refresh();
        assert.equal(result.ok, true);
        assert.equal(result.status, "accepted");
        assert.match(result.message, /inbox delivery is not confirmed yet/i);
        assert.deepEqual(revalidated, expectedRevalidation);
      },
    );

    await t.test(
      "delivered requires the provider-confirmed outcome",
      async () => {
        providerStatus = "delivered";
        const result = await refresh();
        assert.equal(result.ok, true);
        assert.equal(result.status, "delivered");
        assert.match(result.message, /provider confirms delivery/i);
        assert.deepEqual(revalidated, expectedRevalidation);
      },
    );

    await t.test(
      "status lookup errors fail closed without exposing provider details",
      async () => {
        statusError = new Error("synthetic sensitive provider detail");
        const result = await refresh();
        assert.equal(result.ok, false);
        assert.equal(result.status, "failed");
        assert.match(result.message, /Provider status is unavailable/);
        assert.doesNotMatch(
          result.message,
          /synthetic sensitive provider detail/,
        );
        assert.deepEqual(revalidated, []);
      },
    );
    assert.equal(sends, 0);
  } finally {
    loader._load = originalLoad;
    delete localRequire.cache[resolved];
    if (previous) localRequire.cache[resolved] = previous;
  }
});
