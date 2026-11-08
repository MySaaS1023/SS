"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acknowledgeResource } from "@/lib/partner-resources/server";
export async function acknowledgeResourceAction(form: FormData) {
  try {
    await acknowledgeResource(form.get("versionId"));
  } catch {
    redirect("/partner/resources?receipt=unavailable");
  }
  revalidatePath("/partner/resources");
  revalidatePath("/admin/referral-program/resources");
  redirect("/partner/resources?receipt=saved");
}
