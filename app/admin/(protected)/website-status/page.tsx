export const dynamic = "force-dynamic";
export const metadata = {
  title: "Website Status | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function WebsiteStatusPage() {
  return (
    <div className="max-w-3xl">
      <p className="section-kicker">Public availability</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Website Status
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Steady Start stays publicly available. The former shutdown control has
        been retired. Administrator and Partner access remain protected by the
        existing authentication and authorization controls.
      </p>
      <div className="mt-8">
        <p
          role="status"
          className="glass-card p-5 font-semibold text-emerald-200"
        >
          Public website: Online
        </p>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300">
        <p className="font-semibold text-white">Public availability</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Public pages remain accessible across deployments.</li>
          <li>
            Forms, referral intake, checkout and handoff pages remain enabled.
          </li>
          <li>Private routes and their security controls are unchanged.</li>
          <li>Existing content and database records are preserved.</li>
        </ul>
      </div>
    </div>
  );
}
