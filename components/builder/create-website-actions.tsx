"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

export function CreateWebsiteActions() {
  const router = useRouter();
  const [websiteName, setWebsiteName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleScratchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!websiteName.trim()) {
      setError("Enter a website name to start from scratch.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: websiteName,
          creationMethod: "scratch",
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to create website.");
      }

      router.push(`/dashboard/websites/${result.website.id}/edit`);
    } catch (createError) {
      console.error("SCRATCH_WEBSITE_CREATE_ERROR", createError);
      setError(
        createError instanceof Error ? createError.message : "Unable to create website.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-3">
      <article className="glass-card flex flex-col p-6">
        <div className="mb-6 h-32 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(20,115,255,0.22),rgba(255,255,255,0.06))]" />
        <h2 className="text-2xl font-semibold text-white">Generate with AI</h2>
        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">
          Answer a few questions and generate a complete editable website.
        </p>
        <Link
          href="/dashboard/ai-builder"
          className={`${primaryButtonClass} force-white-btn mt-6 justify-center text-sm`}
        >
          Start AI Builder
        </Link>
      </article>

      <article className="glass-card flex flex-col p-6">
        <div className="mb-6 h-32 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(255,255,255,0.06))]" />
        <h2 className="text-2xl font-semibold text-white">Start with a Template</h2>
        <p className="mt-3 flex-1 text-sm leading-7 text-[var(--muted)]">
          Choose a professionally designed layout and customize it.
        </p>
        <Link
          href="/dashboard/templates"
          className={`${secondaryButtonClass} mt-6 justify-center text-sm`}
        >
          Browse Templates
        </Link>
      </article>

      <article className="glass-card flex flex-col p-6">
        <div className="mb-6 h-32 rounded-[1.5rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(20,115,255,0.08))]" />
        <h2 className="text-2xl font-semibold text-white">Start from Scratch</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Create a blank website record and begin editing your homepage.
        </p>
        <form onSubmit={handleScratchSubmit} className="mt-5">
          <label className="block text-sm font-medium text-white">
            Website name
            <input
              value={websiteName}
              onChange={(event) => setWebsiteName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)]"
              placeholder="Example: Blue Sky Cleaning"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
          <button
            type="submit"
            disabled={isCreating}
            className={`${secondaryButtonClass} mt-5 w-full justify-center text-sm disabled:opacity-70`}
          >
            {isCreating ? "Creating..." : "Start Blank Site"}
          </button>
        </form>
      </article>
    </div>
  );
}
