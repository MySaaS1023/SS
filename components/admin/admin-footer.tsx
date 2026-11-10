import Image from "next/image";
import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";

const links = [
  ["/terms", "Terms"],
  ["/referral-partners/terms", "Referral Partner Terms"],
  ["/privacy", "Privacy"],
  ["/disclaimer", "Disclaimer"],
  ["/quick-links", "Quick Links"],
] as const;

export function AdminFooter() {
  return (
    <footer className="mt-12 border-t border-slate-700/70 bg-slate-950/50 py-6 text-sm text-slate-300">
      <PageContainer>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-white">Steady Start Portal</p>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex min-h-11 items-center break-all text-blue-200 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
            >
              {supportEmail}
            </a>
          </div>
          <a
            href="/connect"
            className="flex max-w-full items-center gap-3 self-start rounded-xl border border-slate-700 px-3 py-2 hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300"
          >
            <Image
              src="/connect-qr.png"
              alt="QR code for Steady Start Reviews & Socials"
              width={72}
              height={72}
              unoptimized
              className="h-16 w-16 rounded-lg bg-white p-1"
            />
            <span>
              <span className="block font-semibold text-white">
                Scan to Connect
              </span>
              <span className="mt-1 block text-xs text-slate-300">
                Reviews &amp; Socials
              </span>
            </span>
          </a>
        </div>
        <div className="mt-4 flex flex-col justify-between gap-2 border-t border-slate-800 pt-3 lg:flex-row lg:items-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Steady Start LLC. All rights reserved.
          </p>
          <nav
            aria-label="Admin legal and support"
            className="flex flex-wrap gap-x-5"
          >
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center text-xs hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </PageContainer>
    </footer>
  );
}
