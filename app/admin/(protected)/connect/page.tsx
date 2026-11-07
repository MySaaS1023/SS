import Image from "next/image";
import Link from "next/link";
import { getAdminSocialSettings } from "@/lib/social-settings";
import { SocialSettingsForm } from "./settings-form";
import { ConnectQrControls } from "./qr-controls";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reviews, socials & QR | Steady Start Admin",
  robots: { index: false, follow: false },
};
export default async function AdminConnectPage() {
  let managed: Awaited<ReturnType<typeof getAdminSocialSettings>> | null = null;
  try {
    managed = await getAdminSocialSettings();
  } catch {
    /* No write controls when storage/auth is unavailable. */
  }
  return (
    <section>
      <p className="section-kicker">Public connections</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">QR Code</h1>
      <Link
        href="/connect"
        className="mt-4 inline-flex min-h-11 items-center text-blue-200 underline focus-visible:outline-2 focus-visible:outline-blue-300"
      >
        Open Reviews &amp; Socials page
      </Link>
      <nav
        aria-label="QR Code sections"
        className="mt-6 flex flex-wrap gap-2 text-sm"
      >
        <a
          href="#qr-preview"
          className="min-h-11 rounded-xl border border-white/15 px-4 py-3 text-blue-200"
        >
          QR Preview
        </a>
        <a
          href="#social-settings"
          className="min-h-11 rounded-xl border border-white/15 px-4 py-3 text-blue-200"
        >
          Google Reviews &amp; Social Links
        </a>
      </nav>
      <div id="qr-preview" className="glass-card mt-6 p-5 sm:p-8">
        <h2 className="text-xl font-semibold text-white">
          One permanent Steady Start QR code
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
          This code always opens /connect. Updating your Google or social links
          does not require reprinting it. Keep the white border clear and use
          sufficient print size and contrast.
        </p>
        <div className="mt-5 inline-block max-w-full rounded-xl bg-white p-4">
          <Image
            src="/connect-qr.png"
            width={360}
            height={360}
            unoptimized
            alt="Permanent Steady Start QR code opening https://www.steadystartco.com/connect"
            className="h-auto max-w-full"
          />
        </div>
        <ConnectQrControls />
      </div>
      {managed ? (
        <div id="social-settings">
          <SocialSettingsForm value={managed} />
        </div>
      ) : (
        <p
          id="social-settings"
          role="alert"
          className="glass-card mt-6 p-5 text-sm leading-7 text-amber-100"
        >
          Social settings could not be loaded. An authorized administrator must
          verify database configuration and the connect settings migration
          before editing. Public pages continue using the existing trusted
          defaults.
        </p>
      )}
    </section>
  );
}
