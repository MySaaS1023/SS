export type SocialLinkSettings = {
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  googleReviewUrl: string | null;
  googleBusinessProfileVerifiedEligible: boolean;
};
export const socialLinks: SocialLinkSettings = {
  facebook: "https://www.facebook.com/profile.php?id=61589843720808",
  youtube: "https://www.youtube.com/channel/UCuVyP9rYxYh0I06v67GH6tg",
  tiktok: "https://www.tiktok.com/@steadystartco",
  googleReviewUrl: null,
  // Set true only after the owner verifies eligibility and the official review URL.
  googleBusinessProfileVerifiedEligible: false,
};
export function getHandoffSocialLinks(
  settings: SocialLinkSettings = socialLinks,
): { label: string; href: string }[] {
  const candidates = [
    {
      label: "Facebook",
      href: settings.facebook,
      hosts: ["facebook.com", "www.facebook.com"],
    },
    {
      label: "YouTube",
      href: settings.youtube,
      hosts: ["youtube.com", "www.youtube.com", "youtu.be"],
    },
    {
      label: "TikTok",
      href: settings.tiktok,
      hosts: ["tiktok.com", "www.tiktok.com"],
    },
  ];
  return candidates.flatMap(({ label, href, hosts }) => {
    if (!href) return [];
    try {
      const url = new URL(href);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.port ||
        !hosts.includes(url.hostname.toLowerCase())
      )
        return [];
      return [{ label, href: url.toString() }];
    } catch {
      return [];
    }
  });
}
export function getGoogleReviewUrl(settings = socialLinks): string | null {
  if (
    !settings.googleBusinessProfileVerifiedEligible ||
    !settings.googleReviewUrl
  )
    return null;
  try {
    const url = new URL(settings.googleReviewUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.hash
    )
      return null;
    const host = url.hostname.toLowerCase();
    const valid =
      (host === "search.google.com" &&
        url.pathname === "/local/writereview" &&
        !!url.searchParams.get("placeid")) ||
      (host === "g.page" &&
        /^\/r\/[A-Za-z0-9_-]+\/review\/?$/.test(url.pathname)) ||
      (host === "www.google.com" &&
        url.pathname === "/maps" &&
        url.searchParams.get("q")?.startsWith("place_id:") &&
        url.searchParams.get("review") === "1");
    return valid ? url.toString() : null;
  } catch {
    return null;
  }
}
