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
    <nav aria-label="Admin primary" className="admin-primary-navigation">
      {adminPrimaryLinks.map(({ href, label, description, icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const className = "admin-primary-tab";
        const content = (
          <>
            <AdminIcon name={icon} className="h-4 w-4 shrink-0" />
            <span>{label}</span>
            <span className="sr-only"> — {description}</span>
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
