"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PAYMENT_LINKS } from "@/lib/payment-links";
import { PackageKey, pricingPackages } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.05)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(59,130,246,0.35)] focus:ring-4 focus:ring-[rgba(59,130,246,0.12)]";

type IntakeFormProps = {
  selectedPackage?: PackageKey;
};

const packageLabelMap: Record<PackageKey, string> = {
  starter: "Starter",
  business: "Business",
  premium: "Premium",
};

export function IntakeForm({ selectedPackage }: IntakeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
      selectedPackage:
        packageLabelMap[String(formData.get("selectedPackage")) as PackageKey] ?? "",
      businessType: String(formData.get("businessType") ?? ""),
      serviceModel: String(formData.get("serviceModel") ?? ""),
      integrations: String(formData.get("integrations") ?? ""),
      projectGoals: String(formData.get("projectGoals") ?? ""),
      extraNotes: String(formData.get("extraNotes") ?? ""),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/send-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to send project request.");
      }

      router.push("/success?type=request");
    } catch {
      window.alert("There was a problem sending your project details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)] sm:p-8"
      >
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Project Intake
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Tell us what you need and we&apos;ll guide the next step.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)] sm:text-base">
            Choose your package, share your business details, and move into a simpler
            done-for-you website launch process.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-white">
            Full Name
            <input
              name="fullName"
              type="text"
              className={inputClassName}
              placeholder="Your full name"
              required
            />
          </label>
          <label className="block text-sm font-medium text-white">
            Email
            <input
              name="email"
              type="email"
              className={inputClassName}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block text-sm font-medium text-white">
            Phone
            <input
              name="phone"
              type="tel"
              className={inputClassName}
              placeholder="(555) 555-5555"
            />
          </label>
          <label className="block text-sm font-medium text-white">
            Business Name
            <input
              name="businessName"
              type="text"
              className={inputClassName}
              placeholder="Your business name"
            />
          </label>
          <label className="block text-sm font-medium text-white">
            Which package are you interested in?
            <select
              name="selectedPackage"
              className={inputClassName}
              defaultValue={selectedPackage ?? ""}
              required
            >
              <option value="" disabled={!selectedPackage}>
                Select a package
              </option>
              <option value="starter">Starter</option>
              <option value="business">Business</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-white">
            What type of business do you have?
            <input
              name="businessType"
              type="text"
              className={inputClassName}
              placeholder="Brief business type"
            />
          </label>
          <label className="block text-sm font-medium text-white">
            Is your business service-based or product-based?
            <select name="serviceModel" className={inputClassName} defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              <option value="Service">Service</option>
              <option value="Product">Product</option>
              <option value="Both">Both</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-white">
            Do you need bookings or integrations?
            <input
              name="integrations"
              type="text"
              className={inputClassName}
              placeholder="Booking, calendar, forms, CRM, or other tools"
            />
          </label>
          <label className="block text-sm font-medium text-white sm:col-span-2">
            Tell us about your website goals
            <textarea
              name="projectGoals"
              className={`${inputClassName} min-h-32 resize-y`}
              placeholder="What should the website help your business do?"
            />
          </label>
          <label className="block text-sm font-medium text-white sm:col-span-2">
            Anything else we should know?
            <textarea
              name="extraNotes"
              className={`${inputClassName} min-h-28 resize-y`}
              placeholder="Share anything helpful for planning your project."
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            Review your project details, then use the payment options to secure your
            package.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)] disabled:opacity-80`}
          >
            {isSubmitting ? "Sending..." : "Continue"}
          </button>
        </div>
      </form>

      <aside className="space-y-5">
        <div className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Package Summary
          </p>
          <div className="mt-5 space-y-4">
            {pricingPackages.map((pkg) => (
              <div
                key={pkg.key}
                className={`rounded-[1.5rem] border p-4 ${
                  selectedPackage === pkg.key
                    ? "border-[rgba(59,130,246,0.28)] bg-[rgba(59,130,246,0.12)]"
                    : "border-[var(--line)] bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-semibold text-white">{pkg.name}</p>
                  <p className="text-base font-semibold text-white">{pkg.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)]">
          <p className="text-lg font-semibold text-white">Best for founders</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            If you want a site built for you instead of piecing together a DIY builder,
            this is where your project starts.
          </p>
        </div>
      </aside>

      <div
        id="payment-options"
        className="glass-panel rounded-[2rem] border border-[var(--line)] p-6 shadow-[var(--shadow)] lg:col-span-2 sm:p-8"
      >
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Payment
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Choose your payment link and secure your website build.
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)] sm:text-base">
            Pick the package that matches your project scope. The matching option is
            highlighted if you arrived here from a package-specific link.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {pricingPackages.map((pkg) => {
            const isSelected = selectedPackage === pkg.key;

            return (
              <div
                key={pkg.key}
                className={`rounded-[1.75rem] border p-5 shadow-sm transition ${
                  isSelected
                    ? "border-[rgba(59,130,246,0.28)] bg-[rgba(59,130,246,0.1)] shadow-[var(--shadow)] ring-1 ring-[rgba(59,130,246,0.16)]"
                    : "border-[var(--line)] bg-[rgba(255,255,255,0.04)]"
                }`}
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  {isSelected ? "Selected Package" : "Secure Your Build"}
                </p>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-white">{pkg.name}</p>
                  <p className="mt-2 text-base font-medium text-[var(--muted)]">{pkg.price}</p>
                </div>
                <a
                  href={PAYMENT_LINKS[pkg.key]}
                  className={`${primaryButtonClass} force-white-btn mt-6 text-sm shadow-[var(--shadow)]`}
                  aria-label={`Pay for ${pkg.name} with Stripe`}
                >
                  {`Pay for ${pkg.name} - ${pkg.price}`}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
