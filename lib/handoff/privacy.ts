// Keep completion tokens and the new private document/booking workflows out of tracking.
export function isHandoffScreen(pathname: string) {
  return (
    pathname === "/handoff" ||
    pathname.startsWith("/handoff/") ||
    pathname === "/admin/handoffs" ||
    pathname.startsWith("/admin/handoffs/") ||
    [
      "/admin/connect",
      "/admin/scheduling",
      "/admin/settings",
      "/admin/reset-password",
      "/partner/reset-password",
      "/auth/recovery",
      "/auth/partner-access",
      "/auth/admin-invite",
      "/admin/referral-program/resources",
      "/partner/resources",
      "/consultation",
    ].some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
}
