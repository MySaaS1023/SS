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
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,10,0.65)] backdrop-blur-xl">
      <PageContainer className="relative flex items-center justify-between gap-4 py-3 md:py-4">
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
            className="glass-panel inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(139,92,246,0.22)] text-white shadow-[0_0_24px_rgba(59,130,246,0.08)] transition hover:border-[rgba(59,130,246,0.28)] md:hidden"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-4 bg-white transition ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 w-4 bg-white transition ${isMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-4 bg-white transition ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>

          <Link
            href="/get-started"
            onClick={closeMenu}
            className={`${primaryButtonClass} force-white-btn px-4 py-2 text-sm md:px-6 md:py-3 md:self-auto`}
          >
            Hire Us
          </Link>
        </div>

        {isMenuOpen ? (
          <div className="absolute left-0 right-0 top-full mt-3 md:hidden">
            <div className="glass-card rounded-2xl border border-[rgba(139,92,246,0.2)] p-3 shadow-[0_18px_36px_rgba(2,6,23,0.32)]">
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-[rgba(59,130,246,0.08)] hover:text-[#dbeafe]"
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
