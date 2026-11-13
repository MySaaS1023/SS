import Link from "next/link";
import { administratorManagementEnabled, getAdministratorManagementContext } from "@/lib/admin-management/server";

export async function AdminAccountMenu() {
  const mayManage = !administratorManagementEnabled() || Boolean(await getAdministratorManagementContext());
  return (
    <details className="relative text-sm">
      <summary className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-blue-600">Account / Settings</summary>
      <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-lg">
        {mayManage && <Link href="/admin/settings/admins" className="flex min-h-11 items-center rounded-lg px-3 py-2 hover:bg-slate-100">Manage Administrators</Link>}
        <Link href="/admin/change-password" className="block rounded-lg px-3 py-2 hover:bg-slate-100">Change password</Link>
      </div>
    </details>
  );
}
