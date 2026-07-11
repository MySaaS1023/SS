import { cookies } from "next/headers";

export async function getCurrentOrganizationId() {
  const cookieStore = await cookies();
  return cookieStore.get("steady_start_org_id")?.value ?? "11111111-1111-4111-8111-111111111111";
}
