import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import Link from "next/link";
import {
  CreateHandoffForm,
  CheckHandoffEmailConfigurationForm,
} from "@/components/handoff/admin-forms";
import { DeliveryHistory } from "@/components/handoff/delivery-history";
import { HandoffSectionNav } from "@/components/handoff/section-nav";
import { getHandoffSetupStatus, listHandoffs } from "@/lib/handoff/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Client Handoff | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function HandoffsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; page?: string; q?: string }>;
}) {
  await requirePrivateAdministrator();
  const query = await searchParams;
  const section =
    query.section === "saved" || query.section === "delivery"
      ? query.section
      : "create";
  const requested = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requested) && requested >= 1 && requested <= 100000
      ? requested
      : 1;
  const filter = (query.q ?? "").trim().slice(0, 120);
  const missing = getHandoffSetupStatus();
  let saved: Awaited<ReturnType<typeof listHandoffs>> = [];
  let unavailable = false;
  if (section === "saved") {
    try {
      saved = await listHandoffs(page);
    } catch {
      unavailable = true;
    }
  }
  const matches = saved.filter((h) =>
    `${h.businessName} ${h.contactName}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <section className="min-w-0">
      <p className="section-kicker">Client delivery</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Client Handoff
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
        Create, preview and manage a personal completion page for each client.
        Saving and previewing never sends a message.
      </p>
      <HandoffSectionNav selected={section} />
      {section === "create" ? (
        <>
          {missing.length ? (
            <p
              role="status"
              className="mb-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100"
            >
              Handoff setup needs attention: {missing.join(", ")}. Existing
              handoffs and customer records are preserved.
            </p>
          ) : null}
          <div className="max-w-3xl">
            <CreateHandoffForm disabled={missing.length > 0} />
          </div>
        </>
      ) : section === "delivery" ? (
        <>
          <div className="glass-card p-5 text-sm leading-7 text-slate-300">
            <h2 className="text-xl font-semibold text-white">
              Preview before sending
            </h2>
            <p className="mt-2">
              Open a saved handoff to review its page and recipient, preview the
              message and explicitly confirm delivery. Provider acceptance does
              not confirm inbox delivery.
            </p>
            <p className="mt-2">
              Send to Text stays disabled until an approved SMS provider,
              registration and consent workflow are configured.
            </p>
            <Link
              href="/admin/handoffs?section=saved"
              className="mt-3 inline-flex min-h-11 items-center text-blue-200 underline"
            >
              Choose a saved handoff
            </Link>
          </div>
          <CheckHandoffEmailConfigurationForm />
          <DeliveryHistory />
        </>
      ) : (
        <div className="glass-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Saved Handoffs</h2>
          <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="section" value="saved" />
            <input type="hidden" name="page" value={page} />
            <label className="min-w-0 flex-1 text-sm text-slate-200">
              Search this page
              <input
                name="q"
                defaultValue={filter}
                maxLength={120}
                className="mt-2 w-full rounded-xl border border-white/20 bg-[#0f172a] px-4 py-3 text-white"
                placeholder="Business or contact name"
              />
            </label>
            <button className="min-h-11 rounded-xl border border-white/20 px-4 py-3 text-sm text-white">
              Search
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-400">
            Up to 100 saved handoffs per page. Contact details remain
            administrator-only.
          </p>
          {unavailable ? (
            <p role="alert" className="mt-5 text-amber-100">
              Saved handoffs could not be loaded. Check the handoff storage
              configuration.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {matches.map((h) => (
                <li key={h.id} className="py-3">
                  <details>
                    <summary className="flex min-h-11 cursor-pointer flex-wrap items-center justify-between gap-2 text-sm text-white">
                      <span className="min-w-0 break-words font-medium">
                        {h.businessName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {h.status} · Details
                      </span>
                    </summary>
                    <dl className="mt-2 space-y-2 break-words text-sm text-slate-300">
                      <div>
                        <dt className="text-slate-400">Contact</dt>
                        <dd>{h.contactName || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-400">Website</dt>
                        <dd>{h.websiteUrl}</dd>
                      </div>
                    </dl>
                    <Link
                      href={`/admin/handoffs/${h.id}/preview`}
                      className="mt-2 inline-flex min-h-11 items-center text-sm text-blue-200 underline"
                    >
                      Preview and manage
                      <span className="sr-only"> {h.businessName}</span>
                    </Link>
                  </details>
                </li>
              ))}
              {!matches.length ? (
                <li className="py-5 text-sm text-slate-400">
                  {filter
                    ? "No matching handoffs on this page."
                    : "No saved handoffs on this page."}
                </li>
              ) : null}
            </ul>
          )}
          <nav
            aria-label="Saved handoff pages"
            className="mt-4 flex flex-wrap gap-4 text-sm text-blue-200"
          >
            {page > 1 ? (
              <Link
                className="inline-flex min-h-11 items-center underline"
                href={`/admin/handoffs?section=saved&page=${page - 1}`}
              >
                Newer handoffs
              </Link>
            ) : null}
            {saved.length === 100 && page < 100000 ? (
              <Link
                className="inline-flex min-h-11 items-center underline"
                href={`/admin/handoffs?section=saved&page=${page + 1}`}
              >
                Older handoffs
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </section>
  );
}
