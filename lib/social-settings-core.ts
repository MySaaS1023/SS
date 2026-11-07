import {
  getGoogleProfileUrl,
  getGoogleReviewUrl,
  getHandoffSocialLinks,
  socialLinks,
  type SocialLinkSettings,
} from "./social-links";

export type ManagedSocialSettings = {
  settings: SocialLinkSettings;
  version: number;
  updatedAt: string | null;
};
export class SocialSettingsError extends Error {}
export function validateSocialSettings(input: unknown): SocialLinkSettings {
  if (!input || typeof input !== "object")
    throw new SocialSettingsError("Enter valid social settings.");
  const value = input as Record<string, unknown>;
  function optionalUrl(key: string) {
    const item = value[key];
    if (item === null || item === undefined || item === "") return null;
    if (typeof item !== "string" || item.length > 2048)
      throw new SocialSettingsError(
        "Use supported HTTPS links of 2048 characters or fewer.",
      );
    const text = item.trim();
    if (!text) return null;
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      throw new SocialSettingsError("Use complete HTTPS links.");
    }
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      /[\u0000-\u001f\u007f]/.test(text)
    )
      throw new SocialSettingsError(
        "Use supported HTTPS links without credentials.",
      );
    return url.toString();
  }
  const settings: SocialLinkSettings = {
    facebook: optionalUrl("facebook"),
    youtube: optionalUrl("youtube"),
    instagram: optionalUrl("instagram"),
    tiktok: optionalUrl("tiktok"),
    googleReviewUrl: optionalUrl("googleReviewUrl"),
    googleBusinessProfileUrl: optionalUrl("googleBusinessProfileUrl"),
    googleBusinessProfileVerifiedEligible:
      value.googleBusinessProfileVerifiedEligible === true,
    googleBusinessProfileVerified: value.googleBusinessProfileVerified === true,
  };
  const supported = getHandoffSocialLinks(settings);
  for (const platform of [
    "facebook",
    "youtube",
    "instagram",
    "tiktok",
  ] as const) {
    if (
      settings[platform] &&
      !supported.some((link) => link.label.toLowerCase() === platform)
    )
      throw new SocialSettingsError(
        `Use a supported ${platform} business profile URL.`,
      );
  }
  if (supported.length && value.businessAccountsConfirmed !== true)
    throw new SocialSettingsError(
      "Confirm that the social links belong to Steady Start business accounts.",
    );
  // Validate destinations independently of publication checks. A listing is never a direct review link.
  if (
    settings.googleReviewUrl &&
    !getGoogleReviewUrl({
      ...settings,
      googleBusinessProfileVerifiedEligible: true,
    })
  )
    throw new SocialSettingsError(
      "Use Google's official direct review URL, not a listing or sharing link.",
    );
  if (
    settings.googleBusinessProfileUrl &&
    !getGoogleProfileUrl({ ...settings, googleBusinessProfileVerified: true })
  )
    throw new SocialSettingsError(
      "Use a supported Google Business Profile sharing or listing URL.",
    );
  if (
    settings.googleBusinessProfileVerifiedEligible &&
    !settings.googleReviewUrl
  )
    throw new SocialSettingsError(
      "Enter the official direct review URL before marking it verified.",
    );
  if (
    settings.googleBusinessProfileVerified &&
    !settings.googleBusinessProfileUrl
  )
    throw new SocialSettingsError(
      "Enter the business profile URL before marking it verified.",
    );
  return settings;
}
export interface SocialSettingsStore {
  read(): Promise<ManagedSocialSettings>;
  update(
    settings: SocialLinkSettings,
    expectedVersion: number,
    actorId: string,
  ): Promise<boolean>;
}
export function createSocialSettingsService(deps: {
  authorize: () => Promise<{ id: string } | null>;
  store: SocialSettingsStore;
}) {
  async function authorize() {
    const user = await deps.authorize();
    if (!user)
      throw new SocialSettingsError("Administrator access is required.");
    return user;
  }
  return {
    async read() {
      await authorize();
      return deps.store.read();
    },
    async save(input: unknown, version: number) {
      const user = await authorize();
      if (
        !Number.isSafeInteger(version) ||
        version < 1 ||
        version >= 2147483647
      )
        throw new SocialSettingsError("Refresh these settings before saving.");
      const settings = validateSocialSettings(input);
      if (!(await deps.store.update(settings, version, user.id)))
        throw new SocialSettingsError(
          "Settings changed elsewhere. Refresh before saving again.",
        );
      return settings;
    },
  };
}
export const defaultManagedSocialSettings = (): ManagedSocialSettings => ({
  settings: { ...socialLinks },
  version: 1,
  updatedAt: null,
});
