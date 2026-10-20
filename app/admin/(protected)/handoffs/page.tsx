import Link from "next/link";
import {
  CreateHandoffForm,
  DeactivateHandoffForm,
} from "@/components/handoff/admin-forms";
import { CopyMessage } from "@/components/handoff/copy-message";
import { getHandoffSetupStatus, listHandoffs } from "@/lib/handoff/server";
import type { AdminHandoff } from "@/lib/handoff/core";
import { getGoogleReviewUrl, getHandoffSocialLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client handoffs | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function HandoffsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number((await searchParams).page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 100000
      ? requestedPage
      : 1;
  const missing = getHandoffSetupStatus();
  let handoffs: AdminHandoff[] = [];
  let storageUnavailable = false;
  // Authentication is enforced by the protected layout and again in each service method.
  try {
    handoffs = await listHandoffs(page);
  } catch {
    storageUnavailable = true;
  }
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
      {missing.length || storageUnavailable ? (
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
          {storageUnavailable ? (
            <p className="mt-2">
              Handoff storage is unavailable. Check the database configuration
              and apply the handoff migration to the intended environment after
              approval.
            </p>
          ) : null}
          <p className="mt-2">
            Existing websites and referral records are unaffected. No sample
            client links are published.
          </p>
        </div>
      ) : null}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <CreateHandoffForm
          disabled={missing.length > 0 || storageUnavailable}
        />
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
      <section className="mt-10" aria-labelledby="handoff-list-heading">
        <h2
          id="handoff-list-heading"
          className="text-2xl font-semibold text-white"
        >
          Your handoff links
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-400">
          Page {page} · Up to 100 handoffs per page, newest first. Active links
          can be reused until you deactivate them. Anyone with a link can view
          its completion page.
        </p>
        {!handoffs.length ? (
          <div className="glass-card mt-5 p-6 text-sm leading-7 text-slate-300">
            {storageUnavailable
              ? "Handoffs cannot be loaded right now."
              : "No handoffs yet. Create your first client link above."}
          </div>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {handoffs.map((handoff) => (
              <article
                key={handoff.id}
                className="glass-card min-w-0 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-lg font-semibold text-white">
                    {handoff.businessName}
                  </h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${handoff.status === "active" ? "border-blue-300/30 text-blue-200" : "border-white/20 text-slate-400"}`}
                  >
                    {handoff.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 break-all text-sm leading-6 text-slate-300">
                  {handoff.websiteUrl}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Created{" "}
                  <time dateTime={handoff.createdAt}>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(handoff.createdAt))}
                  </time>
                </p>
                <Link
                  href={`/admin/handoffs/${handoff.id}/preview`}
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-[#bfdbfe] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-300"
                >
                  Preview page
                  <span className="sr-only"> for {handoff.businessName}</span>
                </Link>
                {handoff.url ? (
                  <CopyMessage url={handoff.url} />
                ) : handoff.status === "active" ? (
                  <p className="mt-4 text-sm leading-7 text-amber-100">
                    This link cannot be copied with the current encryption key.
                    Restore the correct key, or deactivate it and create a new
                    handoff.
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    This link no longer opens a client completion page.
                  </p>
                )}
                {handoff.status === "active" ? (
                  <DeactivateHandoffForm id={handoff.id} />
                ) : null}
              </article>
            ))}
          </div>
        )}
        {!storageUnavailable && (page > 1 || handoffs.length === 100) ? (
          <nav
            aria-label="Handoff list pages"
            className="mt-6 flex flex-wrap gap-4"
          >
            {page > 1 ? (
              <Link
                href={`/admin/handoffs?page=${page - 1}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-blue-200 focus-visible:outline-2 focus-visible:outline-blue-300"
              >
                Newer handoffs
              </Link>
            ) : null}
            {handoffs.length === 100 && page < 100000 ? (
              <Link
                href={`/admin/handoffs?page=${page + 1}`}
                className="inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 py-2 text-sm text-blue-200 focus-visible:outline-2 focus-visible:outline-blue-300"
              >
                Older handoffs
              </Link>
            ) : null}
          </nav>
        ) : null}
      </section>
    </div>
  );
}
