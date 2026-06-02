import Link from "next/link";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { footerDescription, navLinks, supportEmail } from "@/lib/site-data";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,#070b14,#050816)] text-white">
      <PageContainer className="grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo invert />
          <p className="max-w-sm text-sm leading-7 text-white/70">
            {footerDescription}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
            Navigate
          </h3>
          <div className="mt-4 space-y-3 text-sm text-white/88">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href} className="transition hover:text-[#bfdbfe]">
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
            Legal & Support
          </h3>
          <div className="mt-4 space-y-3 text-sm text-white/88">
            {legalLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href} className="transition hover:text-[#bfdbfe]">
                  {link.label}
                </Link>
              </div>
            ))}
            <a
              href={`mailto:${supportEmail}`}
              className="transition hover:text-[#bfdbfe]"
            >
              {supportEmail}
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
