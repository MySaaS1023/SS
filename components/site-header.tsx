"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { PageContainer } from "@/components/page-container";
import { navLinks } from "@/lib/site-data";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="public-site-header sticky top-0 z-50 border-b border-white/[0.07] bg-[#030d1b]/90 backdrop-blur-xl">
      <PageContainer className="relative flex items-center justify-between gap-3 py-2 md:gap-5 md:py-2.5">
        <div className="public-brand">
          <Logo compact />
          <Link
            href="/"
            aria-label="Steady Start home"
            className="public-brand-name"
          >
            Steady Start
          </Link>
        </div>

        <nav aria-label="Main navigation" className="public-desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="public-nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="public-mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="public-menu-toggle"
          >
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
            className="home-button home-button-primary public-header-cta"
          >
            Start Here
          </Link>
        </div>

        {isMenuOpen ? (
          <div
            id="public-mobile-navigation"
            className="public-mobile-menu absolute left-0 right-0 top-full mt-1 px-5"
          >
            <div className="glass-card rounded-2xl border border-[rgba(139,92,246,0.2)] p-3 shadow-[0_18px_36px_rgba(2,6,23,0.32)]">
              <nav aria-label="Mobile navigation" className="flex flex-col">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={pathname === link.href ? "page" : undefined}
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
