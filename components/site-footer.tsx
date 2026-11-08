import Link from "next/link";
import Image from "next/image";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";
import { getGoogleReviewUrl } from "@/lib/social-links";
import { getSocialSettings } from "@/lib/social-settings";
import { SocialIconLinks } from "@/components/connect/social-icon-links";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/referral-partners/terms", label: "Referral Partner Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/quick-links", label: "Quick Links" },
];

const serviceLinks = [
  { href: "/#services", label: "Business Setup" },
  { href: "/#services", label: "Custom Websites" },
  { href: "/#services", label: "AI Automation" },
  { href: "/portfolio", label: "Portfolio" },
];

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/referral-partners", label: "Referral Partners" },
  { href: "/contact", label: "Contact" },
];

function FooterLinkList({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
        {heading}
      </h3>
      <div className="mt-5 space-y-3 text-sm text-white/84">
        {links.map((link) => (
          <div key={`${heading}-${link.href}-${link.label}`}>
            <Link href={link.href} className="transition hover:text-[#8db6ff]">
              {link.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function SiteFooter() {
  const settings = await getSocialSettings();
  const googleReviewUrl = getGoogleReviewUrl(settings);
  return (
    <footer className="border-t border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,#070b14,#050816)] text-white">
      <PageContainer className="pt-14 pb-10">
        <div className="mx-auto grid max-w-6xl gap-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[minmax(260px,1.35fr)_minmax(140px,0.7fr)_minmax(120px,0.65fr)_minmax(110px,0.55fr)] lg:gap-x-16">
          <div className="flex flex-col items-center sm:items-start">
            <Logo compact />
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/68">
              Helping entrepreneurs launch with confidence.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/68">
              Business setup, custom websites, AI automation, and online
              business solutions.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-5 inline-flex text-sm text-white/84 transition hover:text-white"
            >
              {supportEmail}
            </a>

            <div className="mt-6">
              <SocialIconLinks
                settings={settings}
                label="Footer social accounts"
              />
            </div>
            <div className="mt-6 flex max-w-full items-center gap-4 text-left">
              <Link
                href="/connect"
                aria-label="Open Steady Start Reviews & Socials"
                className="shrink-0 rounded-xl bg-white p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
              >
                <Image
                  src="/connect-qr.png"
                  alt="QR code for Steady Start Reviews & Socials"
                  width={888}
                  height={888}
                  unoptimized
                  className="h-36 w-36"
                />
              </Link>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Scan to Connect
                </p>
                <Link
                  href="/connect"
                  className="mt-1 inline-flex min-h-11 items-center text-sm leading-6 text-blue-200 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
                >
                  Reviews & Socials
                </Link>
                {googleReviewUrl ? (
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Leave a Google Review (opens in a new tab)"
                    className="inline-flex min-h-11 items-center text-sm leading-6 text-slate-300 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
                  >
                    Google Reviews
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <FooterLinkList heading="Services" links={serviceLinks} />
          <FooterLinkList heading="Company" links={companyLinks} />
          <FooterLinkList heading="Legal" links={legalLinks} />
        </div>

        <div className="mx-auto mt-14 max-w-6xl border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/45">
            © 2026 Steady Start LLC. All Rights Reserved.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
