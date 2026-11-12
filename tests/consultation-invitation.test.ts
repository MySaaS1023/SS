import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { ConsultationShare } from "../components/scheduling/consultation-share";
import {
  createInvitationService,
  invitationRecipient,
  InvitationValidationError,
} from "../lib/scheduling/invitation-core";
import { handleInvitationRequest } from "../lib/scheduling/invitation-http";
import { consultationInvitationText } from "../lib/scheduling/invitation-shared";

const origin = "https://www.steadystartco.com";
const url = origin + "/consultation";
const recipient = "synthetic@example.invalid";
const key = "re_synthetic_invitation_tests_only";
const sender = "Steady Start LLC <support@steadystartco.com>";
const providerId = "synthetic_provider_12345";
const create = (
  fetcher?: typeof fetch,
  now?: () => number,
  apiKey: string | undefined = key,
) =>
  createInvitationService({
    apiKey: () => apiKey,
    sender: () => sender,
    bookingUrl: url,
    fetch: fetcher,
    now,
  });
const previewInput = { action: "preview", recipient };
const sendInput = (confirmationToken?: string, target = recipient) => ({
  action: "send",
  recipient: target,
  confirmed: true,
  confirmationToken,
});
const request = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(origin + "/api/admin/scheduling/invitations", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
const acceptedFetch: typeof fetch = async () =>
  Response.json({ id: providerId });

test("consultation invitation validates recipient without header injection", () => {
  assert.equal(invitationRecipient(" SYNTHETIC@EXAMPLE.INVALID "), recipient);
  for (const value of [
    null,
    "",
    "not-email",
    "qa@example.invalid\r\nBcc: other@example.invalid",
    "qa@example.invalid\n",
    ".qa@example.invalid",
    "qa.@example.invalid",
    "qa@invalid..example",
    "qa@-invalid.example",
    "a".repeat(65) + "@example.invalid",
    "qa@business.1",
    "qa @example.invalid",
  ])
    assert.throws(() => invitationRecipient(value), InvitationValidationError);
});

test("preview produces actor-bound confirmation without calling provider", async () => {
  let calls = 0;
  const submit = create(async () => {
    calls++;
    return Response.json({ id: providerId });
  });
  const result = await submit("admin-a", previewInput);
  assert.equal(result.status, "preview");
  assert.equal(result.recipient, recipient);
  assert.ok(result.confirmationToken);
  assert.equal(calls, 0);
  assert.match(result.message, /has not sent an email/);
});

test("send requires a fresh confirmed preview for the same actor and recipient", async () => {
  let time = 1000,
    calls = 0;
  const submit = create(
    async () => {
      calls++;
      return Response.json({ id: providerId });
    },
    () => time,
  );
  const preview = await submit("admin-a", previewInput);
  for (const [actor, body] of [
    ["admin-a", sendInput()],
    ["admin-b", sendInput(preview.confirmationToken)],
    ["admin-a", sendInput(preview.confirmationToken, "other@example.invalid")],
    ["admin-a", { ...sendInput(preview.confirmationToken), confirmed: false }],
    ["admin-a", sendInput(preview.confirmationToken + "tampered")],
    ["admin-a", sendInput("payload." + "é".repeat(43))],
  ] as const)
    await assert.rejects(submit(actor, body), InvitationValidationError);
  time += 15 * 60_000;
  await assert.rejects(
    submit("admin-a", sendInput(preview.confirmationToken)),
    InvitationValidationError,
  );
  assert.equal(calls, 0);
});

test("unauthorized or missing configuration never sends", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    return Response.json({ id: providerId });
  };
  assert.equal(
    (await create(fetcher)("", previewInput)).status,
    "unauthorized",
  );
  const submit = createInvitationService({
    apiKey: () => undefined,
    sender: () => sender,
    bookingUrl: url,
    fetch: fetcher,
  });
  assert.equal((await submit("admin-a", previewInput)).status, "setup");
  for (const value of [
    "onboarding@resend.dev",
    "Other <sender@unapproved.example>",
    "support@steadystartco.com\r\nX: bad",
  ])
    assert.equal(
      (
        await createInvitationService({
          apiKey: () => key,
          sender: () => value,
          bookingUrl: url,
          fetch: fetcher,
        })("admin-a", previewInput)
      ).status,
      "setup",
    );
  assert.equal(calls, 0);
});

