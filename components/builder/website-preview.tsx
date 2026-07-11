"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { WebsiteRecord } from "@/lib/builder/types";
import { secondaryButtonClass } from "@/lib/styles";

type WebsitePreviewProps = {
  websiteId: string;
};

export function WebsitePreview({ websiteId }: WebsitePreviewProps) {
  const [website, setWebsite] = useState<WebsiteRecord | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWebsite() {
      try {
        const response = await fetch(`/api/websites/${websiteId}`, { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Unable to load preview.");
        }

        setWebsite(result.website);
      } catch (loadError) {
        console.error("WEBSITE_PREVIEW_LOAD_ERROR", loadError);
        setError(loadError instanceof Error ? loadError.message : "Unable to load preview.");
      }
    }

    void loadWebsite();
  }, [websiteId]);

  if (error) {
    return <div className="glass-card p-8 text-red-200">{error}</div>;
  }

  if (!website) {
    return <div className="glass-card p-8 text-[var(--muted)]">Loading preview...</div>;
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white text-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <p className="font-semibold">{website.name}</p>
        <nav className="flex flex-wrap gap-4 text-sm text-slate-500">
          {website.site_content.navigation.map((item) => (
            <span key={`${item.label}-${item.href}`}>{item.label}</span>
          ))}
        </nav>
      </div>
      {website.site_content.pages.map((page, index) => (
        <section
          key={page.id}
          className={`px-6 py-16 sm:px-12 ${index % 2 === 1 ? "bg-slate-50" : ""}`}
        >
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: website.theme.primaryColor }}>
              {page.title}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              {page.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">{page.body}</p>
            <span
              className="mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ background: website.theme.primaryColor }}
            >
              {page.buttonLabel}
            </span>
          </div>
        </section>
      ))}
      <div className="border-t border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <Link href={`/dashboard/websites/${website.id}/edit`} className={secondaryButtonClass}>
          Back to Editor
        </Link>
      </div>
    </div>
  );
}
