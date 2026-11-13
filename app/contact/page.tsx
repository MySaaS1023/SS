import { publicPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { OceanHero } from "@/components/ocean-brand";
import { PageContainer } from "@/components/page-container";
import { supportEmail } from "@/lib/site-data";

export const metadata = publicPageMetadata("/contact");

export default function ContactPage() {
  return (
    <div className="public-ocean-page">
      <OceanHero
        eyebrow="Contact"
        title="Need Help Before You Start?"
        description="Reach out with questions about business setup, website options, automations, or the best next step for your business."
      >
        <div className="contact-facts mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${supportEmail}`}
            className="ocean-card flex min-h-20 flex-col items-center justify-center gap-2 px-4 py-4 text-center text-[var(--brand-text-navy)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6 text-[var(--brand-lagoon-teal)]"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            <strong className="text-sm">Email Us</strong>
            <span className="break-all text-xs">{supportEmail}</span>
          </a>
          <Link
            href="/consultation"
            className="ocean-card flex min-h-20 flex-col items-center justify-center gap-2 px-4 py-4 text-center text-[var(--brand-text-navy)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6 text-[var(--brand-lagoon-teal)]"
            >
              <rect x="4" y="5" width="16" height="16" rx="2" />
              <path d="M8 2v6m8-6v6M4 11h16" />
            </svg>
            <strong className="text-sm">Launch Consultation</strong>
            <span className="text-xs">Talk through your next step</span>
          </Link>
        </div>
      </OceanHero>
      <section
        className="ocean-content py-8 sm:py-10"
        aria-label="Contact Steady Start"
      >
        <PageContainer>
          <ContactForm />
        </PageContainer>
      </section>
    </div>
  );
}
