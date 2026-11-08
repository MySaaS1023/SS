import { partnerResources } from "@/lib/partner-resources/server";
import { acknowledgeResourceAction } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Partner Resources | Steady Start",
  robots: { index: false, follow: false },
};
export default async function PartnerResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ receipt?: string }>;
}) {
  let data: Awaited<ReturnType<typeof partnerResources>>;
  try {
    data = await partnerResources();
  } catch {
    return (
      <section className="glass-card p-5">
        <h1 className="text-2xl font-semibold">Partner Resources</h1>
        <p role="alert" className="mt-4 text-slate-300">
          Partner resources are temporarily unavailable. Please contact Steady
          Start.
        </p>
      </section>
    );
  }
  const receipt = (await searchParams).receipt;
  return (
    <section className="min-w-0 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Partner Resources
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Documents published for your partner account. Your private documents
          are available only to you and authorized administrators.
        </p>
      </header>
      {receipt === "saved" ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-4 text-sm text-emerald-200"
        >
          Receipt acknowledged for this document version.
        </p>
      ) : receipt === "unavailable" ? (
        <p role="alert" className="text-sm text-amber-200">
          The document changed or is unavailable. Please review the current
          version below.
        </p>
      ) : null}
      {data.resources.length ? (
        data.resources.map((resource) => {
          const version = data.versions.find(
            (v) => v.id === resource.current_version_id,
          );
          if (!version) return null;
          const acknowledged = data.acknowledgments.some(
            (a) => a.version_id === version.id,
          );
          return (
            <article
              key={resource.id}
              className="glass-card min-w-0 p-5 sm:p-6"
            >
              <p className="text-xs uppercase tracking-wider text-blue-200">
                {resource.category} · Version {version.version_number}
              </p>
              <h2 className="mt-2 break-words text-lg font-semibold">
                {resource.title}
              </h2>
              {resource.description ? (
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                  {resource.description}
                </p>
              ) : null}
              {version.release_notes ? (
                <p className="mt-3 break-words text-xs leading-6 text-slate-400">
                  Version notes: {version.release_notes}
                </p>
              ) : null}
              <a
                href={`/api/partner-resources/${resource.id}/download`}
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Download document ({Math.ceil(version.byte_size / 1024)} KB)
              </a>
              {resource.acknowledgment_required ? (
                acknowledged ? (
                  <p className="mt-4 text-sm text-emerald-200">
                    Receipt acknowledged for this version.
                  </p>
                ) : (
                  <form
                    action={acknowledgeResourceAction}
                    className="mt-4 border-t border-white/10 pt-4"
                  >
                    <input type="hidden" name="versionId" value={version.id} />
                    <p className="mb-3 max-w-xl text-xs leading-6 text-slate-400">
                      Steady Start requests acknowledgment of receipt. This is
                      not a legal signature or acceptance of terms, and does not
                      restrict document access.
                    </p>
                    <button className="min-h-11 rounded-xl border border-white/15 px-4 py-3 text-sm text-blue-200 hover:bg-white/5">
                      Acknowledge receipt
                    </button>
                  </form>
                )
              ) : null}
            </article>
          );
        })
      ) : (
        <p className="glass-card p-5 text-sm text-slate-400">
          No resources are currently published for your account.
        </p>
      )}
    </section>
  );
}
