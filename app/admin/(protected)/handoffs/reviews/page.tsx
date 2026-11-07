import Link from "next/link";
import { listHandoffFeedback } from "@/lib/handoff/feedback-server";
import { HandoffSectionNav } from "@/components/handoff/section-nav";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private client reviews | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function HandoffReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requested = Number((await searchParams).page ?? 1);
  const page =
    Number.isSafeInteger(requested) && requested >= 1 && requested <= 100000
      ? requested
      : 1;
  let feedback: Awaited<ReturnType<typeof listHandoffFeedback>> = [];
  let unavailable = false;
  try {
    feedback = await listHandoffFeedback(page);
  } catch {
    unavailable = true;
  }
  return (
    <section>
      <Link
        href="/admin/handoffs"
        className="inline-flex min-h-11 items-center text-blue-200 underline focus-visible:outline-2 focus-visible:outline-blue-300"
      >
        Back to handoffs
      </Link>
      <p className="section-kicker mt-6">Private client feedback</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Client reviews</h1>
      <HandoffSectionNav selected="feedback" />
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        Only authorized administrators can view these submissions. They are not
        published on your website or sent to Google. Obtain explicit customer
        permission before sharing a review publicly.
      </p>
      {unavailable ? (
        <p role="alert" className="glass-card mt-6 p-6 text-amber-100">
          Reviews are unavailable. Check the approved feedback migration and
          server configuration.
        </p>
      ) : feedback.length ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {feedback.map((review) => (
            <article key={review.id} className="glass-card min-w-0 p-5 sm:p-6">
              <h2 className="break-words text-lg font-semibold text-white">
                {review.businessName}
              </h2>
              <p className="mt-3 font-medium text-blue-200">
                {review.rating} of 5 stars
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                {review.comment || "No written comment."}
              </p>
              <time
                dateTime={review.createdAt}
                className="mt-4 block text-xs text-slate-400"
              >
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                }).format(new Date(review.createdAt))}{" "}
                UTC
              </time>
            </article>
          ))}
        </div>
      ) : (
        <p className="glass-card mt-6 p-6 text-sm text-slate-300">
          No client reviews yet.
        </p>
      )}
      {!unavailable && (page > 1 || feedback.length === 100) ? (
        <nav aria-label="Client review pages" className="mt-6 flex gap-4">
          {page > 1 ? (
            <Link
              href={`/admin/handoffs/reviews?page=${page - 1}`}
              className="inline-flex min-h-11 items-center text-blue-200 underline"
            >
              Newer reviews
            </Link>
          ) : null}
          {feedback.length === 100 && page < 100000 ? (
            <Link
              href={`/admin/handoffs/reviews?page=${page + 1}`}
              className="inline-flex min-h-11 items-center text-blue-200 underline"
            >
              Older reviews
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
