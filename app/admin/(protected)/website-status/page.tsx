import { WebsiteStatusControl } from "@/components/website-status-control";
import { getWebsiteStatus } from "@/lib/site-status/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Website Status | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function WebsiteStatusPage() {
  const status = await getWebsiteStatus();
  return (
    <div className="max-w-3xl">
      <p className="section-kicker">Public availability</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Website Status
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Temporarily hide public pages and block public submissions without
        deleting content or interrupting Admin, Partner, authentication, or
        webhook services. Switching back to Online takes effect immediately and
        does not require a deployment.
      </p>
      <div className="mt-8">
        <WebsiteStatusControl online={status.online} />
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300">
        <p className="font-semibold text-white">When Temporarily Offline</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Public pages return HTTP 503 with the temporary message.</li>
          <li>
            Public forms, referral intake, and handoff access are blocked.
          </li>
          <li>
            Admin, Partner, authentication, and webhook paths remain available.
          </li>
          <li>Existing content and database records are preserved.</li>
        </ul>
      </div>
    </div>
  );
}