test("explicit send uses only fixed general-provider content and records acceptance accurately", async () => {
  let calls = 0;
  const submit = create(async (endpoint, init) => {
    calls++;
    assert.equal(endpoint, "https://api.resend.com/emails");
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.from, sender);
    assert.deepEqual(body.to, [recipient]);
    assert.equal(body.reply_to, "support@steadystartco.com");
    assert.equal(body.text, consultationInvitationText(url));
    assert.match(
      new Headers(init?.headers).get("Idempotency-Key")!,
      /^steady-start\/consultation-invite\//,
    );
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer " + key,
    );
    return Response.json({ id: providerId });
  });
  const preview = await submit("admin-a", previewInput);
  const result = await submit("admin-a", sendInput(preview.confirmationToken));
  assert.equal(result.status, "accepted");
  assert.equal(result.providerId, providerId);
  assert.match(result.message, /does not confirm inbox delivery/);
  assert.equal(calls, 1);
  assert.equal(
    (await submit("admin-a", sendInput(preview.confirmationToken))).status,
    "duplicate",
  );
  assert.equal(calls, 1);
});

test("provider idempotency key and message remain stable across previews and instances", async () => {
  const keys: string[] = [],
    bodies: string[] = [];
  const fetcher: typeof fetch = async (_url, init) => {
    keys.push(new Headers(init?.headers).get("Idempotency-Key")!);
    bodies.push(String(init?.body));
    return Response.json({ id: providerId });
  };
  for (const time of [1000, 2000]) {
    const submit = create(fetcher, () => time);
    const preview = await submit("admin-a", previewInput);
    await submit("admin-a", sendInput(preview.confirmationToken));
  }
  assert.equal(keys[0], keys[1]);
  assert.equal(bodies[0], bodies[1]);
});

test("concurrent sends cannot create duplicate requests within the instance", async () => {
  let resolve!: (value: Response) => void,
    calls = 0;
  const submit = create(async () => {
    calls++;
    return new Promise<Response>((r) => {
      resolve = r;
    });
  });
  const preview = await submit("admin-a", previewInput);
  const first = submit("admin-a", sendInput(preview.confirmationToken));
  assert.equal(
    (await submit("admin-a", sendInput(preview.confirmationToken))).status,
    "pending",
  );
  resolve(Response.json({ id: providerId }));
  assert.equal((await first).status, "accepted");
  assert.equal(calls, 1);
});

test("provider rejection is honest, sanitized, and cooldown-bound", async () => {
  let time = 1000,
    calls = 0;
  const submit = create(
    async () => {
      calls++;
      return Response.json(
        {
          name: "validation_error",
          message: "SENSITIVE_RAW_PROVIDER_RESPONSE",
        },
        { status: 400 },
      );
    },
    () => time,
  );
  const preview = await submit("admin-a", previewInput);
  const result = await submit("admin-a", sendInput(preview.confirmationToken));
  assert.equal(result.status, "rejected");
  assert.equal(result.ok, false);
  assert.match(result.message, /Copy Consultation Link/);
  assert.doesNotMatch(JSON.stringify(result), /SENSITIVE_RAW|re_synthetic/);
  assert.equal(
    (await submit("admin-a", sendInput(preview.confirmationToken))).status,
    "limited",
  );
  assert.equal(calls, 1);
  time += 60_000;
  assert.equal(
    (await submit("admin-a", sendInput(preview.confirmationToken))).status,
    "rejected",
  );
});

test("ambiguous provider outcomes never report acceptance and block automatic retries", async () => {
  for (const fetcher of [
    async () => Response.json({ id: providerId }, { status: 500 }),
    async () => Response.json({}),
    async () => {
      throw new Error("RAW_SECRET_EXCEPTION");
    },
  ]) {
    let calls = 0;
    const submit = create(async () => {
      calls++;
      return fetcher();
    });
    const preview = await submit("admin-a", previewInput);
    const result = await submit(
      "admin-a",
      sendInput(preview.confirmationToken),
    );
    assert.equal(result.status, "indeterminate");
    assert.equal(result.ok, false);
    assert.equal(
      (await submit("admin-a", sendInput(preview.confirmationToken))).status,
      "indeterminate",
    );
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(result), /RAW_SECRET/);
  }
});

test("authenticated invitations have bounded per-admin sending limits", async () => {
  const submit = create(acceptedFetch);
  for (let i = 0; i < 10; i++) {
    const target = `synthetic${i}@example.invalid`;
    const preview = await submit("admin-a", {
      action: "preview",
      recipient: target,
    });
    assert.equal(
      (await submit("admin-a", sendInput(preview.confirmationToken, target)))
        .status,
      "accepted",
    );
  }
  const target = "last@example.invalid",
    preview = await submit("admin-a", { action: "preview", recipient: target });
  assert.equal(
    (await submit("admin-a", sendInput(preview.confirmationToken, target)))
      .status,
    "limited",
  );
});

