import Link from "next/link";
import { notFound } from "next/navigation";
import { CompletionCard } from "@/components/handoff/completion-card";
import { getHandoffPreview, getHandoffForDelivery } from "@/lib/handoff/server";
import {
  GeneratedHandoffActions,
  DeactivateHandoffForm,
} from "@/components/handoff/admin-forms";
import { DeliveryHistory } from "@/components/handoff/delivery-history";
import { getSocialSettings } from "@/lib/social-settings";
import { HandoffError } from "@/lib/handoff/core";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Preview client handoff | Steady Start Admin",
  robots: { index: false, follow: false },
};

export default async function HandoffPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let details;
  try {
    details = await getHandoffPreview(id);
  } catch (error) {
    if (error instanceof HandoffError && error.code === "validation")
      notFound();
    return (
      <div role="alert" className="glass-card p-6 text-slate-300">
        <p>
          Preview is unavailable. Check the handoff configuration and try again.
        </p>
        <Link
          href="/admin/handoffs"
          className="mt-4 inline-flex min-h-11 items-center text-[#bfdbfe] underline"
        >
          Back to handoffs
        </Link>
      </div>
    );
  }
  if (!details) notFound();
  const management = await getHandoffForDelivery(id);
  const socialSettings = await getSocialSettings();
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-300/20 bg-blue-400/10 p-4">
        <p className="text-sm leading-7 text-blue-100">
          Administrator preview — this does not activate or share a handoff
          link.
        </p>
        <Link
          href="/admin/handoffs"
          className="inline-flex min-h-11 items-center text-sm text-[#bfdbfe] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-300"
        >
          Back to handoffs
        </Link>
      </div>
      <CompletionCard details={details} socialSettings={socialSettings} />
      {management?.status === "active" && management.url ? (
        <div className="mt-8">
          <GeneratedHandoffActions
            handoff={{ ...management, url: management.url }}
          />
          <DeactivateHandoffForm id={id} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">
          This handoff is inactive and cannot be sent.
        </p>
      )}
      <DeliveryHistory handoffId={id} />
    </div>
  );
}
