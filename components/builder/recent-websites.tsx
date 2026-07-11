"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { WebsiteRecord } from "@/lib/builder/types";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export function RecentWebsites() {
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecentWebsites() {
      try {
        const response = await fetch("/api/websites", { cache: "no-store" });
        const result = await response.json();

        if (response.ok && result.success) {
          setWebsites(result.websites.slice(0, 3));
        }
      } catch (error) {
        console.error("RECENT_WEBSITES_LOAD_ERROR", error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRecentWebsites();
  }, []);

  return (
    <section className="mt-10 glass-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            Recent Websites
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            {isLoading
              ? "Loading your websites..."
              : websites.length > 0
                ? "Continue editing your latest websites."
                : "No websites yet. Create your first website to get started."}
          </p>
        </div>
        <Link href="/dashboard/create-website" className={`${primaryButtonClass} force-white-btn text-sm`}>
          Create Website
        </Link>
      </div>

      {websites.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {websites.map((website) => (
            <div
              key={website.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-white/6 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{website.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {website.creation_method} · {website.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/websites/${website.id}/edit`}
                  className={`${secondaryButtonClass} px-4 py-2 text-sm`}
                >
                  Edit
                </Link>
                <Link
                  href={`/dashboard/websites/${website.id}/preview`}
                  className={`${secondaryButtonClass} px-4 py-2 text-sm`}
                >
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
