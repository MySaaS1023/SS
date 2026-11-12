import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import {
  getAdminAccessState,
  getUserReferralRole,
} from "@/lib/supabase/server";

// React cache memoizes only within the current Server Component request. Never
// use unstable_cache or a module-level session/user value for authorization.
// Every private page and data component must await this BEFORE loading data:
// layouts and child Server Components can execute independently in parallel.
export const requirePrivateAdministrator = cache(async () => {
  let state: Awaited<ReturnType<typeof getAdminAccessState>> = null;
  try {
    state = await getAdminAccessState();
  } catch {
    /* Fail closed. */
  }
  if (!state) {
    let role: Awaited<ReturnType<typeof getUserReferralRole>> = null;
    try {
      role = await getUserReferralRole();
    } catch {
      /* Fail closed. */
    }
    if (role === "partner") redirect("/partner");
    redirect("/admin/login");
  }
  if (state.mustChangePassword) redirect("/admin/change-password");
  return state.user;
});
