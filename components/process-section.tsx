import { processSteps } from "@/lib/site-data";

export function ProcessSection() {
  return (
    <section className="glass-panel rounded-[2.25rem] border border-[var(--line)] p-6 shadow-[var(--shadow)] sm:p-8 lg:p-10">
      <div className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          How It Works
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          A simple path from idea to launch.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {processSteps.map((step, index) => (
          <div
            key={step.title}
            className="rounded-[1.75rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-6 shadow-sm transition duration-200 hover:-translate-y-1"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(59,130,246,0.14)] font-mono text-sm font-semibold text-[#bfdbfe]">
              0{index + 1}
            </span>
            <p className="mt-5 text-xl font-semibold text-white">{step.title}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
