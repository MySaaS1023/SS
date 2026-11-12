import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  await requirePrivateAdministrator();
  redirect("/admin/referral-program");
}
