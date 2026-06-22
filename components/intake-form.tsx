"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { getServicePaymentLink } from "@/lib/payment-links";
import { ServiceKey, serviceOfferings } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[rgba(255,248,245,0.72)] px-4 py-3.5 text-sm text-[#141212] outline-none transition placeholder:text-[var(--muted)] focus:border-[#C88F95] focus:ring-4 focus:ring-[rgba(200,143,149,0.16)]";
const selectClassName = `${inputClassName} appearance-none bg-[#F8EFEB] text-[#141212]`;

type IntakeFormProps = {
  selectedPackage?: ServiceKey;
};

const serviceLabelMap: Record<ServiceKey, string> = {
  "business-setup": "Business Setup",
  "custom-website-bundle": "Custom Website Bundle",
  "custom-website-plus-bundle": "Custom Website+ Bundle",
  "complete-business-launch": "Complete Business Launch Packages",
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
  const [activePackage, setActivePackage] = useState<ServiceKey | "">(
    selectedPackage ?? "",
  );

  useEffect(() => {
    setActivePackage(selectedPackage ?? "");
  }, [selectedPackage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedServiceKey = String(formData.get("selectedPackage") ?? "") as ServiceKey;
    const selectedOffering = serviceOfferings.find(
      (offering) => offering.key === selectedServiceKey,
    );
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? ""),
      businessName: String(formData.get("businessName") ?? ""),
      selectedPackage: serviceLabelMap[selectedServiceKey] ?? "",
      businessType: String(formData.get("businessType") ?? ""),
      serviceModel: String(formData.get("serviceModel") ?? ""),
      integrations: String(formData.get("integrations") ?? ""),
      projectGoals: String(formData.get("projectGoals") ?? ""),
      extraNotes: String(formData.get("extraNotes") ?? ""),
    };
    console.log("Submitting intake form", payload);

    setFormError("");
    setSuccessMessage("");

    if (!selectedOffering) {
      setFormError("Please select a valid solution before continuing.");
      return;
    }

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

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !result.success) {
        const message =
          result.error ??
          "Something went wrong while submitting your request. Please try again in a moment.";
        console.error("[intake-form] Submission failed:", {
          status: response.status,
          result,
        });
        setFormError(message);
        return;
      }

      const paymentLink = getServicePaymentLink(selectedServiceKey);
      const isPaidPackage = selectedOffering.price.trim().startsWith("$");

      if (isPaidPackage) {
        if (!paymentLink) {
          setFormError(
            "This payment link is not configured yet. Please contact us before continuing.",
          );
          return;
        }

        window.location.assign(paymentLink);
        return;
      }

      setSuccessMessage(
        result.message ??
          "Your project details were sent successfully. We'll review your request and follow up with next steps.",
      );
    } catch (error) {
      console.error("INTAKE SUBMIT FAILURE", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Unknown submission error",
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
            Share your business details, choose the solution you&apos;re considering,
            and let us help map out the right next move for your launch.
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
            Which solution are you interested in?
            <select
              name="selectedPackage"
              className={selectClassName}
              value={activePackage}
              onChange={(event) => {
                setActivePackage(event.target.value as ServiceKey | "");
                setFormError("");
                setSuccessMessage("");
              }}
              style={{ backgroundColor: "#F8EFEB", color: "#141212" }}
              required
            >
              <option
                value=""
                disabled={!selectedPackage}
                style={{ backgroundColor: "#F8EFEB", color: "#141212" }}
              >
                Select a solution
              </option>
              {serviceOfferings.map((offering) => (
                <option
                  key={offering.key}
                  value={offering.key}
                  style={{ backgroundColor: "#F8EFEB", color: "#141212" }}
                >
                  {offering.name}
                </option>
              ))}
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
              style={{ backgroundColor: "#F8EFEB", color: "#141212" }}
            >
              <option value="" disabled style={{ backgroundColor: "#F8EFEB", color: "#141212" }}>
                Select one
              </option>
              <option value="Service" style={{ backgroundColor: "#F8EFEB", color: "#141212" }}>
                Service
              </option>
              <option value="Product" style={{ backgroundColor: "#F8EFEB", color: "#141212" }}>
                Product
              </option>
              <option value="Both" style={{ backgroundColor: "#F8EFEB", color: "#141212" }}>
                Both
              </option>
            </select>
          </label>
          <label className="block text-sm font-medium text-white">
            Do you need bookings, integrations, or other setup help?
            <input
              name="integrations"
              type="text"
              className={inputClassName}
              placeholder="Booking, payments, CRM, email, portals, or other tools"
            />
          </label>
          <label className="block text-sm font-medium text-white sm:col-span-2">
            Tell us about your launch goals
            <textarea
              name="projectGoals"
              className={`${inputClassName} min-h-32 resize-y`}
              placeholder="What are you trying to launch, improve, or get organized?"
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
            Review your project details, then choose the path that best fits the kind
            of launch support you need.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${primaryButtonClass} force-white-btn text-sm shadow-[var(--shadow)] disabled:opacity-80`}
          >
            {isSubmitting ? "Sending..." : "Continue"}
          </button>
        </div>

        {formError ? <p className="mt-4 text-sm text-[#fca5a5]">{formError}</p> : null}

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
            <li className="rounded-2xl border border-[rgba(170,140,117,0.3)] bg-[rgba(216,167,167,0.12)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">1.</span>
              We review your project details
            </li>
            <li className="rounded-2xl border border-[rgba(170,140,117,0.3)] bg-[rgba(216,167,167,0.12)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">2.</span>
              We confirm the right solution for your business launch
            </li>
            <li className="rounded-2xl border border-[rgba(170,140,117,0.3)] bg-[rgba(216,167,167,0.12)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">3.</span>
              We outline scope, pricing, and the best next step
            </li>
            <li className="rounded-2xl border border-[rgba(170,140,117,0.3)] bg-[rgba(216,167,167,0.12)] px-4 py-4">
              <span className="mr-2 font-semibold text-white">4.</span>
              We move into setup, website work, or advanced build support
            </li>
          </ol>
        </div>

        <div className="glass-card p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Available solutions
          </p>
          <div className="mt-4 space-y-2.5">
            {serviceOfferings.map((offering) => {
              const isSelected = activePackage === offering.key;
              const paymentLink = getServicePaymentLink(offering.key);
              const actionHref = paymentLink ?? offering.href;
              const actionLabel = paymentLink ? "Pay" : "Quote";

              return (
                <div
                  key={offering.key}
                  className={`rounded-2xl border px-4 py-3 shadow-sm transition ${
                    isSelected
                      ? "border-[#C88F95] bg-[rgba(216,167,167,0.2)] shadow-[var(--shadow)] ring-1 ring-[rgba(200,143,149,0.2)]"
                      : "border-[rgba(170,140,117,0.3)] bg-[rgba(255,248,245,0.66)]"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-white">{offering.name}</p>
                      <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                        {offering.price}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="inline-flex shrink-0 items-center justify-center rounded-md border border-[rgba(200,143,149,0.5)] bg-[rgba(216,167,167,0.24)] px-4 py-2 text-sm font-medium text-[#AA6F78]">
                        Selected
                      </span>
                    ) : (
                      <Link
                        href={actionHref}
                        className={`${primaryButtonClass} force-white-btn shrink-0 px-4 py-2 text-sm shadow-[var(--shadow)]`}
                      >
                        {actionLabel}
                      </Link>
                    )}
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
          <div className="mt-4 min-h-[224px] rounded-2xl border border-[rgba(170,140,117,0.32)] bg-[linear-gradient(180deg,rgba(255,248,245,0.78),rgba(216,167,167,0.2))] p-4 shadow-[0_18px_36px_rgba(67,59,58,0.1)]">
            <div className="rounded-2xl border border-[rgba(170,140,117,0.28)] bg-[rgba(255,248,245,0.72)] p-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
              </div>
              <div className="mt-3 rounded-xl border border-[rgba(170,140,117,0.24)] bg-[rgba(244,232,228,0.76)] p-3">
                <div className="h-2.5 w-20 rounded-full bg-[rgba(67,59,58,0.15)]" />
                <div className="mt-3 h-16 rounded-2xl bg-[linear-gradient(135deg,rgba(216,167,167,0.5),rgba(200,143,149,0.34))] p-3">
                  <div className="h-2.5 w-24 rounded-full bg-[#433B3A]/60" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-[#433B3A]/20" />
                  <div className="relative mt-3 h-5 overflow-hidden">
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-[#FFF8F5]/70 px-3 py-1 text-[10px] font-medium text-[#433B3A]">
                      Business idea
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-[#FFF8F5]/70 px-3 py-1 text-[10px] font-medium text-[#433B3A] opacity-0">
                      Website build
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-[#FFF8F5]/70 px-3 py-1 text-[10px] font-medium text-[#433B3A] opacity-0">
                      Design makeover
                    </span>
                    <span className="workflow-status absolute left-0 top-0 inline-flex rounded-full bg-[#FFF8F5]/70 px-3 py-1 text-[10px] font-medium text-[#433B3A] opacity-0">
                      Launch ready
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="h-10 rounded-xl bg-[rgba(204,179,166,0.25)]" />
                  <div className="h-10 rounded-xl bg-[rgba(200,143,149,0.24)]" />
                  <div className="h-10 rounded-xl bg-[rgba(204,179,166,0.25)]" />
                </div>
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-full bg-[rgba(170,140,117,0.2)]">
              <div className="workflow-progress relative h-1.5 w-full rounded-full bg-[linear-gradient(90deg,rgba(216,167,167,0.55),rgba(200,143,149,0.55))]" />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 pb-1">
              {[
                { label: "Idea", accent: "bg-[#D8A7A7] text-[#AA6F78]" },
                { label: "Build", accent: "bg-[#D8A7A7] text-[#AA6F78]" },
                { label: "Makeover", accent: "bg-[#C88F95] text-[#8F5F66]" },
                { label: "Launch", accent: "bg-[#C88F95] text-[#8F5F66]" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="workflow-step rounded-xl border border-[rgba(170,140,117,0.28)] bg-[rgba(255,248,245,0.62)] px-2 py-2 text-center"
                >
                  <span
                    className={`workflow-step-dot mx-auto block h-2 w-2 rounded-full ${step.accent.split(" ")[0]}`}
                  />
                  <p
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${step.accent.split(" ")[1]}`}
                  >
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
