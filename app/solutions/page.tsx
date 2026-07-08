import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const solutionGroups = [
  {
    title: "Service Businesses",
    examples: "Contractors, plumbers, HVAC, cleaning, landscaping, consultants, photographers, and local teams.",
    features: [
      "Services and bookings",
      "Availability and appointments",
      "Estimates and invoices",
      "Projects and files",
      "Vendor management",
      "Customer portal",
      "AI proposals and follow-up emails",
    ],
  },
  {
    title: "Product Businesses",
    examples: "Clothing, heat press stores, handmade goods, jewelry, candles, digital products, coffee shops, and online retail.",
    features: [
      "Products and collections",
      "Inventory and orders",
      "Checkout and coupons",
      "Shipping and taxes",
      "Customer records",
      "Product reviews",
      "AI descriptions, images, and categories",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Solutions</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            One platform for service and product businesses.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Steady Start is not trying to clone Shopify or Squarespace. It is being
            built as the AI operating system for entrepreneurs who need one place to
            launch, sell, schedule, manage, and grow.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {solutionGroups.map((group) => (
            <article key={group.title} className="glass-card p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {group.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{group.examples}</p>
              <ul className="mt-6 grid gap-3 text-sm text-white sm:grid-cols-2">
                {group.features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-[var(--line)] bg-white/6 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/start-free" className={`${primaryButtonClass} force-white-btn text-sm`}>
            Start Free
          </Link>
          <Link href="/features" className={`${secondaryButtonClass} text-sm`}>
            Explore Features
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
