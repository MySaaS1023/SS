import { reviewApplication } from "../actions";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export default async function ApplicationsPage() {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("referral_partner_applications")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <div>
      <p className="section-kicker">Referral Program</p>
      <h1 className="mt-3 text-4xl font-semibold text-white">Applications</h1>
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
              <form
                action={reviewApplication}
                className="mt-6 border-t border-white/10 pt-5"
              >
                <input type="hidden" name="id" value={item.id} />
                <textarea
                  name="notes"
                  placeholder="Internal notes"
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a] p-3 text-sm text-white"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button
                    name="action"
                    value="approve"
                    className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Approve Application
                  </button>
                  <button
                    name="action"
                    value="reject"
                    className="rounded-xl border border-red-400/40 px-5 py-3 text-sm font-semibold text-red-200"
                  >
                    Reject Application
                  </button>
                </div>
              </form>
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
