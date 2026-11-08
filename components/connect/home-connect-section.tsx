import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { SocialIconLinks } from "@/components/connect/social-icon-links";
import {
  getGoogleReviewUrl,
  type SocialLinkSettings,
} from "@/lib/social-links";
import { primaryButtonClass } from "@/lib/styles";

export function HomeConnectSection({
  settings,
}: {
  settings: SocialLinkSettings;
}) {
  const googleReviewUrl = getGoogleReviewUrl(settings);
  return (
    <section
      aria-labelledby="home-connect-heading"
      className="pb-12 pt-3 sm:pb-16 lg:pb-20"
    >
      <PageContainer>
        <div className="glass-card grid min-w-0 gap-9 overflow-hidden p-6 sm:p-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:p-12">
          <div className="min-w-0">
            <p className="section-kicker">Reviews & Socials</p>
            <h2
              id="home-connect-heading"
              className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl"
            >
              Let&apos;s Stay Connected
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Have you worked with Steady Start? We&apos;d love to hear about
              your experience! Leave us a Google review and follow along for
              updates, inspiration, and more.
            </p>
            {googleReviewUrl ? (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Leave a Google Review (opens in a new tab)"
                className={`${primaryButtonClass} mt-6 min-h-12 max-w-full text-center text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300`}
              >
                Leave a Google Review
              </a>
            ) : null}
            <div className="mt-6">
              <SocialIconLinks
                settings={settings}
                label="Follow Steady Start"
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-center border-t border-white/10 pt-8 text-center lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <Link
              href="/connect"
              aria-label="Open Steady Start Reviews & Socials"
              className="max-w-full rounded-2xl bg-white p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
            >
              <Image
                src="/connect-qr.png"
                alt="QR code for Steady Start Reviews & Socials"
                width={888}
                height={888}
                unoptimized
                className="h-auto w-52 max-w-full"
              />
            </Link>
            <h3 className="mt-5 text-xl font-semibold text-white">
              Scan to Connect
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Scan to leave a review and follow Steady Start.
            </p>
            <Link
              href="/connect"
              className="mt-2 inline-flex min-h-11 items-center text-sm text-blue-200 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
            >
              Open Reviews & Socials
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
