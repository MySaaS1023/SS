"use client";

import { FormEvent, useState } from "react";

import { PAYMENT_LINKS } from "@/lib/payment-links";
import { PackageKey, pricingPackages } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.05)] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(59,130,246,0.35)] focus:ring-4 focus:ring-[rgba(59,130,246,0.12)]";
const selectClassName = `${inputClassName} appearance-none bg-[#0f172a] text-white [color-scheme:dark]`;

type IntakeFormProps = {
  selectedPackage?: PackageKey;
};

const packageLabelMap: Record<PackageKey, string> = {
  starter: "Starter Package",
  business: "Business Package",
  premium: "Premium Package",
};

function isValidSimpleEmail(email: string) {
  const normalizedEmail = email.trim();
  const atIndex = normalizedEmail.indexOf("@");

  if (atIndex <= 0 || atIndex !== normalizedEmail.lastIndexOf("@")) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);

  if (!domain || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  return domain.includes(".");
}

export function IntakeForm({ selectedPackage }: IntakeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? "").trim(),
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

    setFormError("");
    setSuccessMessage("");

    if (!isValidSimpleEmail(payload.email)) {
      setFormError("Please enter a valid email address.");
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

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        const message =
          result.error ??
          "We could not send your project details right now. Please check your information and try again.";
        console.error("[intake-form] Submission failed:", {
          status: response.status,
          result,
        });
        setFormError(message);
        return;
      }

      setSuccessMessage(
        result.message ??
          "Your project details were sent successfully. Please continue to secure your package.",
      );
    } catch (error) {
      console.error("[intake-form] Unexpected submission error:", error);
      setFormError(
        "We could not send your project details right now. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:items-start lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="glass-card self-start p-6 sm:p-8">
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
              className={selectClassName}
              defaultValue={selectedPackage ?? ""}
              style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
              required
            >
              <option
                value=""
                disabled={!selectedPackage}
                style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
              >
                Select a package
              </option>
              <option value="starter" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Starter Package
              </option>
              <option value="business" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Business Package
              </option>
              <option value="premium" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Premium Package
              </option>
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
            <select
              name="serviceModel"
              className={selectClassName}
              defaultValue=""
              style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
            >
              <option value="" disabled style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Select one
              </option>
              <option value="Service" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Service
              </option>
              <option value="Product" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Product
              </option>
              <option value="Both" style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>
                Both
              </option>
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

        {formError ? (
          <p className="mt-4 text-sm text-[#fca5a5]">{formError}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 text-sm text-[#86efac]">{successMessage}</p>
        ) : null}
      </form>

      <aside className="self-start space-y-5">
        <div className="glass-card p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            What happens next
          </p>
          <ol className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <li className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">1.</span>
              We review your project details
            </li>
            <li className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">2.</span>
              We confirm the best package for your build
            </li>
            <li className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">3.</span>
              You secure your payment
            </li>
            <li className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">4.</span>
              We begin your website setup
            </li>
          </ol>
        </div>

        <div className="glass-card p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Secure your build
          </p>
          <div className="mt-4 space-y-2.5">
            {pricingPackages.map((pkg) => {
              const isSelected = selectedPackage === pkg.key;

              return (
                <div
                  key={pkg.key}
                  className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                    isSelected
                      ? "border-[rgba(59,130,246,0.28)] bg-[rgba(59,130,246,0.1)] shadow-[var(--shadow)] ring-1 ring-[rgba(59,130,246,0.16)]"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">{pkg.name}</p>
                      <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                        {pkg.price}
                      </p>
                    </div>
                    <a
                      href={PAYMENT_LINKS[pkg.key]}
                      className={`${primaryButtonClass} force-white-btn shrink-0 px-4 py-2 text-sm shadow-[var(--shadow)]`}
                      aria-label={`Pay for ${pkg.name} with Stripe`}
                    >
                      {pkg.shortName}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Workflow Preview
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            See how we take a business idea from setup to launch.
          </p>
          <div className="mt-4 h-[200px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(15,23,42,0.92))] p-4 shadow-[0_18px_36px_rgba(2,6,23,0.24)]">
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
              </div>
              <div className="mt-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.72)] p-3">
                <div className="h-2.5 w-20 rounded-full bg-[rgba(255,255,255,0.12)]" />
                <div className="mt-3 h-16 rounded-2xl bg-[linear-gradient(135deg,rgba(59,130,246,0.24),rgba(139,92,246,0.2))] p-3">
                  <div className="h-2.5 w-24 rounded-full bg-white/70" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-white/25" />
                  <div className="relative mt-3 h-5 overflow-hidden">
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/85">
                      Business idea
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/85 opacity-0">
                      Website build
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/85 opacity-0">
                      Design makeover
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/85 opacity-0">
                      Launch ready
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-10 rounded-xl bg-white/6" />
                  <div className="h-10 rounded-xl bg-[rgba(59,130,246,0.14)]" />
                  <div className="h-10 rounded-xl bg-white/6" />
                </div>
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
              <div className="workflow-progress relative h-1.5 w-full rounded-full bg-[linear-gradient(90deg,rgba(59,130,246,0.35),rgba(139,92,246,0.35))]" />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: "Idea", accent: "bg-[#60a5fa] text-[#bfdbfe]" },
                { label: "Build", accent: "bg-[#60a5fa] text-[#bfdbfe]" },
                { label: "Makeover", accent: "bg-[#a78bfa] text-[#c4b5fd]" },
                { label: "Launch", accent: "bg-[#a78bfa] text-[#c4b5fd]" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="workflow-step rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-2 text-center"
                >
                  <span className={`workflow-step-dot mx-auto block h-2 w-2 rounded-full ${step.accent.split(" ")[0]}`} />
                  <p className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${step.accent.split(" ")[1]}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
