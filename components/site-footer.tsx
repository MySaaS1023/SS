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
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(148,163,184,0.14)] bg-[linear-gradient(180deg,#070b14,#050816)] text-white">
      <PageContainer className="py-12">
        <div className="mx-auto grid max-w-5xl gap-10 text-center md:grid-cols-[minmax(280px,1fr)_auto] md:items-start md:justify-between md:text-left">
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 md:mx-0 md:items-start">
            <Logo compact />
            <div className="space-y-4">
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
          </div>

          <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-x-8 md:mx-0 md:w-auto md:max-w-none md:gap-x-10 lg:gap-x-12">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Navigate
              </h3>
              <div className="mt-4 space-y-3 text-sm text-white/84">
                {footerNavLinks.map((link) => (
                  <div key={link.href}>
                    <Link href={link.href} className="transition hover:text-[#8db6ff]">
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
                    <Link href={link.href} className="transition hover:text-[#8db6ff]">
                      {link.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
