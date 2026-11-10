"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "@/components/admin/admin-icon";

const sections = [
  ["/admin/referral-program", "Program Summary", "chart"],
  ["/admin/referral-program/applications", "Applications", "clipboard"],
  ["/admin/referral-program/partners", "Partners", "people"],
  ["/admin/referral-program/referrals", "Referrals", "link"],
  ["/admin/referral-program/commissions", "Commissions & Payouts", "coins"],
  ["/admin/referral-program/resources", "Partner Resources", "folder"],
] as const;

export function ReferralSectionNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Referral Program sections"
      className="mb-7 flex min-w-0 flex-wrap gap-2.5"
    >
      {sections.map(([href, label, icon]) => {
        const active =
          pathname === href ||
          (href !== "/admin/referral-program" &&
            pathname.startsWith(`${href}/`));
        const className = `inline-flex min-h-12 max-w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 ${active ? "border-sky-300/70 bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-[inset_0_0_10px_#38bdf84d]" : "border-slate-500/60 bg-gradient-to-br from-slate-800/70 to-slate-950 text-slate-200 hover:border-blue-300 hover:text-white"}`;
        const content = (
          <>
            <AdminIcon name={icon} className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </>
        );
        return href === "/admin/referral-program/resources" ? (
          <a
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {content}
          </a>
        ) : (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={active ? "page" : undefined}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
