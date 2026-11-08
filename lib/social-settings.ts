import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  createAdminSupabaseClient,
  getFullyAuthorizedAdminUser,
} from "@/lib/supabase/server";
import { socialLinks, type SocialLinkSettings } from "./social-links";
import {
  createSocialSettingsService,
  type ManagedSocialSettings,
  type SocialSettingsStore,
} from "./social-settings-core";

const store: SocialSettingsStore = {
  async read() {
    const { data, error } = await createAdminSupabaseClient()
      .from("social_settings")
      .select("settings,version,updated_at")
      .eq("id", "steady-start")
      .single();
    if (error || !data)
      throw new Error("Social settings storage is unavailable.");
    return {
      settings: { ...socialLinks, ...data.settings } as SocialLinkSettings,
      version: data.version,
      updatedAt: data.updated_at,
    } as ManagedSocialSettings;
  },
  async update(settings, version, actorId) {
    const { data, error } = await createAdminSupabaseClient()
      .from("social_settings")
      .update({
        settings,
        version: version + 1,
        updated_at: new Date().toISOString(),
        updated_by: actorId,
      })
      .eq("id", "steady-start")
      .eq("version", version)
      .select("version")
      .maybeSingle();
    if (error) throw new Error("Social settings could not be saved.");
    return !!data;
  },
};
function service() {
  return createSocialSettingsService({
    authorize: getFullyAuthorizedAdminUser,
    store,
  });
}
const readPublicSettings = unstable_cache(
  async () => (await store.read()).settings,
  ["steady-start-public-social-settings-v1"],
  { tags: ["steady-start-social-settings"], revalidate: 300 },
);
export const getSocialSettings = cache(
  async (): Promise<SocialLinkSettings> => {
    // Public settings contain links only. Never make marketing pages depend on storage availability.
    try {
      return await readPublicSettings();
    } catch {
      return { ...socialLinks };
    }
  },
);
export async function getAdminSocialSettings() {
  return service().read();
}
export async function saveSocialSettings(input: unknown, version: number) {
  return service().save(input, version);
}
