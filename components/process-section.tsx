import { processSteps } from "@/lib/site-data";

export function ProcessSection() {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.94))] p-6 shadow-sm sm:p-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          How It Works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
          A simple process with clear momentum from day one.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {processSteps.map((step, index) => (
          <div
            key={step}
            className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-soft)] font-mono text-sm font-semibold text-[var(--accent-strong)]">
              0{index + 1}
            </span>
            <p className="mt-5 text-lg font-semibold text-[var(--foreground)]">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
