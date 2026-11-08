import test from "node:test";
import assert from "node:assert/strict";
import {
  confirmationMessage,
  dateInZone,
  defaultSchedule,
  hash,
  rateKey,
  SchedulingError,
  validDate,
  validateBooking,
  validateSchedule,
  validateZoomUrl,
} from "../lib/scheduling/core";
import { bookingRequest } from "../lib/scheduling/http";
import { dispatchConsultationNotification } from "../lib/scheduling/notifications";
const booking = () => ({
  businessName: "Synthetic Example",
  fullName: "Synthetic Client",
  email: "synthetic@example.invalid",
  phone: "+12025550199",
  purpose: "Discuss website scope",
  startsAt: "2026-12-08T17:00:00.000Z",
  timeZone: "America/Phoenix",
  notes: "Synthetic only",
  requestKey: "12345678-1234-4234-8234-123456789abc",
});
const request = (
  body: unknown,
  origin = "https://www.steadystartco.com",
  contentType = "application/json",
) =>
  new Request("https://www.steadystartco.com/api/scheduling", {
    method: "POST",
    headers: { origin, "Content-Type": contentType },
    body: JSON.stringify(body),
  });
const endpointOptions = (
  submit: (input: unknown, address: string) => Promise<string>,
) => ({ origin: "https://www.steadystartco.com", submit });
test("booking validates contact details and excludes caller-supplied private association/status fields", () => {
  const result = validateBooking({
    ...booking(),
    email: "SYNTHETIC@EXAMPLE.INVALID",
    sourceReferralId: "private",
    status: "confirmed",
    zoomUrl: "https://zoom.us/j/123456789",
  });
  assert.equal(result.email, "synthetic@example.invalid");
  assert.equal("sourceReferralId" in result, false);
  assert.equal("status" in result, false);
  assert.equal("zoomUrl" in result, false);
});
test("booking rejects invalid email, phone, time zone, timestamp and idempotency identifiers", () => {
  for (const patch of [
    { email: "bad" },
    { phone: "123" },
    { timeZone: "Made/Up" },
    { startsAt: "2026-12-08 17:00" },
    { requestKey: "same-for-everybody" },
    { businessName: "x".repeat(121) },
    { notes: "x".repeat(1501) },
  ])
    assert.throws(
      () => validateBooking({ ...booking(), ...patch }),
      SchedulingError,
    );
});
test("schedule validates blocked dates, daily limit, quarter-hour windows and concurrent version", () => {
  assert.equal(
    validateSchedule({ ...defaultSchedule, enabled: true }).enabled,
    true,
  );
  for (const patch of [
    { days: [] },
    { startTime: "09:07" },
    { endTime: "08:00" },
    { bufferMinutes: 7 },
    { durationMinutes: 13 },
    { dailyLimit: 0 },
    { blockedDates: ["2026-02-30"] },
    { version: 0 },
  ])
    assert.throws(() => validateSchedule({ ...defaultSchedule, ...patch }));
});
test("calendar parsing and IANA conversion handle date boundaries and DST changes", () => {
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2027-02-29"), false);
  assert.equal(
    dateInZone(new Date("2026-11-08T01:00:00Z"), "America/Phoenix"),
    "2026-11-07",
  );
  const format = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(iso));
  assert.equal(format("2026-03-08T06:30:00Z"), "01:30");
  assert.equal(format("2026-03-08T07:30:00Z"), "03:30");
});
test("manual Zoom links accept real join formats and reject credentials, spoofed hosts and unrelated paths", () => {
  assert.equal(
    validateZoomUrl("https://us02web.zoom.us/j/12345678901?pwd=synthetic"),
    "https://us02web.zoom.us/j/12345678901?pwd=synthetic",
  );
  assert.equal(validateZoomUrl(""), null);
  for (const value of [
    "https://zoom.us.evil.example/j/123456789",
    "https://person:password@zoom.us/j/123456789",
    "http://zoom.us/j/123456789",
    "https://zoom.us/signin",
    "javascript:alert(1)",
    "https://zoom.us:8443/j/123456789",
  ])
    assert.throws(() => validateZoomUrl(value));
});
test("confirmation includes accurate customer time zone and only an actual provided Zoom link", () => {
  const row = {
    full_name: "Synthetic Client",
    business_name: "Synthetic Example",
    starts_at: "2026-12-08T17:00:00Z",
    customer_time_zone: "America/Phoenix",
    purpose: "Website scope",
    zoom_join_url: null,
    status: "confirmed",
  };
  const email = confirmationMessage(row);
  assert.equal(
    email.subject,
    "Your Steady Start Launch Consultation Is Confirmed",
  );
  assert.match(email.text, /10:00:00 AM/);
  assert.match(email.text, /America\/Phoenix/);
  assert.ok(!email.text.includes("Zoom meeting:"));
  assert.match(
    confirmationMessage({
      ...row,
      zoom_join_url: "https://zoom.us/j/123456789",
    }).text,
    /Zoom meeting: https:\/\/zoom.us/,
  );
  assert.ok(
    !confirmationMessage({
      ...row,
      status: "canceled",
      zoom_join_url: "https://zoom.us/j/123456789",
    }).text.includes("Zoom meeting:"),
  );
});
test("rate identifiers are keyed and domain separated without exposing contact data", () => {
  const first = rateKey("192.0.2.1", "a".repeat(64));
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, hash("192.0.2.1"));
  assert.notEqual(first, rateKey("192.0.2.1", "b".repeat(64)));
  assert.throws(() => rateKey("192.0.2.1", undefined));
});
test("cross-origin, malformed JSON and oversized submissions never reach booking storage", async () => {
  let calls = 0;
  const options = endpointOptions(async () => {
    calls++;
    return "received";
  });
  assert.equal(
    (
      await bookingRequest(
        request(booking(), "https://example.invalid"),
        options,
      )
    ).status,
    403,
  );
  assert.equal(
    (await bookingRequest(request(booking(), undefined, "text/plain"), options))
      .status,
    415,
  );
  assert.equal(
    (
      await bookingRequest(
        new Request("https://www.steadystartco.com/api/scheduling", {
          method: "POST",
          headers: {
            origin: options.origin,
            "content-type": "application/json",
          },
          body: "{",
        }),
        options,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await bookingRequest(
        request({ ...booking(), notes: "x".repeat(9000) }),
        options,
      )
    ).status,
    413,
  );
  assert.equal(calls, 0);
});
test("honeypot is silently discarded without booking or notification writes", async () => {
  let calls = 0;
  const response = await bookingRequest(
    request({ ...booking(), website: "https://spam.invalid" }),
    endpointOptions(async () => {
      calls++;
      return "received";
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(calls, 0);
});
test("successful booking response contains no customer record, meeting URL or request identifier", async () => {
  const response = await bookingRequest(
    request(booking()),
    endpointOptions(async () => "received"),
  );
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(data).sort(), ["message", "ok"]);
  assert.ok(!JSON.stringify(data).includes(booking().email));
  assert.match(data.message, /confirmed only after/);
});
test("unavailable slots and durable rate limits are reported without private records", async () => {
  assert.equal(
    (
      await bookingRequest(
        request(booking()),
        endpointOptions(async () => "unavailable"),
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await bookingRequest(
        request(booking()),
        endpointOptions(async () => "rate_limited"),
      )
    ).status,
    429,
  );
});
test("storage and configuration failures fail closed without exposing SQL or customer details", async () => {
  const response = await bookingRequest(
    request(booking()),
    endpointOptions(async () => {
      throw new SchedulingError(
        "sensitive internal database detail",
        "unavailable",
      );
    }),
  );
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("sensitive"));
});
test("email acceptance is recorded with stable provider idempotency but never claimed delivered", async () => {
  let sendCount = 0,
    key = "";
  const outcomes: unknown[] = [];
  const result = await dispatchConsultationNotification({
    claim: async () => ({
      claimed: true,
      attempt: { id: "synthetic-notification", claim_token: "claim" },
    }),
    send: async (k) => {
      sendCount++;
      key = k;
      return { id: "provider-synthetic" };
    },
    complete: async (...args) => {
      outcomes.push(args);
    },
  });
  assert.equal(sendCount, 1);
  assert.equal(key, "consultation-email/synthetic-notification");
  assert.match(result, /Inbox delivery has not been confirmed/);
  assert.deepEqual(outcomes, [
    ["synthetic-notification", "claim", "accepted", "provider-synthetic"],
  ]);
});
test("already accepted and busy notifications never call the provider", async () => {
  let sends = 0;
  for (const reason of ["complete", "busy", "reconcile", "changed"]) {
    const run = () =>
      dispatchConsultationNotification({
        claim: async () => ({ claimed: false, reason }),
        send: async () => {
          sends++;
          return { id: "unexpected" };
        },
        complete: async () => {
          throw Error("unexpected");
        },
      });
    if (reason === "complete") assert.match(await run(), /No duplicate/);
    else await assert.rejects(run);
  }
  assert.equal(sends, 0);
});
test("provider rejection and uncertain outcomes remain distinct without automatic retries", async () => {
  for (const rejected of [true, false]) {
    let calls = 0;
    let state = "";
    await dispatchConsultationNotification({
      claim: async () => ({
        claimed: true,
        attempt: { id: "one", claim_token: "claim" },
      }),
      send: async () => {
        calls++;
        if (rejected) return { rejected: true };
        throw Error("timeout");
      },
      complete: async (_id, _claim, status) => {
        state = status;
      },
    });
    assert.equal(calls, 1);
    assert.equal(state, rejected ? "failed" : "indeterminate");
  }
});
test("ledger failure after provider acceptance is not misreported as delivery failure", async () => {
  let sends = 0;
  await assert.rejects(
    () =>
      dispatchConsultationNotification({
        claim: async () => ({
          claimed: true,
          attempt: { id: "one", claim_token: "claim" },
        }),
        send: async () => {
          sends++;
          return { id: "provider-id" };
        },
        complete: async () => {
          throw Error("ledger unavailable");
        },
      }),
    /ledger unavailable/,
  );
  assert.equal(sends, 1);
});
