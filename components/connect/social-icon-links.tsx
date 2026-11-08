import { PlatformIcon } from "@/components/connect/platform-icon";
import {
  getHandoffSocialLinks,
  type SocialLinkSettings,
} from "@/lib/social-links";

export function SocialIconLinks({
  settings,
  label = "Steady Start social accounts",
}: {
  settings: SocialLinkSettings;
  label?: string;
}) {
  return (
    <div aria-label={label} className="flex flex-wrap items-center gap-3">
      {getHandoffSocialLinks(settings).map(({ label: platform, href }) => (
        <a
          key={platform}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${platform} — Steady Start (opens in a new tab)`}
          title={platform}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-slate-200 transition hover:border-blue-300/50 hover:bg-blue-300/10 hover:text-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <PlatformIcon platform={platform} />
        </a>
      ))}
    </div>
  );
}
