// Keep token-bearing completion URLs out of analytics and referral activity.
export function isHandoffScreen(pathname: string) {
  return (
    pathname === "/handoff" ||
    pathname.startsWith("/handoff/") ||
    pathname === "/admin/handoffs" ||
    pathname.startsWith("/admin/handoffs/")
  );
}
