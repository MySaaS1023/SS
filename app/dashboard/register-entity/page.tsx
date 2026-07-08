import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";
const selectClassName = `${inputClassName} appearance-none`;

export default function RegisterEntityPage() {
  return (
    <DashboardShell activeSection="register-entity">
      <section className="mx-auto max-w-4xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Register Entity</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Register your LLC or business entity with guided support.
          </h1>
        </div>

        <form className="mt-8 glass-card p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-white">
              Business owner name
              <input name="ownerName" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Business name
              <input name="businessName" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              State
              <input name="state" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Entity type
              <select name="entityType" defaultValue="" className={selectClassName}>
                <option value="" disabled>
                  Select one
                </option>
                <option>LLC</option>
                <option>Sole Proprietorship</option>
                <option>Corporation</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-white sm:col-span-2">
              Contact email
              <input name="email" type="email" className={inputClassName} />
            </label>
          </div>
          <button
            type="button"
            className={`${primaryButtonClass} force-white-btn mt-8 text-sm`}
          >
            Start Entity Registration
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
