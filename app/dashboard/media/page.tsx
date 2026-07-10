import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass } from "@/lib/styles";

export default function MediaLibraryPage() {
  return (
    <DashboardShell activeSection="media">
      <section className="mx-auto max-w-5xl">
        <div className="glass-card p-8 sm:p-10">
          <p className="section-kicker">Media Library</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Upload and organize your website media.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Logos, product photos, portfolio images, and brand assets will appear
            here.
          </p>
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-white/6 p-10 text-center">
            <p className="text-sm leading-7 text-[var(--muted)]">
              No media uploaded yet.
            </p>
            <button
              type="button"
              className={`${primaryButtonClass} force-white-btn mt-5 text-sm`}
            >
              Upload Media
            </button>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
