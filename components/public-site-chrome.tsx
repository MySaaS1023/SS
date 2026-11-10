"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Authentication screens retain the public site chrome. Protected admin pages
// provide their own portal header, navigation and compact legal/support footer.
const adminAuthenticationPaths = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/change-password",
]);

export function PublicSiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (isAdmin && !adminAuthenticationPaths.has(pathname)) return null;
  return children;
}
