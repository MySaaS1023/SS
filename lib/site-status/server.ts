import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { WEBSITE_STATUS_KEY, type WebsiteStatus } from "./core";

export async function getWebsiteStatus(): Promise<WebsiteStatus> {
  const { data, error } = await createAdminSupabaseClient()
    .from("site_settings")
    .select("website_online,updated_at")
    .eq("key", WEBSITE_STATUS_KEY)
    .maybeSingle();
  if (error || !data)
    throw new Error(
      "Website status is unavailable. Check the database migration.",
    );
  return {
    online: data.website_online,
    updatedAt: data.updated_at,
  };
}
