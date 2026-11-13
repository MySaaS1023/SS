import { buildNoIndexMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { BookingForm } from "@/components/scheduling/booking-form";
import { publicSchedule } from "@/lib/scheduling/server";
export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("Launch Consultation | Steady Start LLC", "Request a Steady Start consultation to discuss your business goals, website, and next steps.");
export default async function ConsultationPage() {
  const settings = await publicSchedule();
  return (
    <section className="py-12 sm:py-20">
      <PageContainer>
        <div className="mx-auto max-w-3xl">
          <p className="section-kicker">Let’s plan your next step</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Steady Start — Launch Consultation
          </h1>
          <p className="mt-5 text-[var(--muted)]">
            Talk through your business goals, project scope, website
            requirements, branding and timeline in a {settings.durationMinutes}
            -minute consultation.
          </p>
          <div className="mt-8">
            {settings.enabled ? (
              <BookingForm businessTimeZone={settings.timeZone} />
            ) : (
              <div className="glass-card p-6">
                <p className="text-[var(--muted)]">
                  Online consultation requests are not currently open. Please
                  contact Steady Start to arrange a time.
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center text-[var(--primary)] underline"
                  href="/contact"
                >
                  Contact Steady Start
                </Link>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
