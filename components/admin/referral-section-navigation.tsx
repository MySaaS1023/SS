"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function ReferralSectionNavigation() {
  const pathname = usePathname();
  if (pathname === "/admin/referral-program") return null;
  return (
    <nav
      aria-label="Referral Program sections"
      className="mb-5 flex flex-wrap gap-4 text-sm"
    >
      <Link
        href="/admin/referral-program"
        className="inline-flex min-h-11 items-center underline underline-offset-4"
      >
        ← Referral Program
      </Link>
      {pathname !== "/admin/referral-program/resources" ? (
        <Link
          href="/admin/referral-program/resources"
          className="inline-flex min-h-11 items-center underline underline-offset-4"
        >
          Partner Resources
        </Link>
      ) : null}
    </nav>
  );
}
