"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  ["/admin/referral-program", "Program summary"],
  ["/admin/referral-program/applications", "Applications"],
  ["/admin/referral-program/partners", "Partners"],
  ["/admin/referral-program/referrals", "Referrals"],
  ["/admin/referral-program/commissions", "Commissions & Payouts"],
  ["/admin/referral-program/resources", "Partner Resources"],
] as const;

export function ReferralSectionNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Referral Program sections"
      className="mb-8 flex min-w-0 flex-wrap gap-2 border-b border-white/10 pb-5"
    >
      {sections.map(([href, label]) => {
        const active =
          pathname === href ||
          (href !== "/admin/referral-program" &&
            pathname.startsWith(`${href}/`));
        const className = `inline-flex min-h-11 max-w-full items-center rounded-lg px-3 py-2 text-sm leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`;
        return href === "/admin/referral-program/resources" ? (
          <a
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {label}
          </a>
        ) : (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
