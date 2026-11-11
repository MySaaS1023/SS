import assert from "node:assert/strict";
import Module, { createRequire } from "node:module";
import test from "node:test";
import { probeHandoffEmailConfiguration } from "../lib/handoff/email-diagnostics-core";

const input = {
  apiKey: " synthetic-general-key ",
  sender: "Steady Start LLC <support@steadystartco.com>",
};
const domain = {
  name: "steadystartco.com",
  status: "verified",
  capabilities: { sending: "enabled" },
};
function response(body: unknown, status = 200): typeof fetch {
  return async () => Response.json(body, { status });
}

test("configuration check makes only the fixed non-sending GET with unchanged general credential", async () => {
  let calls = 0;
  const result = await probeHandoffEmailConfiguration(
    input,
    async (url, options) => {
      calls++;
      assert.equal(url, "https://api.resend.com/domains");
      assert.equal(options?.method, "GET");
      assert.equal(options?.redirect, "error");
      assert.equal(options?.cache, "no-store");
      assert.equal(
        (options?.headers as Record<string, string>).Authorization,
        `Bearer ${input.apiKey}`,
      );
      assert.ok(options?.signal instanceof AbortSignal);
      assert.equal(options?.body, undefined);
      return Response.json({ data: [domain] });
    },
  );
  assert.equal(calls, 1);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.outcome, "ready");
  assert.equal(result.senderEligible, true);
  assert.equal(result.errorCode, null);
  assert.doesNotMatch(JSON.stringify(result), /synthetic-general-key/);
  assert.match(result.message, /does not identify the key by name/);
});

test("actual provider status and fixed invalid-key literal survive without raw messages", async () => {
  for (const status of [400, 401]) {
    const result = await probeHandoffEmailConfiguration(
      input,
      response(
        { name: "validation_error", message: "API key is invalid" },
        status,
      ),
    );
    assert.equal(result.httpStatus, status);
    assert.equal(result.errorCode, "validation_error");
    assert.equal(result.outcome, "invalid_key");
    assert.equal(result.senderEligible, false);
    assert.doesNotMatch(JSON.stringify(result), /API key is invalid/);
  }
});

test("sending-only read restriction differs from an inactive key", async () => {
  const readOnly = await probeHandoffEmailConfiguration(
    input,
    response(
      {
        name: "restricted_api_key",
        message: "This API key is restricted to only send emails.",
      },
      401,
    ),
  );
  assert.equal(readOnly.outcome, "read_scope_unavailable");
  assert.equal(readOnly.httpStatus, 401);
  assert.match(
    readOnly.message,
    /does not by itself mean email sending is denied/,
  );
  const permission = await probeHandoffEmailConfiguration(
    input,
    response(
      { name: "invalid_permission", message: "untrusted permission detail" },
      403,
    ),
  );
  assert.equal(permission.outcome, "read_scope_unavailable");
  assert.equal(permission.errorCode, "invalid_permission");
  assert.doesNotMatch(
    JSON.stringify(permission),
    /untrusted permission detail/,
  );
  const inactive = await probeHandoffEmailConfiguration(
    input,
    response(
      { name: "restricted_api_key", message: "API key is not active" },
      403,
    ),
  );
  assert.equal(inactive.outcome, "inactive_key");
  assert.equal(inactive.httpStatus, 403);
  const suspended = await probeHandoffEmailConfiguration(
    input,
    response(
      { name: "suspended_api_key", message: "untrusted upstream details" },
      403,
    ),
  );
  assert.equal(suspended.outcome, "suspended_key");
  assert.doesNotMatch(JSON.stringify(suspended), /untrusted upstream details/);
});

test("unknown errors and messages cannot become credential conclusions or leak data", async () => {
  const secret = "SYNTHETIC_SECRET_DO_NOT_RETURN";
  const malformed = await probeHandoffEmailConfiguration(
    input,
    response(
      { name: secret, message: secret, headers: { authorization: secret } },
      422,
    ),
  );
  assert.equal(malformed.httpStatus, 422);
  assert.equal(malformed.errorCode, "unknown_provider_error");
  assert.equal(malformed.outcome, "provider_error");
  assert.doesNotMatch(
    JSON.stringify(malformed),
    /SYNTHETIC_SECRET_DO_NOT_RETURN/,
  );
  const generic = await probeHandoffEmailConfiguration(
    input,
    response({ name: "validation_error", message: secret }, 400),
  );
  assert.equal(generic.outcome, "provider_error");
  assert.doesNotMatch(
    JSON.stringify(generic),
    /SYNTHETIC_SECRET_DO_NOT_RETURN/,
  );
  const restricted = await probeHandoffEmailConfiguration(
    input,
    response({ name: "restricted_api_key", message: "some other reason" }, 403),
  );
  assert.equal(restricted.outcome, "provider_error");
});

