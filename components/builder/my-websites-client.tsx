"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { WebsiteRecord } from "@/lib/builder/types";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

function methodLabel(method: WebsiteRecord["creation_method"]) {
  if (method === "ai") return "AI Generated";
  if (method === "template") return "Template";
  return "Scratch";
}

export function MyWebsitesClient() {
  const [websites, setWebsites] = useState<WebsiteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  async function loadWebsites() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/websites", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load websites.");
      }

      setWebsites(result.websites);
    } catch (loadError) {
      console.error("WEBSITE_LIST_LOAD_ERROR", loadError);
      setError(loadError instanceof Error ? loadError.message : "Unable to load websites.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(websiteId: string) {
    setDeletingId(websiteId);
    setError("");

    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to delete website.");
      }

      setWebsites((current) => current.filter((website) => website.id !== websiteId));
    } catch (deleteError) {
      console.error("WEBSITE_DELETE_CLIENT_ERROR", deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete website.");
    } finally {
      setDeletingId("");
    }
  }

  useEffect(() => {
    void loadWebsites();
  }, []);

  if (isLoading) {
    return <div className="glass-card p-8 text-[var(--muted)]">Loading your websites...</div>;
  }

  if (error) {
    return (
      <div className="glass-card p-8">
        <p className="text-sm text-red-200">{error}</p>
        <button type="button" onClick={loadWebsites} className={`${secondaryButtonClass} mt-5 text-sm`}>
          Try Again
        </button>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="glass-card p-8 text-center sm:p-12">
        <p className="section-kicker">My Websites</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
          Your websites will appear here.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[var(--muted)]">
          No websites yet. Create your first website to get started.
        </p>
        <Link
          href="/dashboard/create-website"
          className={`${primaryButtonClass} force-white-btn mt-8 text-sm`}
        >
          Create Website
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {websites.map((website) => (
        <article
          key={website.id}
          className="glass-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              {methodLabel(website.creation_method)} · {website.status}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{website.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Last updated {new Date(website.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/websites/${website.id}/edit`}
              className={`${primaryButtonClass} force-white-btn text-sm`}
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/websites/${website.id}/preview`}
              className={`${secondaryButtonClass} text-sm`}
            >
              Preview
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(website.id)}
              disabled={deletingId === website.id}
              className={`${secondaryButtonClass} text-sm disabled:opacity-70`}
            >
              {deletingId === website.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
