"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { WebsitePage, WebsiteRecord } from "@/lib/builder/types";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type WebsiteEditorProps = {
  websiteId: string;
};

export function WebsiteEditor({ websiteId }: WebsiteEditorProps) {
  const [website, setWebsite] = useState<WebsiteRecord | null>(null);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPage =
    website?.site_content.pages.find((page) => page.id === selectedPageId) ??
    website?.site_content.pages[0];

  async function loadWebsite() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/websites/${websiteId}`, { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load website.");
      }

      setWebsite(result.website);
      setSelectedPageId(result.website.site_content.pages[0]?.id ?? "");
    } catch (loadError) {
      console.error("WEBSITE_EDITOR_LOAD_ERROR", loadError);
      setError(loadError instanceof Error ? loadError.message : "Unable to load website.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateSelectedPage(patch: Partial<WebsitePage>) {
    setSavedMessage("");
    setWebsite((current) => {
      if (!current || !selectedPage) return current;

      return {
        ...current,
        site_content: {
          ...current.site_content,
          pages: current.site_content.pages.map((page) =>
            page.id === selectedPage.id ? { ...page, ...patch } : page,
          ),
        },
      };
    });
  }

  async function saveWebsite() {
    if (!website) return;

    setIsSaving(true);
    setSavedMessage("");
    setError("");

    try {
      const response = await fetch(`/api/websites/${website.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteContent: website.site_content,
          theme: website.theme,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to save website.");
      }

      setWebsite(result.website);
      setSavedMessage("Saved");
    } catch (saveError) {
      console.error("WEBSITE_EDITOR_SAVE_ERROR", saveError);
      setError(saveError instanceof Error ? saveError.message : "Unable to save website.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    void loadWebsite();
  }, [websiteId]);

  if (isLoading) {
    return <div className="glass-card p-8 text-[var(--muted)]">Loading editor...</div>;
  }

  if (error && !website) {
    return <div className="glass-card p-8 text-red-200">{error}</div>;
  }

  if (!website || !selectedPage) {
    return <div className="glass-card p-8 text-[var(--muted)]">Website not found.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="glass-card h-fit p-5">
        <Link href="/dashboard/websites" className="text-sm text-[var(--muted)] hover:text-white">
          ← Back to My Websites
        </Link>
        <h1 className="mt-5 text-2xl font-semibold text-white">{website.name}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Draft website editor</p>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Pages
          </p>
          <div className="mt-3 grid gap-2">
            {website.site_content.pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setSelectedPageId(page.id)}
                className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                  selectedPage.id === page.id
                    ? "bg-[rgba(79,140,255,0.18)] text-white"
                    : "bg-white/6 text-[var(--muted)] hover:bg-white/10 hover:text-white"
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-6 block text-sm font-medium text-white">
          Primary color
          <input
            value={website.theme.primaryColor}
            onChange={(event) =>
              setWebsite((current) =>
                current
                  ? {
                      ...current,
                      theme: { ...current.theme, primaryColor: event.target.value },
                    }
                  : current,
              )
            }
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none"
          />
        </label>
      </aside>

      <section className="grid gap-6">
        <div className="glass-card p-5 sm:p-7">
          <div className="grid gap-5">
            <label className="block text-sm font-medium text-white">
              Heading text
              <input
                value={selectedPage.heading}
                onChange={(event) => updateSelectedPage({ heading: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-white">
              Body text
              <textarea
                value={selectedPage.body}
                onChange={(event) => updateSelectedPage({ body: event.target.value })}
                className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm leading-7 text-white outline-none"
              />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-white">
                Button label
                <input
                  value={selectedPage.buttonLabel}
                  onChange={(event) => updateSelectedPage({ buttonLabel: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-white">
                Button link
                <input
                  value={selectedPage.buttonLink}
                  onChange={(event) => updateSelectedPage({ buttonLink: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none"
                />
              </label>
            </div>
          </div>

          {error ? <p className="mt-5 text-sm text-red-200">{error}</p> : null}
          {savedMessage ? <p className="mt-5 text-sm text-emerald-200">{savedMessage}</p> : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveWebsite}
              disabled={isSaving}
              className={`${primaryButtonClass} force-white-btn text-sm disabled:opacity-70`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/dashboard/websites/${website.id}/preview`}
              className={`${secondaryButtonClass} text-sm`}
            >
              Preview Website
            </Link>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">
            Live preview
          </div>
          <div
            className="p-8"
            style={{
              background: `linear-gradient(135deg, ${website.theme.secondaryColor}, #020617)`,
            }}
          >
            <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 text-slate-950">
              <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: website.theme.primaryColor }}>
                {website.name}
              </p>
              <h2 className="mt-5 text-4xl font-bold tracking-[-0.04em]">{selectedPage.heading}</h2>
              <p className="mt-5 text-base leading-8 text-slate-600">{selectedPage.body}</p>
              <span
                className="mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-white"
                style={{ background: website.theme.primaryColor }}
              >
                {selectedPage.buttonLabel}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
