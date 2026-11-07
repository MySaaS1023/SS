import assert from "node:assert/strict";
import test from "node:test";
import { randomBytes } from "node:crypto";
import {
  deliveryContentHash,
  dispatchHandoffEmail,
  validHandoffSender,
  type DeliveryRecord,
} from "../lib/handoff/delivery-core";
import { submitFeedback, validateFeedback } from "../lib/handoff/feedback";
import { handleFeedbackRequest } from "../lib/handoff/feedback-http";

const row = { id: "00000000-0000-4000-8000-000000000001" } as DeliveryRecord;
test("safe provider retries use stable operation key and only accepted ID means accepted", async () => {
  const keys: string[] = [];
  let outcome = "";
  const deps = {
    claim: async () => ({ claimed: true, attempt: row, claimToken: "claim" }),
    send: async (key: string) => {
      keys.push(key);
      return {};
    },
    complete: async (_id: string, _claim: string, status: string) => {
      outcome = status;
    },
  };
  assert.equal((await dispatchHandoffEmail(deps)).status, "indeterminate");
  assert.equal(outcome, "indeterminate");
  assert.equal(
    (
      await dispatchHandoffEmail({
        ...deps,
        send: async (key) => {
          keys.push(key);
          return { id: "provider-1" };
        },
      })
    ).status,
    "accepted",
  );
  assert.equal(keys[0], keys[1]);
});
test("duplicates, cooldown and legacy unknown outcomes never call provider", async () => {
  let sends = 0;
  for (const reason of ["complete", "busy", "legacy", "expired"]) {
    await dispatchHandoffEmail({
      claim: async () => ({ claimed: false, reason }),
      send: async () => {
        sends++;
        return { id: "bad" };
      },
      complete: async () => {
        throw Error("Unexpected completion");
      },
    });
  }
  assert.equal(sends, 0);
});
test("ledger completion failure is not misrepresented as provider rejection", async () => {
  let sends = 0;
  await assert.rejects(() =>
    dispatchHandoffEmail({
      claim: async () => ({ claimed: true, attempt: row, claimToken: "claim" }),
      send: async () => {
        sends++;
        return { id: "provider-accepted" };
      },
      complete: async () => {
        throw Error("ledger failed");
      },
    }),
  );
  assert.equal(sends, 1);
});
test("sender requires real configured address and content hash stays compatible with legacy sends", () => {
  assert.equal(validHandoffSender(undefined), null);
  assert.equal(
    validHandoffSender("Steady Start <onboarding@resend.dev>"),
    null,
  );
  assert.equal(validHandoffSender("x@example.com\nBcc:y@example.com"), null);
  assert.equal(
    validHandoffSender("Steady Start <support@example.com>"),
    "Steady Start <support@example.com>",
  );
  assert.equal(deliveryContentHash("subject", "text").length, 64);
});
test("private feedback validates bounds, honeypot, duplicate and rate behavior", async () => {
  for (const input of [
    { rating: 0 },
    { rating: 6 },
    { rating: 1.1 },
    { rating: "5" },
    { rating: 3, comment: "x".repeat(1001) },
  ])
    assert.throws(() => validateFeedback(input));
  const token = randomBytes(32).toString("base64url");
  let saved = 0;
  let allowed = true;
  const deps = {
    token,
    details: { rating: 4, comment: " Honest feedback " },
    address: "127.0.0.1",
    key: "ab".repeat(32),
    consume: async () => allowed,
    save: async () => {
      saved++;
      return saved === 1 ? ("accepted" as const) : ("duplicate" as const);
    },
  };
  assert.equal(await submitFeedback(deps), "accepted");
  assert.equal(await submitFeedback(deps), "duplicate");
  allowed = false;
  assert.equal(await submitFeedback(deps), "rate_limited");
  assert.equal(saved, 2);
  assert.equal(
    await submitFeedback({ ...deps, details: { rating: 4, website: "bot" } }),
    "accepted",
  );
  assert.equal(saved, 2);
});
test("feedback HTTP rejects cross-origin, malformed tokens and oversized bodies before storage", async () => {
  let writes = 0;
  const options = {
    origin: "https://www.steadystartco.com",
    submit: async () => {
      writes++;
      return "accepted" as const;
    },
  };
  const request = (body: string, origin = options.origin) =>
    new Request(options.origin + "/api/handoff/feedback", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body,
    });
  assert.equal(
    (
      await handleFeedbackRequest(
        request("{}", "https://untrusted.example"),
        options,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handleFeedbackRequest(
        request(JSON.stringify({ token: "bad", rating: 5 })),
        options,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await handleFeedbackRequest(
        request(JSON.stringify({ comment: "x".repeat(5000) })),
        options,
      )
    ).status,
    413,
  );
  assert.equal(writes, 0);
});
