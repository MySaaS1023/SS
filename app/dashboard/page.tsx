import Link from "next/link";

import { RecentWebsites } from "@/components/builder/recent-websites";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const buildOptions = [
  {
    title: "Let AI Build My Website",
    description: "Answer a few questions and generate a complete website.",
    cta: "Start AI Builder",
    href: "/dashboard/ai-builder",
  },
  {
    title: "Start With a Template",
    description: "Choose a professionally designed layout and customize it.",
    cta: "Browse Templates",
    href: "/dashboard/templates",
  },
  {
    title: "Build From Scratch",
    description: "Start with a blank canvas and create your site your way.",
    cta: "Start Blank Site",
    href: "/dashboard/create-website?type=blank",
  },
];

export default function DashboardHomePage() {
  return (
    <DashboardShell activeSection="home">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Website Builder</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            What do you want to build today?
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Start with a template, customize your own site, or let AI generate a
            complete website for you.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {buildOptions.map((option) => (
            <article key={option.title} className="glass-card flex flex-col p-6">
              <div className="mb-7 h-32 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(20,115,255,0.22),rgba(255,255,255,0.06))]" />
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {option.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">
                {option.description}
              </p>
              <Link
                href={option.href}
                className={`${option.title.includes("AI") ? primaryButtonClass : secondaryButtonClass} force-white-btn mt-6 justify-center text-sm`}
              >
                {option.cta}
              </Link>
            </article>
          ))}
        </div>

        <RecentWebsites />
      </section>
    </DashboardShell>
  );
}
