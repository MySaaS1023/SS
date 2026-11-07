import "server-only";
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
export async function getSocialSettings(): Promise<SocialLinkSettings> {
  // Public settings contain links only. Never make marketing pages depend on storage availability.
  try {
    return (await store.read()).settings;
  } catch {
    return { ...socialLinks };
  }
}
export async function getAdminSocialSettings() {
  return service().read();
}
export async function saveSocialSettings(input: unknown, version: number) {
  return service().save(input, version);
}
