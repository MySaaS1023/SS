"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(15,23,42,0.72)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(79,140,255,0.55)] focus:ring-4 focus:ring-[rgba(79,140,255,0.12)]";
const selectClassName = `${inputClassName} appearance-none`;

function isValidSimpleEmail(email: string) {
  const normalizedEmail = email.trim();
  const atIndex = normalizedEmail.indexOf("@");

  if (atIndex <= 0 || atIndex !== normalizedEmail.lastIndexOf("@")) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);
  return Boolean(domain && !domain.startsWith(".") && !domain.endsWith(".") && domain.includes("."));
}

export function IntakeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const businessName = String(formData.get("businessName") ?? "").trim();
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const buildMode = String(formData.get("buildMode") ?? "").trim();
    const businessDescription = String(formData.get("businessDescription") ?? "").trim();

    const payload = {
      fullName: businessName,
      email: contactEmail,
      phone: String(formData.get("phone") ?? "").trim(),
      businessName,
      selectedPackage: buildMode,
      businessType: String(formData.get("businessType") ?? "").trim(),
      serviceModel: String(formData.get("businessType") ?? "").trim(),
      integrations: "AI website builder intake",
      projectGoals: businessDescription,
      extraNotes: [
        `Industry: ${String(formData.get("industry") ?? "").trim()}`,
        `Brand colors: ${String(formData.get("brandColors") ?? "").trim()}`,
        `Pages needed: ${String(formData.get("pagesNeeded") ?? "").trim()}`,
        `Social links: ${String(formData.get("socialLinks") ?? "").trim()}`,
        `Existing domain: ${String(formData.get("existingDomain") ?? "").trim()}`,
        `Logo upload: ${formData.get("logoUpload") instanceof File ? (formData.get("logoUpload") as File).name : "Not provided"}`,
      ].join("\n"),
    };

    setFormError("");

    if (!businessName || !contactEmail || !buildMode || !businessDescription) {
      setFormError("Please complete your business name, email, website option, and description.");
      return;
    }

    if (!isValidSimpleEmail(contactEmail)) {
      setFormError("Please enter a valid contact email.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/send-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        setFormError(
          result.error ?? "Something went wrong while submitting your request. Please try again in a moment.",
        );
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("WEBSITE_BUILDER_INTAKE_FAILURE", error);
      setFormError("Something went wrong while submitting your request. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <p className="section-kicker">Website Intake Submitted</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">
          Create your account to continue.
        </h1>
        <p className="mt-5 text-base leading-8 text-[var(--muted)]">
          Your website details were saved. Create an account or log in to continue
          into your private website builder dashboard.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/login?mode=signup" className={`${primaryButtonClass} force-white-btn text-sm`}>
            Create Account
          </Link>
          <Link href="/login" className={`${secondaryButtonClass} text-sm`}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mx-auto max-w-4xl p-6 sm:p-8">
      <div className="max-w-2xl">
        <p className="section-kicker">Start Building</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          Tell AI what kind of website to build.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)] sm:text-base">
          Share the basics now. After submitting, you will create an account or log
          in to continue inside your private website builder dashboard.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-white">
          Business name
          <input name="businessName" type="text" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Business type
          <select name="businessType" required defaultValue="" className={selectClassName}>
            <option value="" disabled>
              Select one
            </option>
            <option value="Products">Products</option>
            <option value="Services">Services</option>
            <option value="Both">Both</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-white">
          Industry
          <input name="industry" type="text" className={inputClassName} placeholder="Cleaning, clothing, coaching, etc." />
        </label>
        <label className="block text-sm font-medium text-white">
          Do you want to:
          <select name="buildMode" required defaultValue="" className={selectClassName}>
            <option value="" disabled>
              Select one
            </option>
            <option value="Customize with templates">Customize with templates</option>
            <option value="Let AI generate my website">Let AI generate my website</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-white sm:col-span-2">
          Business description
          <textarea
            name="businessDescription"
            required
            className={`${inputClassName} min-h-32 resize-y`}
            placeholder="Tell us what your business does, who you help, and what you want the website to say."
          />
        </label>
        <label className="block text-sm font-medium text-white">
          Brand colors
          <input name="brandColors" type="text" className={inputClassName} placeholder="Blue, black, cream, etc." />
        </label>
        <label className="block text-sm font-medium text-white">
          Logo upload
          <input name="logoUpload" type="file" accept="image/*" className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white sm:col-span-2">
          Pages needed
          <input name="pagesNeeded" type="text" className={inputClassName} placeholder="Home, About, Contact, Services, Shop, FAQ" />
        </label>
        <label className="block text-sm font-medium text-white">
          Contact email
          <input name="contactEmail" type="email" required className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Phone number
          <input name="phone" type="tel" className={inputClassName} />
        </label>
        <label className="block text-sm font-medium text-white">
          Social links
          <input name="socialLinks" type="text" className={inputClassName} placeholder="Instagram, Facebook, TikTok, LinkedIn" />
        </label>
        <label className="block text-sm font-medium text-white">
          Existing domain, if any
          <input name="existingDomain" type="text" className={inputClassName} placeholder="yourbusiness.com" />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${primaryButtonClass} force-white-btn mt-8 w-full justify-center text-sm disabled:opacity-80`}
      >
        {isSubmitting ? "Submitting..." : "Continue"}
      </button>

      {formError ? <p className="mt-4 text-sm font-medium text-[#fca5a5]">{formError}</p> : null}
    </form>
  );
}
