export type ReferralAuthRole = "admin" | "partner" | null;

export function resolveAuthenticatedDestination(
  role: ReferralAuthRole,
  requestedPath?: string | null,
) {
  if (role === "admin")
    return requestedPath === "/admin/reset-password"
      ? "/admin/reset-password"
      : "/admin";
  if (role === "partner") return "/partner";
  return null;
}

export function authFailureDestination(requestedPath?: string | null) {
  return requestedPath?.startsWith("/admin")
    ? "/admin/login?error=invalid-link"
    : "/partner/login?error=invalid-link";
}
