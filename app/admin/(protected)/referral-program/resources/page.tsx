import { requirePrivateAdministrator } from "@/lib/admin-management/private-page";
import { ResourceForm } from "@/components/partner-resources/resource-form";
import { adminResources } from "@/lib/partner-resources/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Partner Resources | Steady Start Admin",
  robots: { index: false, follow: false },
};
export default async function AdminPartnerResourcesPage() {
  await requirePrivateAdministrator();
  let data: Awaited<ReturnType<typeof adminResources>>;
  try {
    data = await adminResources();
  } catch {
    return (
      <section className="glass-card p-5 sm:p-6">
        <h1 className="text-2xl font-semibold">Partner Resources</h1>
        <p role="alert" className="mt-4 text-amber-200">
          Private document management is unavailable. Verify the approved
          resource migration and storage configuration.
        </p>
      </section>
    );
  }
  const partnerName = (id: string) => {
    const p = data.partners.find((p) => p.id === id);
    return p ? `${p.first_name} ${p.last_name}` : "Restricted partner";
  };
  return (
    <section className="min-w-0 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
          Referral Program
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Partner Resources
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Manage approved documents, private partner access, and version
          receipts. Replacing a file preserves previous versions and audit
          history.
        </p>
      </header>
      <details className="glass-card p-5 sm:p-6">
        <summary className="min-h-11 cursor-pointer text-lg font-semibold">
          Upload a new document
        </summary>
        <div className="mt-5">
          <ResourceForm partners={data.partners} />
        </div>
      </details>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Documents{" "}
          <span className="text-slate-400">({data.resources.length})</span>
        </h2>
        {data.resources.length ? (
          data.resources.map((resource) => {
            const versions = data.versions.filter(
                (v) => v.resource_id === resource.id,
              ),
              current = versions.find(
                (v) => v.id === resource.current_version_id,
              );
            return (
              <details
                key={`${resource.id}-${resource.revision}`}
                className="glass-card min-w-0 p-4 sm:p-5"
              >
                <summary className="cursor-pointer list-inside break-words py-2 text-sm font-semibold">
                  <span>{resource.title}</span>
                  <span className="ml-3 inline-block text-xs font-normal text-slate-400">
                    {resource.category} ·{" "}
                    {resource.published ? "Published" : "Unpublished"} · v
                    {current?.version_number ?? "—"} ·{" "}
                    {resource.target_partner_id
                      ? partnerName(resource.target_partner_id)
                      : "All approved partners"}
                  </span>
                </summary>
                <div className="mt-5">
                  <ResourceForm resource={resource} partners={data.partners} />
                </div>
                <details className="mt-5 border-t border-white/10 pt-4">
                  <summary className="cursor-pointer py-2 text-sm text-blue-200">
                    Versions and receipt history
                  </summary>
                  <div className="mt-3 space-y-4">
                    {versions.map((version) => {
                      const receipts = data.acknowledgments.filter(
                        (a) => a.version_id === version.id,
                      );
                      return (
                        <div
                          key={version.id}
                          className="rounded-xl border border-white/10 p-4 text-sm"
                        >
                          <p className="break-words font-medium">
                            Version {version.version_number} —{" "}
                            {version.original_filename}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(version.created_at).toLocaleString(
                              "en-US",
                              { timeZone: "UTC" },
                            )}{" "}
                            UTC · {Math.ceil(version.byte_size / 1024)} KB
                          </p>
                          {version.release_notes ? (
                            <p className="mt-2 whitespace-pre-wrap break-words text-slate-300">
                              {version.release_notes}
                            </p>
                          ) : null}
                          <a
                            className="mt-2 inline-flex min-h-11 items-center text-blue-200 underline"
                            href={`/api/partner-resources/${resource.id}/download?version=${version.id}`}
                          >
                            Download this version
                          </a>
                          <p className="text-xs text-slate-400">
                            Receipt acknowledgments: {receipts.length}
                          </p>
                          {receipts.map((a, i) => (
                            <p
                              key={`${a.partner_id}-${i}`}
                              className="mt-1 text-xs text-slate-400"
                            >
                              {partnerName(a.partner_id)} —{" "}
                              {new Date(a.acknowledged_at).toLocaleString(
                                "en-US",
                                { timeZone: "UTC" },
                              )}{" "}
                              UTC
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </details>
              </details>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-slate-400">
            No partner documents have been uploaded. No agreements or official
            policies are created automatically.
          </p>
        )}
      </div>
      <p className="text-xs text-slate-500">
        The latest 200 resources and 1,000 version/receipt records are shown.
        Existing historical records are retained.
      </p>
    </section>
  );
}
