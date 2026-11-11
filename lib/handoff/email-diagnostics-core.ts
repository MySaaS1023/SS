import { validHandoffSender } from "./delivery-core";

const providerCodes = [
  "validation_error",
  "missing_api_key",
  "restricted_api_key",
  "invalid_api_key",
  "invalid_access",
  "rate_limit_exceeded",
  "daily_quota_exceeded",
  "monthly_quota_exceeded",
  "security_error",
  "suspended_api_key",
  "application_error",
  "internal_server_error",
  "not_found",
  "invalid_permission",
  "service_unavailable",
] as const;
export type HandoffEmailDiagnostic = {
  ok: boolean;
  outcome:
    | "ready"
    | "unauthorized"
    | "configuration_missing"
    | "invalid_key"
    | "read_scope_unavailable"
    | "inactive_key"
    | "suspended_key"
    | "provider_error"
    | "domain_not_confirmed"
    | "request_unavailable";
  httpStatus: number | null;
  errorCode: (typeof providerCodes)[number] | "unknown_provider_error" | null;
  domainStatus: "verified" | "not_verified" | "not_in_response" | "unconfirmed";
  sending: "enabled" | "disabled" | "unconfirmed";
  senderEligible: boolean;
  message: string;
};

export function unavailableEmailDiagnostic(
  outcome: HandoffEmailDiagnostic["outcome"],
  message: string,
): HandoffEmailDiagnostic {
  return {
    ok: false,
    outcome,
    httpStatus: null,
    errorCode: null,
    domainStatus: "unconfirmed",
    sending: "unconfirmed",
    senderEligible: false,
    message,
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

// Only this fixed, read-only endpoint is contacted. Credentials and provider
// bodies stay on the server; no caller-supplied URL or key is accepted by the UI.
export async function probeHandoffEmailConfiguration(
  input: {
    apiKey: string | undefined;
    sender: string | undefined;
  },
  request: typeof fetch = fetch,
): Promise<HandoffEmailDiagnostic> {
  if (!input.apiKey?.trim())
    return unavailableEmailDiagnostic(
      "configuration_missing",
      "The general RESEND_API_KEY is not configured. No message was sent.",
    );
  const sender = validHandoffSender(input.sender);
  if (!sender)
    return unavailableEmailDiagnostic(
      "configuration_missing",
      "A valid HANDOFF_FROM_EMAIL or RESEND_FROM_EMAIL sender is required. No message was sent.",
    );
  const address = sender.includes("<")
    ? sender.match(/<([^<>]+)>$/)?.[1]
    : sender;
  const senderUsesBusinessDomain =
    address?.split("@")[1]?.toLowerCase() === "steadystartco.com";
  let response: Response;
  try {
    response = await request("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        Accept: "application/json",
      },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return unavailableEmailDiagnostic(
      "request_unavailable",
      "The read-only provider request could not be completed. No message was sent; no credential value or exception details were disclosed.",
    );
  }
  let body: Record<string, unknown> | null = null;
  try {
    body = record(await response.json());
  } catch {
    /* Never return raw bodies. */
  }
  const result = unavailableEmailDiagnostic(
    "provider_error",
    "The provider response could not confirm the email configuration. No message was sent.",
  );
  result.httpStatus = response.status;
  if (!response.ok) {
    result.errorCode = providerCodes.includes(
      body?.name as (typeof providerCodes)[number],
    )
      ? (body!.name as (typeof providerCodes)[number])
      : "unknown_provider_error";
    // Known provider literals become fixed safe categories; never return a raw
    // message, even if it contains credentials or other upstream details.
    if (
      (result.errorCode === "validation_error" &&
        [400, 401].includes(response.status) &&
        body?.message === "API key is invalid") ||
      result.errorCode === "invalid_api_key" ||
      result.errorCode === "missing_api_key"
    ) {
      result.outcome = "invalid_key";
      result.message =
        "Resend rejected the general API key. Verify the existing Steady Start key in Vercel; leave referral credentials unchanged. No message was sent.";
    } else if (
      (result.errorCode === "restricted_api_key" &&
        response.status === 401 &&
        body?.message === "This API key is restricted to only send emails.") ||
      (result.errorCode === "invalid_permission" && response.status === 403)
    ) {
      result.outcome = "read_scope_unavailable";
      result.message =
        "This key cannot perform the read-only domain check. A sending-only restriction does not by itself mean email sending is denied. No message was sent.";
    } else if (
      result.errorCode === "restricted_api_key" &&
      response.status === 403 &&
      body?.message === "API key is not active"
    ) {
      result.outcome = "inactive_key";
      result.message =
        "Resend reports that the general API key is not active. Verify the existing Steady Start key in Vercel; referral credentials must remain unchanged. No message was sent.";
    } else if (result.errorCode === "suspended_api_key") {
      result.outcome = "suspended_key";
      result.message =
        "Resend reports a suspended general API key. Review it in the existing workspace. No message was sent.";
    } else if (result.errorCode === "restricted_api_key") {
      result.message =
        "Resend restricted this read-only request. The response does not confirm whether this is an inactive key or a permission restriction. Review the existing general key; no message was sent.";
    }
    return result;
  }
  if (!Array.isArray(body?.data)) return result;
  const domain = body.data
    .map(record)
    .find(
      (item) =>
        typeof item?.name === "string" &&
        item.name.toLowerCase() === "steadystartco.com",
    );
  result.errorCode = null;
  result.domainStatus = domain
    ? domain.status === "verified"
      ? "verified"
      : "not_verified"
    : body.has_more === true
      ? "unconfirmed"
      : "not_in_response";
  const sending = record(domain?.capabilities)?.sending;
  result.sending =
    sending === "enabled" || sending === "disabled" ? sending : "unconfirmed";
  result.senderEligible = Boolean(
    senderUsesBusinessDomain &&
    result.domainStatus === "verified" &&
    result.sending === "enabled",
  );
  result.ok = result.senderEligible;
  result.outcome = result.ok ? "ready" : "domain_not_confirmed";
  result.message = result.ok
    ? "The general key can read the verified Steady Start domain with sending enabled, and the configured sender uses that domain. This does not identify the key by name or confirm email acceptance. No message was sent."
    : "The response did not confirm a verified, sending-enabled Steady Start domain for the configured sender. Confirm the general key's workspace, permissions and sender before testing delivery. No message was sent.";
  return result;
}
