import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

const platformFeatures = [
  "AI Website Builder",
  "Beautiful Templates",
  "Business Dashboard",
  "AI Automations",
  "Products & Services",
  "Marketing Tools",
];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";

export default function PlatformComingSoonPage() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-8 h-72 w-72 rounded-full bg-[#1473ff]/20 blur-[110px]" />
        <div className="absolute right-[-6rem] bottom-8 h-80 w-80 rounded-full bg-[#8b5cf6]/18 blur-[120px]" />
      </div>
      <PageContainer className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Coming Soon</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Steady Start Platform
          </h1>
          <h2 className="mt-4 text-2xl font-semibold text-white">Coming Soon</h2>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            We&apos;re building an AI-powered platform that will allow entrepreneurs
            to create, manage, and grow their businesses from one place.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feature) => (
            <article key={feature} className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">{feature}</h2>
              <p className="mt-4 w-fit rounded-full bg-[rgba(79,140,255,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#bfdbfe]">
                Coming Soon
              </p>
            </article>
          ))}
        </div>

        <form className="glass-card mx-auto mt-12 max-w-2xl p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
              Join the waitlist
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Be the first to know when the Steady Start platform opens.
            </p>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-white">
              Name
              <input name="name" type="text" required className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-white">
              Email
              <input name="email" type="email" required className={inputClassName} />
            </label>
          </div>
          <button
            type="submit"
            className={`${primaryButtonClass} force-white-btn mt-7 w-full justify-center text-sm`}
          >
            Join the Waitlist
          </button>
        </form>
      </PageContainer>
    </section>
  );
}
