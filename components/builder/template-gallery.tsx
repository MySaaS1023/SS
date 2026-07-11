"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { WebsiteTemplate } from "@/lib/builder/templates";
import { primaryButtonClass } from "@/lib/styles";

type TemplateGalleryProps = {
  templates: WebsiteTemplate[];
};

export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const router = useRouter();
  const [names, setNames] = useState<Record<string, string>>({});
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [error, setError] = useState("");

  async function handleUseTemplate(event: FormEvent<HTMLFormElement>, templateId: string) {
    event.preventDefault();
    setError("");

    const name = names[templateId]?.trim();

    if (!name) {
      setError("Enter a website name before using a template.");
      return;
    }

    setActiveTemplateId(templateId);

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          creationMethod: "template",
          templateId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to create website from template.");
      }

      router.push(`/dashboard/websites/${result.website.id}/edit`);
    } catch (templateError) {
      console.error("TEMPLATE_WEBSITE_CREATE_ERROR", templateError);
      setError(
        templateError instanceof Error
          ? templateError.message
          : "Unable to create website from template.",
      );
    } finally {
      setActiveTemplateId("");
    }
  }

  return (
    <>
      {error ? (
        <p className="mt-6 rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="glass-card overflow-hidden">
            <div className="border-b border-[var(--line)] bg-[rgba(255,255,255,0.04)] p-4">
              <div className="rounded-2xl border border-[var(--line)] bg-[rgba(7,11,20,0.82)] p-4">
                <div className="h-3 w-28 rounded-full" style={{ background: template.theme.primaryColor }} />
                <div className="mt-4 h-8 rounded-xl bg-white/12" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-xl bg-white/8" />
                  <div className="h-16 rounded-xl bg-white/8" />
                </div>
              </div>
            </div>
            <form onSubmit={(event) => handleUseTemplate(event, template.id)} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {template.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{template.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{template.description}</p>
              <label className="mt-5 block text-sm font-medium text-white">
                Website name
                <input
                  value={names[template.id] ?? ""}
                  onChange={(event) =>
                    setNames((current) => ({ ...current, [template.id]: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)]"
                  placeholder={`${template.name} site`}
                />
              </label>
              <button
                type="submit"
                disabled={activeTemplateId === template.id}
                className={`${primaryButtonClass} force-white-btn mt-5 w-full justify-center text-sm disabled:opacity-70`}
              >
                {activeTemplateId === template.id ? "Creating..." : "Use Template"}
              </button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
