import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass } from "@/lib/styles";

const features = [
  {
    title: "AI Website Builder",
    description:
      "Generate and edit pages, sections, navigation, SEO, images, copy, colors, and layouts with AI guidance.",
  },
  {
    title: "Business Dashboard",
    description:
      "Bring customers, projects, orders, invoices, files, calendar, marketing, and AI history into one workspace.",
  },
  {
    title: "Customer Management",
    description:
      "Track leads, customers, notes, appointments, orders, projects, and customer portal activity.",
  },
  {
    title: "Scheduling",
    description:
      "Support availability, appointments, bookings, service calls, consultations, and team calendars.",
  },
  {
    title: "Invoices and Payments",
    description:
      "Prepare estimates, invoices, checkout flows, payment tracking, and billing history for service and product businesses.",
  },
  {
    title: "Marketing Automation",
    description:
      "Create emails, social posts, blog content, promotions, review requests, and local visibility campaigns.",
  },
  {
    title: "Products and Orders",
    description:
      "Plan product catalogs, collections, inventory, orders, coupons, shipping, taxes, reviews, and analytics.",
  },
  {
    title: "AI Assistant",
    description:
      "Ask Steady Start to build pages, create products, draft proposals, write emails, generate posts, or recommend improvements.",
  },
];

export default function FeaturesPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Features</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Build, manage, and grow your business with AI.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Steady Start is the foundation for an all-in-one platform where service
            and product businesses can run the work that usually lives across too
            many tools.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="glass-card p-6">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/start-free" className={`${primaryButtonClass} force-white-btn text-sm`}>
            Start Free
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
