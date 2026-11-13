import Link from "next/link";
import Image from "next/image";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";
import { getGoogleReviewUrl } from "@/lib/social-links";
import { getSocialSettings } from "@/lib/social-settings";
import { SocialIconLinks } from "@/components/connect/social-icon-links";
import { OceanMesh, OceanWave } from "@/components/ocean-brand";

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
  { href: "/get-started", label: "Start Your Project" },
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
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <div className="mt-4 space-y-2 text-sm text-slate-300">
        {links.map((link) => (
          <div key={`${heading}-${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="inline-flex min-h-7 items-center transition hover:text-[#8db6ff]"
            >
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
    <footer className="public-site-footer border-t border-blue-300/15 text-white">
      <OceanMesh className="footer-ocean-mesh" />
      <PageContainer className="pt-9 pb-6">
        <div className="public-footer-grid">
          <div className="flex flex-col items-center sm:items-start">
            <div className="public-brand">
              <Logo compact />
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">
              Helping businesses launch, grow, and succeed online.
            </p>
            <p className="brand-slogan text-sm">We set you up for success!</p>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-2 inline-flex min-h-8 break-all text-sm text-slate-300 transition hover:text-white"
            >
              {supportEmail}
            </a>

            <div className="mt-4">
              <SocialIconLinks
                settings={settings}
                label="Footer social accounts"
              />
            </div>
          </div>
          <FooterLinkList heading="Services" links={serviceLinks} />
          <FooterLinkList heading="Company" links={companyLinks} />
          <FooterLinkList heading="Quick Links" links={legalLinks} />
          <div className="public-footer-connect">
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
                className="h-28 w-28"
              />
            </Link>
            <div className="min-w-0">
              <p className="mt-3 text-sm font-semibold text-white">
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

        <div className="public-footer-bottom">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Steady Start LLC. All Rights Reserved.
          </p>
        </div>
      </PageContainer>
      <OceanWave className="footer-ocean-wave" />
    </footer>
  );
}
