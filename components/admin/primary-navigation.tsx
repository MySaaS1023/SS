"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminPrimaryLinks = [
  { href: "/admin/referral-program", label: "Referral Program" },
  { href: "/admin/scheduling", label: "Client Scheduling" },
  { href: "/admin/handoffs", label: "Client Handoff" },
  { href: "/admin/connect", label: "QR Code" },
] as const;

export function AdminPrimaryNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin primary"
      className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4"
    >
      {adminPrimaryLinks.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const className = `flex min-h-12 min-w-0 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-medium leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${active ? "border-blue-400/50 bg-blue-400/15 text-blue-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"}`;
        // Enter private workflows with a fresh document and their response policy.
        const privateWorkflow = href !== "/admin/referral-program";
        return privateWorkflow ? (
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
