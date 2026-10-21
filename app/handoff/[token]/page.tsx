import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { CompletionCard } from "@/components/handoff/completion-card";
import { resolvePublicHandoff } from "@/lib/handoff/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: { absolute: "Your website handoff | Steady Start" },
  description: "Your completed website, with thanks from Steady Start LLC.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: { canonical: null },
  openGraph: {
    title: "Your website handoff | Steady Start",
    description: "Your completed website, with thanks from Steady Start LLC.",
    url: "https://www.steadystartco.com",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Your website handoff | Steady Start",
    description: "Your completed website, with thanks from Steady Start LLC.",
    images: [],
  },
};

export default async function PublicHandoffPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let details;
  try {
    details = await resolvePublicHandoff(token);
  } catch {
    throw new Error("The handoff service is temporarily unavailable.");
  }
  if (!details) notFound();
  return (
    <section className="py-12 sm:py-20">
      <PageContainer>
        <CompletionCard details={details} />
      </PageContainer>
    </section>
  );
}
