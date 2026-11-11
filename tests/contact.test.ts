import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContactForm } from "../components/contact-form";
import {
  ContactValidationError,
  createContactDispatcher,
  validateContact,
  type ContactProviderOutcome,
} from "../lib/contact/core";
import { handleContactRequest } from "../lib/contact/http";
import {
  contactMessage,
  contactSender,
  createContactProvider,
} from "../lib/contact/provider";
import { contactProjectTypes } from "../lib/contact/shared";
import { serviceOfferings, supportEmail } from "../lib/site-data";

const details = {
  fullName: "Synthetic Contact QA",
  email: "synthetic@example.invalid",
  projectType: "standard-website",
  message: "This is a synthetic contact message for isolated tests only.",
};
const origin = "https://www.steadystartco.com";
const sender = "Steady Start LLC <support@steadystartco.com>";
const fakeKey = "re_synthetic_contact_tests_only";
const request = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(origin + "/api/contact", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

test("contact validates and normalizes the exact four customer fields", () => {
  assert.deepEqual(
    validateContact({
      ...details,
      fullName: "  Synthetic Contact QA ",
      email: " SYNTHETIC@EXAMPLE.INVALID ",
    }),
    details,
  );
  assert.deepEqual(
    contactProjectTypes.slice(0, -1).map((v) => v.value),
    serviceOfferings.map((v) => v.key),
  );
});

test("contact rejects missing, invalid, oversized and header-injection input", () => {
  for (const input of [
    null,
    [],
    {},
    { ...details, fullName: "x" },
    { ...details, fullName: "x".repeat(101) },
    { ...details, fullName: "QA\r\nBcc: victim@example.invalid" },
    { ...details, email: "not-email" },
    { ...details, email: "qa@example.invalid\r\nBcc: other@example.invalid" },
    { ...details, email: "qa@exa..mple.invalid" },
    { ...details, email: ".qa@example.invalid" },
    { ...details, email: "qa.@example.invalid" },
    { ...details, email: "qa@business.-example.invalid" },
    { ...details, email: "x".repeat(255) + "@example.invalid" },
    { ...details, projectType: "invented-service" },
    { ...details, message: "short" },
    { ...details, message: "x".repeat(4001) },
    { ...details, message: "message with\u0000null" },
  ])
    assert.throws(() => validateContact(input), ContactValidationError);
});

test("contact email HTML escapes user content and keeps fixed project-based subject", () => {
  const message = contactMessage({
    ...details,
    fullName: "QA <script>alert(1)</script>",
    message: "<img src=x onerror=alert(1)> & quotes ' \"",
  });
  assert.doesNotMatch(message.html, /<script>|<img/);
  assert.match(message.html, /&lt;script&gt;/);
  assert.match(message.html, /&amp;/);
  assert.match(
    message.subject,
    /^Steady Start Contact — Standard Website Package$/,
  );
  assert.ok(!message.subject.includes("script"));
});

test("contact only accepts existing Steady Start domain senders", () => {
  assert.equal(contactSender(sender), sender);
  assert.equal(
    contactSender("support@steadystartco.com"),
    "support@steadystartco.com",
  );
  for (const invalid of [
    undefined,
    "",
    "other@another-company.com",
    "Steady Start <onboarding@resend.dev>",
    "support@steadystartco.com.attacker.invalid",
    sender + "\r\nBcc: victim@example.invalid",
  ])
    assert.equal(contactSender(invalid), null);
});

test("unconfigured contact never reaches a provider or claims success", async () => {
  let calls = 0;
  const provider = createContactProvider({
    apiKey: undefined,
    sender,
    fetch: (async () => {
      calls++;
      throw new Error();
    }) as typeof fetch,
  });
  assert.deepEqual(await provider(details), { status: "unavailable" });
  const noSender = createContactProvider({
    apiKey: fakeKey,
    sender: undefined,
    fetch: (async () => {
      calls++;
      throw new Error();
    }) as typeof fetch,
  });
  assert.deepEqual(await noSender(details), { status: "unavailable" });
  assert.equal(calls, 0);
});

test("contact fixes provider URL, sender, recipient and safe reply-to with deterministic idempotency", async () => {
  const records: { key: string; body: Record<string, unknown> }[] = [];
  const mock = (async (url, init) => {
    assert.equal(url, "https://api.resend.com/emails");
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    assert.ok(init?.signal);
    const headers = new Headers(init?.headers);
    const key = headers.get("Idempotency-Key")!;
    assert.match(key, /^steady-start\/contact\/[0-9a-f]{64}$/);
    assert.ok(!key.includes(details.email));
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body.to, [supportEmail]);
    assert.equal(body.from, sender);
    assert.equal(body.reply_to, details.email);
    records.push({ key, body });
    return Response.json({ id: "synthetic-provider-accepted-id" });
  }) as typeof fetch;
  for (let instance = 0; instance < 2; instance++) {
    const provider = createContactProvider({
      apiKey: fakeKey,
      sender,
      fetch: mock,
    });
    assert.equal(
      (
        await provider({
          ...details,
          to: "victim@example.invalid",
          from: "attacker@example.invalid",
        } as typeof details)
      ).status,
      "accepted",
    );
  }
  assert.equal(records[0].key, records[1].key);
  assert.deepEqual(records[0].body, records[1].body);
});

