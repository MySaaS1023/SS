import { ApplicationReviewForm } from "@/components/referrals/application-review-form";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ review?: string }>;
}) {
  const { review } = await searchParams;
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("referral_partner_applications")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Applications</h1>
      {review === "approved" || review === "rejected" ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-200"
        >
          {review === "approved"
            ? "Referral Partner approved successfully."
            : "Referral Partner application rejected."}
        </p>
      ) : null}
      <div className="mt-8 space-y-5">
        {(data ?? []).map((item) => (
          <article key={item.id} className="glass-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {item.first_name} {item.last_name}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.email} · {item.phone} · {item.city}, {item.state}
                </p>
              </div>
              <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white">
                {item.status}
              </span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted)]">Heard about us</dt>
                <dd className="mt-1 text-white">{item.heard_about}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Applied</dt>
                <dd className="mt-1 text-white">
                  {new Date(item.created_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Why join</dt>
                <dd className="mt-1 leading-6 text-white">{item.motivation}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Referral plan</dt>
                <dd className="mt-1 leading-6 text-white">
                  {item.referral_plan}
                </dd>
              </div>
            </dl>
            {item.status === "pending" ? (
              <ApplicationReviewForm
                applicationId={item.id}
                initialNotes={item.internal_notes ?? ""}
              />
            ) : item.internal_notes ? (
              <p className="mt-5 rounded-xl bg-black/20 p-3 text-sm text-[var(--muted)]">
                Internal notes: {item.internal_notes}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
