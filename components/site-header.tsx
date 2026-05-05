import Link from "next/link";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { navLinks } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.65)] backdrop-blur-xl">
      <PageContainer className="flex items-center justify-between gap-4 py-3 md:py-4">
        <Logo compact />
        <nav className="hidden items-center justify-center gap-5 text-sm font-medium text-[var(--muted)] md:flex md:justify-end md:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/get-started"
          className={`${primaryButtonClass} force-white-btn px-4 py-2 text-sm md:px-6 md:py-3 md:self-auto`}
        >
          Hire Us
        </Link>
      </PageContainer>
    </header>
  );
}
