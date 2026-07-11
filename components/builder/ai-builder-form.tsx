"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";
const selectClassName = `${inputClassName} appearance-none`;

export function AiBuilderForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      websiteName: String(form.get("websiteName") ?? ""),
      businessName: String(form.get("businessName") ?? ""),
      businessType: String(form.get("businessType") ?? ""),
      industry: String(form.get("industry") ?? ""),
      businessDescription: String(form.get("businessDescription") ?? ""),
      targetAudience: String(form.get("targetAudience") ?? ""),
      productsOrServices: String(form.get("productsOrServices") ?? ""),
      preferredStyle: String(form.get("preferredStyle") ?? ""),
      primaryColor: String(form.get("primaryColor") ?? ""),
      secondaryColor: String(form.get("secondaryColor") ?? ""),
      pagesNeeded: String(form.get("pagesNeeded") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      phone: String(form.get("phone") ?? ""),
      socialLinks: String(form.get("socialLinks") ?? ""),
      domain: String(form.get("domain") ?? ""),
      mainCallToAction: String(form.get("mainCallToAction") ?? ""),
    };

    try {
      const response = await fetch("/api/websites/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to generate website.");
      }

      router.push(`/dashboard/websites/${result.website.id}/edit`);
    } catch (submitError) {
      console.error("AI_BUILDER_SUBMIT_ERROR", submitError);
      setError(submitError instanceof Error ? submitError.message : "Unable to generate website.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 glass-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-white">
          Website name
          <input name="websiteName" type="text" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Business name
          <input name="businessName" type="text" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Business type
          <select name="businessType" defaultValue="" required className={selectClassName}>
            <option value="" disabled>
              Select one
            </option>
            <option>Products</option>
            <option>Services</option>
            <option>Both</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-white">
          Industry
          <input name="industry" type="text" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white sm:col-span-2">
          Business description
          <textarea
            name="businessDescription"
            required
            className={`${inputClassName} min-h-28 resize-y`}
          />
        </label>
        <label className="block text-sm font-medium text-white">
          Target audience
          <input name="targetAudience" type="text" className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Products or services
          <input name="productsOrServices" type="text" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Preferred style
          <input
            name="preferredStyle"
            type="text"
            className={inputClassName}
            placeholder="Modern, luxury, playful, minimal..."
          />
        </label>
        <label className="block text-sm font-medium text-white">
          Primary color
          <input name="primaryColor" type="text" className={inputClassName} placeholder="#1473FF" />
        </label>
        <label className="block text-sm font-medium text-white">
          Secondary color
          <input name="secondaryColor" type="text" className={inputClassName} placeholder="#0F172A" />
        </label>
        <label className="block text-sm font-medium text-white">
          Pages needed
          <input
            name="pagesNeeded"
            type="text"
            className={inputClassName}
            placeholder="Home, About, Services, Contact"
          />
        </label>
        <label className="block text-sm font-medium text-white">
          Contact email
          <input name="contactEmail" type="email" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Phone
          <input name="phone" type="tel" className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Main call-to-action
          <input name="mainCallToAction" type="text" className={inputClassName} placeholder="Book Now" />
        </label>
        <label className="block text-sm font-medium text-white">
          Social links
          <input name="socialLinks" type="text" className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Domain, if any
          <input name="domain" type="text" className={inputClassName} />
        </label>
      </div>
      {error ? <p className="mt-5 text-sm text-red-200">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonClass} force-white-btn mt-8 w-full justify-center text-sm sm:w-auto disabled:opacity-70`}
      >
        {isSubmitting ? "Generating..." : "Generate My Website"}
      </button>
    </form>
  );
}
