export type SocialLinkSettings = {
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  instagram?: string | null;
  googleBusinessProfileUrl?: string | null;
  googleBusinessProfileVerified?: boolean;
  googleReviewUrl: string | null;
  googleBusinessProfileVerifiedEligible: boolean;
};
export const socialLinks: SocialLinkSettings = {
  facebook: "https://www.facebook.com/profile.php?id=61589843720808",
  youtube: "https://www.youtube.com/channel/UCuVyP9rYxYh0I06v67GH6tg",
  tiktok: "https://www.tiktok.com/@steadystartco",
  instagram: "https://www.instagram.com/steadystartllc/",
  googleBusinessProfileUrl: "https://share.google/3EiiW6pSc2CoKitRs",
  googleBusinessProfileVerified: true,
  googleReviewUrl: "https://g.page/r/CUlLi1ESy6EqEBM/review",
  // Verified in the owner-managed Steady Start profile's Ask for reviews UI.
  googleBusinessProfileVerifiedEligible: true,
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
      label: "Instagram",
      href: settings.instagram,
      hosts: ["instagram.com", "www.instagram.com"],
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

export function getGoogleProfileUrl(
  settings: SocialLinkSettings = socialLinks,
): string | null {
  if (
    !settings.googleBusinessProfileVerified ||
    !settings.googleBusinessProfileUrl
  )
    return null;
  try {
    const url = new URL(settings.googleBusinessProfileUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    const host = url.hostname.toLowerCase();
    const allowed =
      host === "share.google" ||
      host === "g.page" ||
      host === "maps.google.com" ||
      ((host === "google.com" || host === "www.google.com") &&
        (url.pathname.startsWith("/maps") || url.pathname === "/search"));
    return allowed ? url.toString() : null;
  } catch {
    return null;
  }
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
