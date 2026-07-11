import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const services = [
  {
    title: "Business Setup",
    items: [
      "EIN setup assistance",
      "Domain setup guidance",
      "Business phone and address setup",
      "Business bank account guidance",
      "DUNS registration guidance",
      "Launch checklist",
    ],
  },
  {
    title: "Custom Websites",
    items: [
      "Professional website design",
      "Mobile responsive pages",
      "Service or product sections",
      "Contact forms",
      "Booking or cart integration",
      "Basic SEO setup",
    ],
  },
  {
    title: "Advanced Web Solutions",
    items: [
      "Backend development",
      "Database setup",
      "Payment integration",
      "Client or admin portals",
      "API integrations",
      "Automations and workflows",
    ],
  },
  {
    title: "Branding",
    items: [
      "Brand direction",
      "Offer positioning",
      "Visual style guidance",
      "Website messaging support",
      "Launch presentation",
      "Professional online presence",
    ],
  },
  {
    title: "Marketing",
    items: [
      "Launch messaging",
      "Basic SEO setup",
      "Conversion-focused page structure",
      "Contact flow planning",
      "Social link setup",
      "Growth-ready foundation",
    ],
  },
];

export default function ServicesPage() {
  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Services</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            Business launch support that meets you where you are.
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
            Whether you need help organizing your business foundation, launching a
            professional website, or building something more advanced, Steady Start
            helps turn ideas into real launch-ready assets.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="glass-card flex flex-col p-7">
              <h2 className="text-2xl font-semibold text-white">{service.title}</h2>
              <ul className="mt-6 flex-1 space-y-3 text-sm leading-6 text-white">
                {service.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent-strong)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/get-started" className={`${primaryButtonClass} force-white-btn text-sm`}>
            Request Consultation
          </Link>
          <Link href="/pricing" className={`${secondaryButtonClass} text-sm`}>
            View Pricing
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
