import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminPrimaryNavigation } from "@/components/admin/primary-navigation";
import { PageContainer } from "@/components/page-container";
import { Logo } from "@/components/logo";
import { AdminIcon } from "@/components/admin/admin-icon";
import { AdminFooter } from "@/components/admin/admin-footer";
import {
  getAdminAccessState,
  getUserReferralRole,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReferralAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await getUserReferralRole();
  if (role === "partner") redirect("/partner");
  if (role !== "admin") redirect("/admin/login");
  const admin = await getAdminAccessState();
  if (admin?.mustChangePassword) redirect("/admin/change-password");
  return (
    <section className="min-w-0 bg-[radial-gradient(ellipse_at_top_left,#10274b55,transparent_55%)] pt-3 sm:pt-4">
      <PageContainer>
        <div className="mb-7 min-w-0 border-b border-slate-700/70 pb-5 sm:mb-8">
          <div className="mb-5 flex min-w-0 items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Logo compact />
              <p className="min-w-0 text-base font-semibold tracking-tight text-white sm:text-xl">
                Steady Start Portal
              </p>
              <span className="hidden border-l border-slate-500 pl-4 text-sm text-slate-300 sm:block">
                Admin
              </span>
            </div>
            <form action="/api/admin/auth/logout" method="post">
              <button className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-500 bg-slate-800/50 px-3 text-sm font-medium text-white hover:border-blue-300 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300">
                <AdminIcon name="logout" className="hidden h-5 w-5 sm:block" />
                Sign Out
              </button>
            </form>
          </div>
          <AdminPrimaryNavigation />
        </div>
        {children}
      </PageContainer>
      <AdminFooter />
    </section>
  );
}