test("HTTP authorization and CSRF checks run before invitation processing", async () => {
  let submissions = 0;
  const submit = async () => {
    submissions++;
    return { ok: true, status: "preview" as const, message: "Preview" };
  };
  const denied = await handleInvitationRequest(request(previewInput), {
    origin,
    authorize: async () => null,
    submit,
  });
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get("cache-control")!, /no-store/);
  for (const headers of [
    { origin: "https://attacker.example" },
    { origin: "" },
    { "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[])
    assert.equal(
      (
        await handleInvitationRequest(request(previewInput, headers), {
          origin,
          authorize: async () => ({ id: "admin-a" }),
          submit,
        })
      ).status,
      403,
    );
  assert.equal(submissions, 0);
});

test("HTTP JSON/body/malformed validation rejects before sending", async () => {
  let submissions = 0;
  const options = {
    origin,
    authorize: async () => ({ id: "admin-a" }),
    submit: async () => {
      submissions++;
      return { ok: true, status: "preview" as const, message: "Preview" };
    },
  };
  assert.equal(
    (
      await handleInvitationRequest(
        request(previewInput, { "Content-Type": "text/plain" }),
        options,
      )
    ).status,
    415,
  );
  assert.equal(
    (
      await handleInvitationRequest(
        request({ padding: "x".repeat(5000) }),
        options,
      )
    ).status,
    413,
  );
  assert.equal(
    (await handleInvitationRequest(request([]), options)).status,
    400,
  );
  assert.equal(
    (await handleInvitationRequest(request(null), options)).status,
    400,
  );
  assert.equal(submissions, 0);
});

test("HTTP validates confirmation and exposes only sanitized response states", async () => {
  const submit = create(acceptedFetch);
  const options = {
    origin,
    authorize: async () => ({ id: "admin-a" }),
    submit,
  };
  const preview = await (
    await handleInvitationRequest(request(previewInput), options)
  ).json();
  assert.equal(
    (await handleInvitationRequest(request(sendInput()), options)).status,
    400,
  );
  const response = await handleInvitationRequest(
    request(sendInput(preview.confirmationToken)),
    options,
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "accepted");
});

test("share controls preserve copy access and never send on initial rendering", () => {
  const markup = renderToStaticMarkup(
    React.createElement(ConsultationShare, {
      bookingUrl: url,
      emailConfigured: false,
    }),
  );
  for (const text of [
    "Copy Consultation Link",
    "Send Consultation Link",
    "Email setup required",
    "Review Invitation",
    "Intended recipient email address",
    url,
  ])
    assert.ok(markup.includes(text));
  assert.match(markup, /method="post"/);
  assert.match(markup, /action="\/api\/admin\/scheduling\/invitations"/);
  assert.doesNotMatch(markup, /confirmationToken|Resend accepted/);
  const copy = markup.match(
    /<button[^>]*>Copy Consultation Link<\/button>/,
  )?.[0];
  assert.ok(copy);
  assert.doesNotMatch(copy, /\sdisabled(?:=|[\s>])/);
  const source = readFileSync(
    "components/scheduling/consultation-share.tsx",
    "utf8",
  );
  assert.doesNotMatch(source, /useEffect|useActionState/);
  assert.match(source, /confirmed/);
});

test("new invitation endpoint uses full existing admin authorization and general credentials only", () => {
  const server = readFileSync("lib/scheduling/invitation-server.ts", "utf8");
  assert.match(server, /process\.env\.RESEND_API_KEY/);
  assert.match(server, /CONSULTATION_FROM_EMAIL/);
  assert.match(server, /HANDOFF_FROM_EMAIL/);
  assert.match(server, /RESEND_FROM_EMAIL/);
  assert.doesNotMatch(server, /REFERRAL_|createAdminSupabaseClient|\.rpc\(/);
  const route = readFileSync(
    "app/api/admin/scheduling/invitations/route.ts",
    "utf8",
  );
  assert.match(route, /getFullyAuthorizedAdminUser/);
  assert.match(route, /export async function POST/);
  assert.doesNotMatch(route, /export.*GET/);
});

test("HTTP authorization failures fail closed without disclosing internal errors", async () => {
  let calls = 0;
  const response = await handleInvitationRequest(request(previewInput), {
    origin,
    authorize: async () => {
      throw new Error("SENSITIVE_AUTH_ERROR");
    },
    submit: async () => {
      calls++;
      return { ok: true, status: "preview", message: "Preview" };
    },
  });
  assert.equal(response.status, 503);
  assert.equal(calls, 0);
  assert.doesNotMatch(await response.text(), /SENSITIVE_AUTH_ERROR/);
});

test("HTTP streaming body cap and malformed JSON reject before processing", async () => {
  let calls = 0;
  const options = {
    origin,
    authorize: async () => ({ id: "admin-a" }),
    submit: async () => {
      calls++;
      return { ok: true, status: "preview" as const, message: "Preview" };
    },
  };
  for (const [body, status] of [
    ["not-json", 400],
    [JSON.stringify({ padding: "x".repeat(5000) }), 413],
  ] as const) {
    const response = await handleInvitationRequest(
      new Request(origin + "/api/admin/scheduling/invitations", {
        method: "POST",
        headers: { origin, "Content-Type": "application/json", "Content-Length": "1" },
        body,
      }),
      options,
    );
    assert.equal(response.status, status);
  }
  assert.equal(calls, 0);
});
