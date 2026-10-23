import { CreateHandoffForm } from "@/components/handoff/admin-forms";
import { getHandoffSetupStatus } from "@/lib/handoff/server";
import { getGoogleReviewUrl, getHandoffSocialLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client handoffs | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default function HandoffsPage() {
  const missing = getHandoffSetupStatus();
  const reviewUrl = getGoogleReviewUrl();
  return (
    <div>
      <p className="section-kicker">Client delivery</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Client handoffs
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        Give each client a personal home for their completed website, your
        thank-you message, and ways to stay connected.
      </p>
      {missing.length ? (
        <div
          role="status"
          className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100"
        >
          <p className="font-semibold">Handoff setup needs attention</p>
          {missing.length ? (
            <p className="mt-2 break-words">
              Missing or invalid configuration: {missing.join(", ")}. An
              authorized administrator must configure these securely.
            </p>
          ) : null}
          <p className="mt-2">
            Existing websites and referral records are unaffected. No sample
            client links are published.
          </p>
        </div>
      ) : null}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <CreateHandoffForm disabled={missing.length > 0} />
        <aside
          className="glass-card p-5 sm:p-6"
          aria-labelledby="handoff-settings-heading"
        >
          <h2
            id="handoff-settings-heading"
            className="text-xl font-semibold text-white"
          >
            Review &amp; follow settings
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            These shared links apply to every client handoff.
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            {getHandoffSocialLinks().map(({ label, href }) => (
              <div key={label}>
                <dt className="font-medium text-white">{label}</dt>
                <dd className="mt-1 break-all text-slate-400">{href}</dd>
              </div>
            ))}
            <div>
              <dt className="font-medium text-white">Google reviews</dt>
              <dd className="mt-1 break-words text-slate-400">
                {reviewUrl ??
                  "Hidden — no verified, eligible review URL is configured."}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-6 text-slate-400">
            Manage shared links in the central social settings. Google reviews
            require the business owner&apos;s eligibility confirmation and
            official review link.
          </p>
        </aside>
      </div>
    </div>
  );
}