test("domain verification requires explicit sending capability and matching sender domain", async () => {
  for (const candidate of [
    { ...domain, status: "pending" },
    { ...domain, capabilities: { sending: "disabled" } },
    { name: domain.name, status: "verified" },
  ]) {
    const result = await probeHandoffEmailConfiguration(
      input,
      response({ data: [candidate] }),
    );
    assert.equal(result.ok, false);
    assert.equal(result.senderEligible, false);
  }
  const foreignSender = await probeHandoffEmailConfiguration(
    { ...input, sender: "Business <owner@example.com>" },
    response({ data: [domain] }),
  );
  assert.equal(foreignSender.senderEligible, false);
  const missing = await probeHandoffEmailConfiguration(
    input,
    response({ data: [], has_more: false }),
  );
  assert.equal(missing.domainStatus, "not_in_response");
  const paginated = await probeHandoffEmailConfiguration(
    input,
    response({ data: [], has_more: true }),
  );
  assert.equal(paginated.domainStatus, "unconfirmed");
});

test("unavailable or malformed responses retain only safe HTTP metadata", async () => {
  const notJson = await probeHandoffEmailConfiguration(
    input,
    async () => new Response("SYNTHETIC_SECRET_RESPONSE", { status: 502 }),
  );
  assert.equal(notJson.httpStatus, 502);
  assert.equal(notJson.errorCode, "unknown_provider_error");
  assert.doesNotMatch(JSON.stringify(notJson), /SYNTHETIC_SECRET_RESPONSE/);
  const thrown = await probeHandoffEmailConfiguration(input, async () => {
    throw new Error("SYNTHETIC_SECRET_EXCEPTION");
  });
  assert.equal(thrown.httpStatus, null);
  assert.equal(thrown.outcome, "request_unavailable");
  assert.doesNotMatch(JSON.stringify(thrown), /SYNTHETIC_SECRET_EXCEPTION/);
});

test("missing general credentials and invalid sender never make a provider request", async () => {
  let calls = 0;
  const request: typeof fetch = async () => {
    calls++;
    throw new Error("must not fetch");
  };
  assert.equal(
    (
      await probeHandoffEmailConfiguration(
        { ...input, apiKey: undefined },
        request,
      )
    ).outcome,
    "configuration_missing",
  );
  assert.equal(
    (
      await probeHandoffEmailConfiguration(
        { ...input, sender: "onboarding@resend.dev" },
        request,
      )
    ).outcome,
    "configuration_missing",
  );
  assert.equal(calls, 0);
});

test("real server wrapper authorizes before any fetch and never falls back to referral credentials", async () => {
  const localRequire = createRequire(
    `${process.cwd()}/tests/handoff-email-diagnostics.test.ts`,
  );
  const loader = Module as unknown as {
    _load: (request: string, parent: unknown, main: boolean) => unknown;
  };
  const original = loader._load;
  const filename = "../lib/handoff/email-diagnostics";
  const resolved = localRequire.resolve(filename);
  const cached = localRequire.cache[resolved];
  const nativeFetch = global.fetch;
  const previous = {
    key: process.env.RESEND_API_KEY,
    sender: process.env.HANDOFF_FROM_EMAIL,
    referral: process.env.REFERRAL_RESEND_API_KEY,
  };
  let authorized = false;
  let calls = 0;
  loader._load = (request, parent, main) =>
    request === "server-only"
      ? {}
      : request === "@/lib/supabase/server"
        ? {
            getFullyAuthorizedAdminUser: async () =>
              authorized ? { id: "synthetic-admin" } : null,
          }
        : original(request, parent, main);
  delete localRequire.cache[resolved];
  process.env.RESEND_API_KEY = "synthetic-general-key";
  process.env.HANDOFF_FROM_EMAIL = input.sender;
  process.env.REFERRAL_RESEND_API_KEY = "synthetic-referral-key-never-use";
  global.fetch = async (_url, options) => {
    calls++;
    assert.equal(
      (options?.headers as Record<string, string>).Authorization,
      "Bearer synthetic-general-key",
    );
    return Response.json({ data: [domain] });
  };
  try {
    const { checkHandoffEmailConfiguration } = localRequire(
      filename,
    ) as typeof import("../lib/handoff/email-diagnostics");
    const denied = await checkHandoffEmailConfiguration();
    assert.equal(denied.outcome, "unauthorized");
    assert.equal(denied.httpStatus, null);
    assert.equal(calls, 0);
    authorized = true;
    assert.equal((await checkHandoffEmailConfiguration()).outcome, "ready");
    assert.equal(calls, 1);
    delete process.env.RESEND_API_KEY;
    assert.equal(
      (await checkHandoffEmailConfiguration()).outcome,
      "configuration_missing",
    );
    assert.equal(calls, 1);
  } finally {
    loader._load = original;
    global.fetch = nativeFetch;
    delete localRequire.cache[resolved];
    if (cached) localRequire.cache[resolved] = cached;
    for (const [name, value] of Object.entries({
      RESEND_API_KEY: previous.key,
      HANDOFF_FROM_EMAIL: previous.sender,
      REFERRAL_RESEND_API_KEY: previous.referral,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
