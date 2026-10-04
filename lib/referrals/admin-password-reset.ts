export type PasswordResetEvent =
  | "password_reset_requested"
  | "password_reset_rate_limited"
  | "password_reset_provider_failure"
  | "password_reset_configuration_error";

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

export function getAdminPasswordResetRedirect(siteUrl: string) {
  return `${siteUrl.replace(/\/$/, "")}/admin/reset-password`;
}

export function classifyPasswordResetError(
  error: AuthErrorLike,
): Exclude<PasswordResetEvent, "password_reset_requested"> {
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (
    error.status === 429 ||
    code.includes("rate_limit") ||
    message.includes("rate limit")
  )
    return "password_reset_rate_limited";

  if (
    code.includes("configuration") ||
    code.includes("redirect") ||
    message.includes("not configured") ||
    message.includes("redirect")
  )
    return "password_reset_configuration_error";

  return "password_reset_provider_failure";
}

export function logPasswordResetEvent(
  event: PasswordResetEvent,
  error?: AuthErrorLike,
) {
  const details = error
    ? { code: error.code ?? null, status: error.status ?? null }
    : undefined;
  const logger =
    event === "password_reset_requested" ? console.info : console.error;
  logger(event, details);
}
