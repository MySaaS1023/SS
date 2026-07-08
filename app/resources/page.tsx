import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { secondaryButtonClass } from "@/lib/styles";

const resources = [
  {
    title: "AI Website Launch",
    description: "How AI can help generate business pages, SEO, calls to action, FAQs, policies, and editable layouts.",
  },
  {
    title: "Service Business Systems",
    description: "Planning CRM, scheduling, projects, estimates, invoices, files, and customer communication.",
  },
  {
    title: "Product Business Systems",
    description: "Organizing products, collections, inventory, orders, coupons, checkout, reviews, and analytics.",
  },
  {
    title: "Marketing Automation",
    description: "Using AI to create posts, emails, blogs, promotions, review requests, and local visibility campaigns.",
  },
];

export default function ResourcesPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Resources</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Learn how to build a business operating system.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Resources will help entrepreneurs understand business setup, AI websites,
            automation, customer management, products, services, and growth systems.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {resources.map((resource) => (
            <article key={resource.title} className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white">{resource.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {resource.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/quick-links" className={`${secondaryButtonClass} text-sm`}>
            View Quick Links
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
