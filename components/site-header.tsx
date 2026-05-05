import Link from "next/link";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { navLinks } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.65)] backdrop-blur-xl">
      <PageContainer className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-[var(--muted)] md:justify-end md:gap-8">
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
          className={`${primaryButtonClass} force-white-btn text-sm md:self-auto`}
        >
          Get Started
        </Link>
      </PageContainer>
    </header>
  );
}
