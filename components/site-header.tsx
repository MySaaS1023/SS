"use client";

import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { navLinks } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#CBBDB6] bg-[rgba(243,236,232,0.88)] backdrop-blur-xl">
      <PageContainer className="relative flex items-center justify-between gap-3 py-2.5 md:gap-5 md:py-3">
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

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="glass-panel inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#CBBDB6] text-[#342C2C] shadow-[0_0_24px_rgba(192,141,144,0.12)] transition hover:border-[#C08D90] md:hidden"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-4 bg-[#342C2C] transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-4 bg-[#342C2C] transition ${isMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-4 bg-[#342C2C] transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>

          <Link
            href="/get-started"
            onClick={closeMenu}
            className={`${primaryButtonClass} force-white-btn px-4 py-2 text-sm md:px-5 md:py-2.5 md:self-auto`}
          >
            Hire Us
          </Link>
        </div>

        {isMenuOpen ? (
          <div className="absolute left-0 right-0 top-full mt-3 md:hidden">
            <div className="glass-card rounded-2xl border border-[#CBBDB6] p-3 shadow-[0_18px_36px_rgba(52,44,44,0.1)]">
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-[#342C2C] transition hover:bg-[#DDBBBC] hover:text-[#342C2C]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </header>
  );
}
