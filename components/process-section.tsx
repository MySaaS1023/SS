import { processSteps } from "@/lib/site-data";

export function ProcessSection() {
  return (
    <section className="glass-card p-6 sm:p-8 lg:p-10">
      <div className="max-w-2xl">
        <p className="section-kicker">How It Works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          A simple path from idea to launch.
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {processSteps.map((step, index) => (
          <div
            key={step.title}
            className="glass-card p-6 transition duration-200 hover:-translate-y-1 hover:border-[rgba(59,130,246,0.22)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.1)]"
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
