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
      "/admin/referral-program/resources",
      "/partner/resources",
      "/consultation",
    ].some((route) => pathname === route || pathname.startsWith(`${route}/`))
  );
}
