import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminPrimaryNavigation } from "@/components/admin/primary-navigation";
import { PageContainer } from "@/components/page-container";
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
    <section className="py-10">
      <PageContainer>
        <div className="mb-8 min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#93c5fd]">
                Admin
              </p>
              <p className="mt-1 font-semibold text-white">
                Steady Start Portal
              </p>
            </div>
            <form action="/api/admin/auth/logout" method="post">
              <button className="min-h-11 rounded-lg px-3 text-sm text-white/70 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300">
                Sign out
              </button>
            </form>
          </div>
          <AdminPrimaryNavigation />
        </div>
        {children}
      </PageContainer>
    </section>
  );
}
