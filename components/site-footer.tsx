import Link from "next/link";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { footerDescription, supportEmail } from "@/lib/site-data";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

const footerNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#070b14,#050816)] text-white">
      <PageContainer className="py-12">
        <div className="mx-auto grid max-w-6xl gap-10 sm:gap-12 md:grid-cols-3 md:items-start md:justify-center md:gap-12 lg:gap-16">
          <div className="space-y-4">
          <Logo compact />
          <p className="max-w-sm text-sm leading-7 text-white/68">
            {footerDescription}
          </p>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex text-sm text-white/84 transition hover:text-white"
          >
            {supportEmail}
          </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Navigate
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/84">
              {footerNavLinks.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#bfdbfe]">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
              Legal
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/84">
              {legalLinks.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="transition hover:text-[#bfdbfe]">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