test("provider rejection is not delivery success and never exposes raw provider data", async () => {
  for (const status of [400, 401, 403, 422]) {
    const provider = createContactProvider({
      apiKey: fakeKey,
      sender,
      fetch: (async () =>
        Response.json(
          { message: "sensitive provider response " + fakeKey },
          { status },
        )) as typeof fetch,
    });
    const result = await provider(details);
    assert.deepEqual(result, { status: "rejected" });
    assert.ok(!JSON.stringify(result).includes(fakeKey));
  }
});

test("transient, timeout, redirects and malformed acceptance remain unconfirmed", async () => {
  const mocks: (typeof fetch)[] = [
    (async () => Response.json({}, { status: 429 })) as typeof fetch,
    (async () => Response.json({}, { status: 500 })) as typeof fetch,
    (async () => Response.json({})) as typeof fetch,
    (async () => Response.json({ id: "" })) as typeof fetch,
    (async () => new Response("not json")) as typeof fetch,
    (async () => {
      throw new Error("timeout or redirect with private data");
    }) as typeof fetch,
  ];
  for (const mock of mocks)
    assert.deepEqual(
      await createContactProvider({ apiKey: fakeKey, sender, fetch: mock })(
        details,
      ),
      { status: "indeterminate" },
    );
});

test("contact dispatch atomically blocks concurrent duplicates then records acceptance", async () => {
  let calls = 0;
  let finish!: (result: ContactProviderOutcome) => void;
  const dispatch = createContactDispatcher({
    send: () => {
      calls++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const first = dispatch(details, "192.0.2.1");
  assert.equal((await dispatch(details, "192.0.2.1")).status, "pending");
  finish({ status: "accepted", id: "synthetic-accepted-id" });
  assert.equal((await first).status, "accepted");
  const duplicate = await dispatch(details, "192.0.2.2");
  assert.equal(duplicate.status, "duplicate");
  assert.match(duplicate.message, /No additional message was sent/);
  assert.equal(calls, 1);
});

test("contact does not treat missing provider ID as acceptance and blocks ambiguous retries", async () => {
  let calls = 0;
  const dispatch = createContactDispatcher({
    send: async () => {
      calls++;
      return { status: "accepted", id: "" };
    },
  });
  assert.equal((await dispatch(details, "192.0.2.1")).status, "indeterminate");
  assert.equal((await dispatch(details, "192.0.2.1")).status, "indeterminate");
  assert.equal(calls, 1);
});

test("contact rejection retry has cooldown and a maximum of two attempts", async () => {
  let time = 1_000_000,
    calls = 0;
  const dispatch = createContactDispatcher({
    now: () => time,
    send: async () => {
      calls++;
      return { status: "rejected" };
    },
  });
  assert.equal((await dispatch(details, "192.0.2.1")).status, "rejected");
  assert.equal((await dispatch(details, "192.0.2.1")).status, "rate_limited");
  time += 61_000;
  assert.equal((await dispatch(details, "192.0.2.1")).status, "rejected");
  time += 61_000;
  assert.equal((await dispatch(details, "192.0.2.1")).status, "rate_limited");
  assert.equal(calls, 2);
});

test("contact IP throttles distinct messages and expires old rate buckets", async () => {
  let time = 1_000_000,
    calls = 0;
  const dispatch = createContactDispatcher({
    now: () => time,
    send: async () => {
      calls++;
      return { status: "accepted", id: "synthetic-accepted-id" };
    },
  });
  for (let index = 0; index < 3; index++)
    assert.equal(
      (
        await dispatch(
          { ...details, message: details.message + index },
          "192.0.2.1",
        )
      ).status,
      "accepted",
    );
  assert.equal(
    (
      await dispatch(
        { ...details, message: details.message + "fourth" },
        "192.0.2.1",
      )
    ).status,
    "rate_limited",
  );
  time += 60 * 60_000 + 1;
  assert.equal(
    (
      await dispatch(
        { ...details, message: details.message + "later" },
        "192.0.2.1",
      )
    ).status,
    "accepted",
  );
  assert.equal(calls, 4);
});

test("contact global quotas and bounded storage fail closed", async () => {
  let calls = 0;
  const send = async (): Promise<ContactProviderOutcome> => {
    calls++;
    return { status: "accepted", id: "synthetic-accepted-id" };
  };
  const limited = createContactDispatcher({ capacity: 1, send });
  await limited(details, "192.0.2.1");
  assert.equal(
    (
      await limited(
        { ...details, message: details.message + "another" },
        "192.0.2.2",
      )
    ).status,
    "rate_limited",
  );
  assert.equal(calls, 1);
  const global = createContactDispatcher({ send });
  for (let index = 0; index < 30; index++)
    await global(
      { ...details, message: details.message + index },
      "192.0.2." + index,
    );
  assert.equal(
    (
      await global(
        { ...details, message: details.message + "last" },
        "198.51.100.1",
      )
    ).status,
    "rate_limited",
  );
});

test("contact HTTP rejects cross-origin, non-JSON, oversized and honeypot requests without sending", async () => {
  let calls = 0;
  const submit = async () => {
    calls++;
    return { ok: true, status: "accepted", message: "accepted" } as const;
  };
  const options = { origin, submit };
  for (const [body, headers, status] of [
    [{ ...details, website: "" }, { origin: "https://attacker.invalid" }, 403],
    [{ ...details, website: "" }, { "sec-fetch-site": "cross-site" }, 403],
    [{ ...details, website: "" }, { "Content-Type": "text/plain" }, 415],
    [{ ...details, website: "" }, { "Content-Length": "20001" }, 413],
    [{ ...details, website: "https://spam.invalid" }, {}, 400],
    [details, {}, 400],
    [{ ...details, website: "", message: "x".repeat(20_001) }, {}, 413],
  ] as [unknown, Record<string, string>, number][])
    assert.equal(
      (await handleContactRequest(request(body, headers), options)).status,
      status,
    );
  const malformed = new Request(origin + "/api/contact", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal((await handleContactRequest(malformed, options)).status, 400);
  assert.equal(calls, 0);
});

test("contact HTTP returns truthful private statuses and never reflects internal exceptions", async () => {
  for (const [result, status] of [
    [
      {
        ok: true,
        status: "accepted",
        message: "Provider accepted, inbox unconfirmed",
      },
      200,
    ],
    [{ ok: true, status: "duplicate", message: "No additional message" }, 200],
    [{ ok: false, status: "pending", message: "Pending" }, 409],
    [{ ok: false, status: "rate_limited", message: "Wait" }, 429],
    [{ ok: false, status: "rejected", message: "Not accepted" }, 503],
    [{ ok: false, status: "indeterminate", message: "Unconfirmed" }, 503],
  ] as const) {
    const response = await handleContactRequest(
      request({ ...details, website: "" }),
      { origin, submit: async () => result },
    );
    assert.equal(response.status, status);
    assert.equal(response.headers.get("Cache-Control"), "private, no-store");
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
    assert.deepEqual(await response.json(), result);
  }
  const response = await handleContactRequest(
    request({ ...details, website: "" }),
    {
      origin,
      submit: async () => {
        throw new Error(fakeKey);
      },
    },
  );
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes(fakeKey));
});

test("contact HTTP validates before provider access and normalizes unknown client addresses", async () => {
  let address = "";
  const dispatch = createContactDispatcher({
    send: async () => ({ status: "accepted", id: "synthetic-accepted-id" }),
  });
  const options = {
    origin,
    submit: async (input: unknown, client: string) => {
      address = client;
      return dispatch(input, client);
    },
  };
  const bad = await handleContactRequest(
    request({ ...details, email: "invalid", website: "" }),
    options,
  );
  assert.equal(bad.status, 400);
  const good = await handleContactRequest(
    request(
      { ...details, website: "" },
      { "x-vercel-forwarded-for": "not-an-ip" },
    ),
    options,
  );
  assert.equal(good.status, 200);
  assert.equal(address, "unknown");
});

test("contact form has four labelled required fields, no automatic sending and a dedicated endpoint", () => {
  const html = renderToStaticMarkup(React.createElement(ContactForm));
  for (const name of ["fullName", "email", "projectType", "message"])
    assert.match(html, new RegExp(`name="${name}"`));
  assert.equal((html.match(/required=""/g) || []).length, 4);
  assert.match(html, /Send Message/);
  assert.match(html, /type="submit"/);
  assert.match(html, /aria-busy="false"/);
  assert.doesNotMatch(html, /Message accepted|Inbox delivery/);
  assert.match(html, /<label[^>]+for=/);
});

test("unhydrated contact form uses POST and cannot serialize private fields into a GET URL", async () => {
  const html = renderToStaticMarkup(React.createElement(ContactForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.ok(form, "Contact form must render server-side");
  assert.match(form, /\bmethod="post"/i);
  assert.match(form, /\baction="\/api\/contact"/);
  assert.doesNotMatch(form, /\bmethod="get"/i);
  assert.match(html, /<noscript>[\s\S]*mailto:support@steadystartco\.com/);
  let sent = false;
  const nativeFallback = new Request(origin + "/api/contact", {
    method: "POST",
    headers: { origin, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ ...details, website: "" }),
  });
  const response = await handleContactRequest(nativeFallback, {
    origin,
    submit: async () => {
      sent = true;
      return { ok: true, status: "accepted", message: "accepted" };
    },
  });
  assert.equal(response.status, 415);
  assert.equal(sent, false);
  assert.ok(!nativeFallback.url.includes(details.email));
  assert.ok(!nativeFallback.url.includes("message="));
});
