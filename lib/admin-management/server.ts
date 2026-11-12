import { createAdminSupabaseClient, requireUser, adminMustChangePassword, isAdminEmail, administratorRolesEnabled } from "@/lib/supabase/server";
import type { Administrator, AdministratorChange } from "./core";

// This gate is intentionally unset by default. Activating it requires owner approval,
// a reviewed migration, an immutable owner UUID bootstrap and auth integration.
export function administratorManagementEnabled() {
  return administratorRolesEnabled();
}
export async function isProtectedAdminIdentity(userId: string | undefined, email?: string | null) {
  if (isAdminEmail(email)) return true;
  if (!administratorManagementEnabled()) return false;
  const database = createAdminSupabaseClient();
  const [membership, emailMembership, invitation] = await Promise.all([
    userId ? database.from("administrator_memberships").select("user_id").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    email ? database.from("administrator_memberships").select("user_id").eq("email", email.trim().toLowerCase()).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    email ? database.from("administrator_invitations").select("id").eq("email", email.trim().toLowerCase()).limit(1)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (membership.error || emailMembership.error || invitation.error) throw new Error("Administrator identity protection is unavailable.");
  // Disabled/revoked identities stay protected from partner credential replacement.
  return Boolean(membership.data || emailMembership.data || invitation.data?.length);
}
export async function getAdministratorManagementContext() {
  if (!administratorManagementEnabled()) return null;
  const user = await requireUser();
  if (!user || adminMustChangePassword(user)) return null;
  const database = createAdminSupabaseClient();
  const { data, error } = await database.from("administrator_memberships")
    .select("user_id,display_name,email,role,status,version")
    .eq("user_id", user.id).eq("status", "active").maybeSingle();
  // Never fall back to an email allowlist on a membership lookup failure.
  if (error || !data || data.role !== "super_admin") return null;
  return { user, administrator: data as Administrator, database };
}
export async function loadAdministratorManagement() {
  const context = await getAdministratorManagementContext();
  if (!context) return null;
  const [members, invitations, audit] = await Promise.all([
    context.database.from("administrator_memberships")
      .select("user_id,display_name,email,role,status,version").order("created_at"),
    context.database.from("administrator_invitations")
      .select("id,display_name,email,role,status,created_at").order("created_at", { ascending: false }),
    context.database.from("administrator_audit")
      .select("id,actor_user_id,target_user_id,action,created_at").order("created_at", { ascending: false }).limit(100),
  ]);
  if (members.error || invitations.error || audit.error) return null;
  return { members: members.data as Administrator[], invitations: invitations.data, audit: audit.data };
}
export async function changeAdministrator(change: AdministratorChange) {
  const context = await getAdministratorManagementContext();
  if (!context) return { ok: false, status: 403, message: "Super Admin access or approved setup is unavailable." };
  const { error } = await context.database.rpc("manage_administrator", {
    p_actor: context.user.id, p_target: change.userId, p_role: change.role,
    p_status: change.status, p_expected_version: change.version, p_confirmation: change.confirmation,
  });
  if (error) return { ok: false, status: 409, message: "Change refused. Reload and check approval, confirmation, and last Super Admin protection." };
  return { ok: true, status: 200, message: "Administrator access updated and audited." };
}
