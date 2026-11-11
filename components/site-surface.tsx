"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BrandImage, OceanWave } from "@/components/ocean-brand";

const marketing = new Set([
  "/",
  "/about",
  "/pricing",
  "/referral-partners",
  "/contact",
]);
const auth = /\/(?:login|forgot-password|reset-password|change-password)$/;

export function SiteSurface({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const kind = marketing.has(pathname)
    ? "marketing"
    : auth.test(pathname)
      ? "authentication"
      : pathname === "/admin" ||
          pathname.startsWith("/admin/") ||
          pathname === "/partner" ||
          pathname.startsWith("/partner/")
        ? "portal"
        : "content";
  return (
    <main
      className="board-surface flex-1"
      data-board-kind={kind}
      data-board-route={pathname}
    >
      {kind === "content" || kind === "authentication" ? (
        <div className="board-page-ribbon" aria-hidden="true">
          <OceanWave />
        </div>
      ) : null}
      {kind === "authentication" ? (
        <div className="board-auth-lockup">
          <BrandImage />
        </div>
      ) : null}
      {children}
    </main>
  );
}
