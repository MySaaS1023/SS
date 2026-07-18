import Link from "next/link";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
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
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  {
    href: "https://www.youtube.com/channel/UCuVyP9rYxYh0I06v67GH6tg",
    label: "YouTube",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"
        />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@steadystartco",
    label: "TikTok",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M16.6 2c.4 3 2.1 4.8 5.1 5v3.4a8.8 8.8 0 0 1-5-1.5v6.6c0 4.7-3.1 7.5-7.2 7.5a7 7 0 0 1-7.2-7 7.2 7.2 0 0 1 8.5-7.1v3.7a3.6 3.6 0 0 0-1.3-.2 3.4 3.4 0 1 0 3.4 3.4V2h3.7Z"
        />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/profile.php?id=61589843720808",
    label: "Facebook",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12Z"
        />
      </svg>
    ),
  },
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

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,#070b14,#050816)] text-white">
      <PageContainer className="pt-20 pb-14">
        <div className="mx-auto grid max-w-6xl gap-12 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-[minmax(260px,1.35fr)_minmax(140px,0.7fr)_minmax(120px,0.65fr)_minmax(110px,0.55fr)] lg:gap-x-16">
          <div className="flex flex-col items-center sm:items-start">
            <Logo compact />
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/68">
              Helping entrepreneurs launch with confidence.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/68">
              Business setup, custom websites, AI automation, and online business
              solutions.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="mt-5 inline-flex text-sm text-white/84 transition hover:text-white"
            >
              {supportEmail}
            </a>

            <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition duration-200 hover:-translate-y-1 hover:border-[#8db6ff]/40 hover:text-[#8db6ff] hover:opacity-100"
                >
                  {social.icon}
                </a>
              ))}
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
