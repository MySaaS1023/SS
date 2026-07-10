import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const creationOptions = [
  {
    title: "Let AI Build My Website",
    description: "Answer a few questions and generate a complete editable website.",
    href: "/dashboard/ai-builder",
    cta: "Start AI Builder",
    primary: true,
  },
  {
    title: "Start With a Template",
    description: "Choose a professionally designed layout and customize it.",
    href: "/dashboard/templates",
    cta: "Browse Templates",
  },
  {
    title: "Build From Scratch",
    description: "Open a blank website canvas and build your site your way.",
    href: "/dashboard/websites?new=blank",
    cta: "Start Blank Site",
  },
];

export default function CreateWebsitePage() {
  return (
    <DashboardShell activeSection="create-website">
      <section className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="section-kicker">Create Website</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
            Choose how you want to start.
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            Generate your website with AI, customize a template, or begin with a
            blank canvas.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {creationOptions.map((option) => (
            <article key={option.title} className="glass-card flex flex-col p-6">
              <div className="mb-6 h-32 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(20,115,255,0.22),rgba(255,255,255,0.06))]" />
              <h2 className="text-2xl font-semibold text-white">{option.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">
                {option.description}
              </p>
              <Link
                href={option.href}
                className={`${
                  option.primary ? primaryButtonClass : secondaryButtonClass
                } force-white-btn mt-6 justify-center text-sm`}
              >
                {option.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
