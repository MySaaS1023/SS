import Link from "next/link";
import { administratorManagementEnabled, getAdministratorManagementContext } from "@/lib/admin-management/server";

export async function AdminAccountMenu() {
  const mayManage = !administratorManagementEnabled() || Boolean(await getAdministratorManagementContext());
  return (
    <details className="relative text-sm">
      <summary className="cursor-pointer rounded-lg border border-[var(--line)] px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-[var(--primary)]">Account / Settings</summary>
      <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--muted)] shadow-lg">
        {mayManage && <Link href="/admin/settings/admins" className="flex min-h-11 items-center rounded-lg px-3 py-2 hover:bg-[var(--surface)]">Manage Administrators</Link>}
        <Link href="/admin/change-password" className="block rounded-lg px-3 py-2 hover:bg-[var(--surface)]">Change password</Link>
      </div>
    </details>
  );
}
