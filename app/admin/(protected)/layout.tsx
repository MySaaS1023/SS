import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/page-container";
import { getAdminUser } from "@/lib/supabase/server";

const links = [
  ["/admin/referral-program", "Overview"],
  ["/admin/referral-program/applications", "Applications"],
  ["/admin/referral-program/partners", "Partners"],
  ["/admin/referral-program/referrals", "Referrals"],
  ["/admin/referral-program/commissions", "Commissions"],
];

export const dynamic = "force-dynamic";

export default async function ReferralAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await getAdminUser())) redirect("/admin/login");
  return (
    <section className="py-10">
      <PageContainer>
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#93c5fd]">
              Admin
            </p>
            <p className="mt-1 font-semibold text-white">Referral Program</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
          <form action="/api/partner/auth/logout" method="post">
            <button className="text-sm text-white/60 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
        {children}
      </PageContainer>
    </section>
  );
}
