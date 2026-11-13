import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminPrimaryNavigation } from "@/components/admin/primary-navigation";
import { PageContainer } from "@/components/page-container";
import { Logo } from "@/components/logo";
import { AdminIcon } from "@/components/admin/admin-icon";
import { AdminFooter } from "@/components/admin/admin-footer";
import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
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
    <section className="admin-portal-shell flex min-w-0 flex-1 flex-col bg-[var(--background)] pt-3 sm:pt-4">
      <PageContainer className="flex-1 pb-8">
        <div className="admin-portal-header">
          <div className="admin-portal-toolbar">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Logo compact iconOnly />
              <p className="min-w-0 text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                Steady Start Portal
              </p>
              <span className="hidden border-l border-[var(--line)] pl-4 text-sm text-[var(--muted)] sm:block">
                Admin
              </span>
            </div>
            <div className="admin-portal-account-actions">
              <AdminAccountMenu />
              <form action="/api/admin/auth/logout" method="post">
                <button className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--foreground)] hover:border-[var(--line)] hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
                  <AdminIcon
                    name="logout"
                    className="hidden h-5 w-5 sm:block"
                  />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
          <AdminPrimaryNavigation />
        </div>
        {children}
      </PageContainer>
      <AdminFooter />
    </section>
  );
}
