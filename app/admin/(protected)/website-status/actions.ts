"use server";

import { revalidatePath } from "next/cache";

import { WEBSITE_STATUS_KEY } from "@/lib/site-status/core";
import { writeAudit } from "@/lib/referrals/server";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";

export type WebsiteStatusActionState = {
  ok: boolean;
  message: string;
  online?: boolean;
};

export async function updateWebsiteStatusAction(
  _previous: WebsiteStatusActionState,
  formData: FormData,
): Promise<WebsiteStatusActionState> {
  const user = await getFullyAuthorizedAdminUser();
  if (!user) return { ok: false, message: "Administrator access is required." };
  const requested = String(formData.get("websiteStatus") ?? "");
  if (!["online", "offline"].includes(requested))
    return { ok: false, message: "Choose Online or Temporarily Offline." };
  const online = requested === "online";
  const admin = createAdminSupabaseClient();
  const { data: before, error: readError } = await admin
    .from("site_settings")
    .select("website_online")
    .eq("key", WEBSITE_STATUS_KEY)
    .single();
  if (readError || !before)
    return { ok: false, message: "Website status could not be read." };
  if (before.website_online === online)
    return {
      ok: true,
      online,
      message: online
        ? "The public website is already Online."
        : "The public website is already Temporarily Offline.",
    };
  const { data: updated, error } = await admin
    .from("site_settings")
    .update({
      website_online: online,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("key", WEBSITE_STATUS_KEY)
    .eq("website_online", before.website_online)
    .select("website_online")
    .maybeSingle();
  if (error || !updated)
    return {
      ok: false,
      message:
        "Website status changed elsewhere or could not be saved. Refresh and try again.",
    };
  await writeAudit({
    actorUserId: user.id,
    action: online ? "public_website_enabled" : "public_website_disabled",
    entityType: "site_setting",
    entityId: null,
    before: { website_online: before.website_online },
    after: { website_online: online },
  });
  revalidatePath("/admin/website-status");
  return {
    ok: true,
    online,
    message: online
      ? "The public website is Online."
      : "The public website is Temporarily Offline.",
  };
}
