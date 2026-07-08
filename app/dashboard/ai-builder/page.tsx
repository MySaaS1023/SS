import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";
const selectClassName = `${inputClassName} appearance-none`;

export default function AiBuilderPage() {
  return (
    <DashboardShell activeSection="ai-builder">
      <section className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="section-kicker">AI Builder</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Generate your website with AI.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Give Steady Start the details and generate a complete editable website
            foundation.
          </p>
        </div>

        <form className="mt-8 glass-card p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-white">
              Business name
              <input name="businessName" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Business type
              <select name="businessType" defaultValue="" className={selectClassName}>
                <option value="" disabled>
                  Select one
                </option>
                <option>Products</option>
                <option>Services</option>
                <option>Both</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-white">
              Industry
              <input name="industry" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Target audience
              <input name="targetAudience" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white sm:col-span-2">
              Business description
              <textarea name="description" className={`${inputClassName} min-h-28 resize-y`} />
            </label>
            <label className="block text-sm font-medium text-white">
              Desired website style
              <input name="style" type="text" className={inputClassName} placeholder="Modern, luxury, playful, minimal..." />
            </label>
            <label className="block text-sm font-medium text-white">
              Brand colors
              <input name="brandColors" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Logo upload
              <input name="logo" type="file" accept="image/*" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Pages needed
              <input name="pages" type="text" className={inputClassName} placeholder="Home, About, Shop, Services..." />
            </label>
            <label className="block text-sm font-medium text-white sm:col-span-2">
              Products/services to feature
              <textarea name="featured" className={`${inputClassName} min-h-24 resize-y`} />
            </label>
            <label className="block text-sm font-medium text-white">
              Contact email
              <input name="email" type="email" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Phone
              <input name="phone" type="tel" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Social links
              <input name="socialLinks" type="text" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Domain, if any
              <input name="domain" type="text" className={inputClassName} />
            </label>
          </div>
          <button
            type="button"
            className={`${primaryButtonClass} force-white-btn mt-8 w-full justify-center text-sm sm:w-auto`}
          >
            Generate My Website
          </button>
        </form>
      </section>
    </DashboardShell>
  );
}
