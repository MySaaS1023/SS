"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "@/components/admin/admin-icon";

export const adminPrimaryLinks = [
  {
    href: "/admin/referral-program",
    label: "Referral Program",
    description: "Manage partners, referrals & payouts",
    icon: "people",
  },
  {
    href: "/admin/scheduling",
    label: "Client Scheduling",
    description: "Manage consultations & meetings",
    icon: "calendar",
  },
  {
    href: "/admin/handoffs",
    label: "Client Handoff",
    description: "Deliver completed websites",
    icon: "send",
  },
  {
    href: "/admin/connect",
    label: "QR Code",
    description: "Reviews, socials & link settings",
    icon: "qr",
  },
] as const;

export function AdminPrimaryNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin primary"
      className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4"
    >
      {adminPrimaryLinks.map(({ href, label, description, icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const className = `flex min-h-32 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 ${active ? "border-sky-300/80 bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 text-white shadow-[inset_0_0_14px_#38bdf84d,0_8px_28px_#1d4ed822]" : "border-slate-500/60 bg-gradient-to-br from-slate-800/80 to-slate-950 text-slate-200 hover:border-blue-300/70 hover:bg-slate-800 hover:text-white"}`;
        const content = (
          <>
            <AdminIcon
              name={icon}
              className={`h-8 w-8 ${active ? "text-white" : "text-blue-200"}`}
            />
            <span className="font-semibold sm:text-base">{label}</span>
            <span
              className={`text-xs leading-5 sm:text-sm ${active ? "text-blue-50" : "text-slate-300"}`}
            >
              {description}
            </span>
          </>
        );
        // Enter private workflows with a fresh document and their response policy.
        const privateWorkflow = href !== "/admin/referral-program";
        return privateWorkflow ? (
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
