"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getServicePaymentLink } from "@/lib/payment-links";
import {
  LaunchPackageOption,
  ServiceKey,
  launchPackageOptions,
  serviceOfferings,
} from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type IntakeFormProps = {
  selectedPackage?: ServiceKey;
  customerHandoffToken?: string;
  initialValues?: Partial<IntakeValues>;
};

type IntakeStep = 1 | 2 | 3 | 4;
type PackageSelection = ServiceKey | "recommend" | "";

type IntakeValues = {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  serviceModel: string;
  projectGoals: string;
  extraNotes: string;
};

const defaultValues: IntakeValues = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "",
  serviceModel: "",
  projectGoals: "",
  extraNotes: "",
};

const stepLabels = ["Business", "Service", "Review", "Checkout"];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]";
const selectClassName = `${inputClassName} appearance-none`;

const recommendSelection = {
  key: "recommend" as const,
  name: "Other / Not Sure Yet",
  price: "Custom Quote",
  description:
    "Not sure which path fits yet? Share your details and we will recommend the right next step.",
  features: [
    "Personal recommendation",
    "Clear next steps",
    "No pressure to choose before you are ready",
  ],
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

function isValidPhone(phone: string) {
  const normalizedPhone = phone.trim();

  if (!normalizedPhone) {
    return true;
  }

  const digitsOnly = normalizedPhone.replace(/\D/g, "");

  return digitsOnly.length >= 7;
}

function getSelectedService(selection: PackageSelection) {
  if (!selection || selection === "recommend") {
    return undefined;
  }

  return serviceOfferings.find((offering) => offering.key === selection);
}

function getSelectionLabel(selection: PackageSelection) {
  if (selection === "recommend") {
    return recommendSelection.name;
  }

  return selection ? (getSelectedService(selection)?.name ?? "") : "";
}

function getSelectionPrice(selection: PackageSelection) {
  if (selection === "recommend") {
    return recommendSelection.price;
  }

  return getSelectedService(selection)?.price ?? "";
}

function isPaidPackage(selection: PackageSelection) {
  const selectedOffering = getSelectedService(selection);

  return Boolean(selectedOffering?.price.trim().startsWith("$"));
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-xs font-medium text-red-800">{message}</p>;
}

function StepProgress({ activeStep }: { activeStep: IntakeStep }) {
  return (
    <div className="mb-6" aria-label={`Step ${activeStep} of 4`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
          Step {activeStep} of 4
        </p>
        <p className="text-xs font-medium text-[var(--muted)]">
          {stepLabels[activeStep - 1]}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === activeStep;
          const isComplete = stepNumber < activeStep;

          return (
            <div
              key={label}
              className="min-w-0"
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={`h-1.5 rounded-full transition ${
                  isComplete || isActive
                    ? "bg-[var(--primary)]"
                    : "bg-[var(--surface)]"
                }`}
              />
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
                    isComplete
                      ? "border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)]"
                      : isActive
                        ? "border-[var(--line)] bg-[var(--primary)] text-white"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                  }`}
                >
                  {isComplete ? "✓" : stepNumber}
                </span>
                <span
                  className={`hidden truncate text-xs font-medium sm:block ${
                    isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function IntakeForm({
  selectedPackage,
  customerHandoffToken,
  initialValues,
}: IntakeFormProps) {
  const [step, setStep] = useState<IntakeStep>(1);
  const [values, setValues] = useState<IntakeValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [activePackage, setActivePackage] = useState<PackageSelection>(
    selectedPackage ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof IntakeValues, string>>
  >({});
  const [packageError, setPackageError] = useState("");
  const [formError, setFormError] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [launchPackageOption, setLaunchPackageOption] = useState<
    LaunchPackageOption | ""
  >("");

  useEffect(() => {
    setActivePackage(selectedPackage ?? "");
  }, [selectedPackage]);

  const selectedOffering = useMemo(
    () => getSelectedService(activePackage),
    [activePackage],
  );
  const selectedPrice = getSelectionPrice(activePackage);
  const baseSelectedLabel = getSelectionLabel(activePackage);
  const launchOptionLabel = launchPackageOptions.find(
    (option) => option.key === launchPackageOption,
  )?.label;
  const selectedLabel =
    activePackage === "complete-business-launch" && launchOptionLabel
      ? `${baseSelectedLabel} — ${launchOptionLabel}`
      : baseSelectedLabel;
  const paymentLink =
    activePackage && activePackage !== "recommend"
      ? getServicePaymentLink(activePackage)
      : undefined;
  const paidPackage = isPaidPackage(activePackage);
  const isBusinessStepComplete =
    values.fullName.trim().length > 0 &&
    isValidSimpleEmail(values.email) &&
    isValidPhone(values.phone) &&
    values.businessType.trim().length > 0 &&
    values.serviceModel.length > 0 &&
    values.projectGoals.trim().length > 0;
  const isServiceStepComplete =
    Boolean(activePackage) &&
    (activePackage !== "complete-business-launch" ||
      Boolean(launchPackageOption));
  const canSubmitReview = isConfirmed && !isSubmitting;

  function updateValue(field: keyof IntakeValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setFormError("");
  }

  function validateBusinessStep() {
    const errors: Partial<Record<keyof IntakeValues, string>> = {};

    if (!values.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }

    if (!isValidSimpleEmail(values.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!isValidPhone(values.phone)) {
      errors.phone = "Please enter a valid phone number or leave this blank.";
    }

    if (!values.businessType.trim()) {
      errors.businessType = "Please share your business type.";
    }

    if (!values.serviceModel) {
      errors.serviceModel =
        "Please choose service-based, product-based, or both.";
    }

    if (!values.projectGoals.trim()) {
      errors.projectGoals = "Please share a quick summary of your goals.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validateServiceStep() {
    if (!activePackage) {
      setPackageError("Please select a service before continuing.");
      return false;
    }

    if (activePackage === "complete-business-launch" && !launchPackageOption) {
      setPackageError("Please choose a launch package option.");
      return false;
    }

    setPackageError("");
    return true;
  }

  function goToStep(nextStep: IntakeStep) {
    setFormError("");
    setStep(nextStep);
  }

  function handleBusinessContinue() {
    if (validateBusinessStep()) {
      goToStep(2);
    }
  }

  function handleServiceContinue() {
    if (validateServiceStep()) {
      goToStep(3);
    }
  }

  function recordAttributedPaymentClick() {
    void fetch("/api/referral-attribution/payment-click", {
      method: "POST",
      keepalive: true,
    });
  }

  async function handleReviewSubmit() {
    if (isSubmitting) {
      return;
    }

    setFormError("");

    if (!validateBusinessStep() || !validateServiceStep()) {
      return;
    }

    if (!isConfirmed) {
      setFormError(
        "Please confirm that your details are accurate before continuing.",
      );
      return;
    }

    if (paidPackage && !paymentLink) {
      setFormError(
        "This payment link is not configured yet. Please contact us before continuing.",
      );
      return;
    }

    const payload = {
      fullName: values.fullName,
      email: values.email.trim(),
      phone: values.phone,
      businessName: values.businessName,
      selectedPackage: selectedLabel,
      selectedPackageKey:
        activePackage === "recommend" ? "recommend" : activePackage,
      launchPackageOption: launchPackageOption || undefined,
      customerHandoffToken,
      businessType: values.businessType,
      serviceModel: values.serviceModel,
      integrations: "",
      projectGoals: values.projectGoals,
      extraNotes: values.extraNotes,
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

      setSubmittedMessage(
        result.message ??
          "Your project details have been received successfully.",
      );
      goToStep(4);
    } catch (error) {
      console.error("INTAKE SUBMIT FAILURE", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your request. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-[min(92vw,960px)]">
      <StepProgress activeStep={step} />

      <form
        className="glass-card p-6 shadow-[var(--shadow)] sm:p-8 lg:p-10"
        onSubmit={(event) => {
          event.preventDefault();

          if (step === 1 && isBusinessStepComplete) {
            handleBusinessContinue();
            return;
          }

          if (step === 2 && isServiceStepComplete) {
            handleServiceContinue();
            return;
          }

          if (step === 3 && canSubmitReview) {
            void handleReviewSubmit();
          }
        }}
      >
        {step === 1 ? (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Project Intake
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
              Tell us about your business
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Share a few details so I can understand what you&apos;re building
              and guide you toward the right solution.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Full Name <span className="text-[var(--primary)]">*</span>
                <input
                  type="text"
                  className={inputClassName}
                  placeholder="Your full name"
                  value={values.fullName}
                  onChange={(event) =>
                    updateValue("fullName", event.target.value)
                  }
                />
                <FieldError message={fieldErrors.fullName} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Email <span className="text-[var(--primary)]">*</span>
                <input
                  type="email"
                  className={inputClassName}
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={(event) => updateValue("email", event.target.value)}
                />
                <FieldError message={fieldErrors.email} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Phone
                <input
                  type="tel"
                  className={inputClassName}
                  placeholder="(555) 555-5555"
                  value={values.phone}
                  onChange={(event) => updateValue("phone", event.target.value)}
                />
                <FieldError message={fieldErrors.phone} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Business Name
                <input
                  type="text"
                  className={inputClassName}
                  placeholder="Your business name"
                  value={values.businessName}
                  onChange={(event) =>
                    updateValue("businessName", event.target.value)
                  }
                />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                What type of business do you have?{" "}
                <span className="text-[var(--primary)]">*</span>
                <input
                  type="text"
                  className={inputClassName}
                  placeholder="Cleaning, beauty, coaching, landscaping, online store..."
                  value={values.businessType}
                  onChange={(event) =>
                    updateValue("businessType", event.target.value)
                  }
                />
                <FieldError message={fieldErrors.businessType} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)]">
                Is your business service-based or product-based?{" "}
                <span className="text-[var(--primary)]">*</span>
                <select
                  className={selectClassName}
                  value={values.serviceModel}
                  onChange={(event) =>
                    updateValue("serviceModel", event.target.value)
                  }
                  style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                >
                  <option
                    value=""
                    style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  >
                    Select one
                  </option>
                  <option
                    value="Service"
                    style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  >
                    Service-based
                  </option>
                  <option
                    value="Product"
                    style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  >
                    Product-based
                  </option>
                  <option
                    value="Both"
                    style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
                  >
                    Both
                  </option>
                </select>
                <FieldError message={fieldErrors.serviceModel} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                Tell us about your business goals{" "}
                <span className="text-[var(--primary)]">*</span>
                <textarea
                  className={`${inputClassName} min-h-32 resize-y`}
                  placeholder="What are you trying to launch, improve, organize, or automate?"
                  value={values.projectGoals}
                  onChange={(event) =>
                    updateValue("projectGoals", event.target.value)
                  }
                />
                <FieldError message={fieldErrors.projectGoals} />
              </label>

              <label className="block text-sm font-medium text-[var(--foreground)] sm:col-span-2">
                Anything else we should know?
                <textarea
                  className={`${inputClassName} min-h-28 resize-y`}
                  placeholder="Share any details that would help with planning."
                  value={values.extraNotes}
                  onChange={(event) =>
                    updateValue("extraNotes", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end border-t border-[var(--line)] pt-6">
              <button
                type="submit"
                disabled={!isBusinessStepComplete}
                className={`${primaryButtonClass} force-white-btn w-full text-sm shadow-[var(--shadow)] disabled:pointer-events-none disabled:opacity-55 sm:w-auto`}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Choose Service
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
              Choose your service
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Select the option that best fits the kind of support you need.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {serviceOfferings.map((offering) => {
                const isSelected = activePackage === offering.key;

                return (
                  <button
                    key={offering.key}
                    type="button"
                    onClick={() => {
                      setActivePackage(offering.key);
                      if (offering.key !== "complete-business-launch") {
                        setLaunchPackageOption("");
                      }
                      setPackageError("");
                    }}
                    className={`flex h-full flex-col rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                      isSelected
                        ? "border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] ring-1 ring-[var(--primary)]"
                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-[var(--foreground)]">
                          {offering.name}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[var(--primary)]">
                          {offering.price}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--surface)] text-[var(--muted)]"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>
                    {offering.subtitle || offering.description ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {offering.subtitle ?? offering.description}
                      </p>
                    ) : null}
                    {offering.features ? (
                      <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
                        {offering.features.slice(0, 5).map((feature) => (
                          <li key={feature} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {offering.options ? (
                      <div className="mt-4 space-y-3">
                        {offering.options.map((option) => (
                          <div
                            key={option.title}
                            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
                          >
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {option.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                              {option.features.join(" + ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setActivePackage("recommend");
                  setPackageError("");
                }}
                className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 md:col-span-2 ${
                  activePackage === "recommend"
                    ? "border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] ring-1 ring-[var(--primary)]"
                    : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line)]"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                      Not sure which option fits?
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                      {recommendSelection.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {recommendSelection.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                    Custom Quote
                  </span>
                </div>
              </button>
            </div>

            {activePackage === "complete-business-launch" ? (
              <fieldset className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <legend className="px-2 text-base font-semibold text-[var(--foreground)]">
                  Which launch package are you interested in?
                </legend>
                <div className="mt-3 grid gap-3">
                  {launchPackageOptions.map((option) => (
                    <label
                      key={option.key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]"
                    >
                      <input
                        type="radio"
                        name="launch-package-option"
                        value={option.key}
                        checked={launchPackageOption === option.key}
                        onChange={() => {
                          setLaunchPackageOption(option.key);
                          setPackageError("");
                        }}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {packageError ? (
              <p className="mt-4 text-sm font-medium text-red-800">
                {packageError}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className={`${secondaryButtonClass} w-full text-sm sm:w-auto`}
                onClick={() => goToStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!isServiceStepComplete}
                className={`${primaryButtonClass} force-white-btn w-full text-sm shadow-[var(--shadow)] disabled:pointer-events-none disabled:opacity-55 sm:w-auto`}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Review
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
              Review your details
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Make sure everything looks right before moving to checkout.
            </p>

            <div className="mt-8 space-y-5">
              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Business details
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--foreground)]"
                    onClick={() => goToStep(1)}
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Full Name", values.fullName],
                    ["Email", values.email],
                    ["Phone", values.phone || "Not provided"],
                    ["Business Name", values.businessName || "Not provided"],
                    ["Business Type", values.businessType],
                    ["Business Model", values.serviceModel],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {label}
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--foreground)]">{value}</dd>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Business Goals
                    </dt>
                    <dd className="mt-1 leading-6 text-[var(--foreground)]">
                      {values.projectGoals}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">
                    Selected service
                  </h2>
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--primary)] transition hover:text-[var(--foreground)]"
                    onClick={() => goToStep(2)}
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    {selectedLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                    {selectedPrice}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {activePackage === "recommend"
                      ? recommendSelection.description
                      : (selectedOffering?.subtitle ??
                        selectedOffering?.description ??
                        "We will review your request and confirm the best next step.")}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Additional notes
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {values.extraNotes || "No additional notes added."}
                </p>
              </section>

              <label className="flex gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(event) => {
                    setIsConfirmed(event.target.checked);
                    setFormError("");
                  }}
                  className="mt-1 h-4 w-4 rounded border-[var(--line)] bg-[var(--surface)] accent-[var(--primary)]"
                />
                <span>I confirm that the information above is accurate.</span>
              </label>
            </div>

            {formError ? (
              <p className="mt-4 text-sm font-medium text-red-800">
                {formError}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className={`${secondaryButtonClass} w-full text-sm sm:w-auto`}
                onClick={() => goToStep(2)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="submit"
                className={`${primaryButtonClass} force-white-btn w-full text-sm shadow-[var(--shadow)] disabled:pointer-events-none disabled:opacity-55 sm:w-auto`}
                disabled={!canSubmitReview}
              >
                {isSubmitting ? "Submitting..." : "Continue to Checkout"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              Checkout
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
              Complete your next step
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Your project details have been received successfully.
            </p>

            <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="text-xl font-semibold text-[var(--foreground)]">
                {selectedLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                {selectedPrice}
              </p>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {paidPackage
                  ? "Continue to secure your package. After checkout, Steady Start will review your intake and follow up with next steps for your build."
                  : "Steady Start will review your request and follow up with the best next step, scope, and quote details."}
              </p>
              {submittedMessage ? (
                <p className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--primary)]">
                  {submittedMessage}
                </p>
              ) : null}
            </div>

            <details className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
                What happens next?
              </summary>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
                <li>1. We review your submitted project details.</li>
                <li>2. We confirm scope, timing, and the right next step.</li>
                <li>3. We move into setup, website work, or launch support.</li>
              </ol>
            </details>

            <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className={`${secondaryButtonClass} w-full text-sm sm:w-auto`}
              >
                Return Home
              </Link>
              {paidPackage && paymentLink ? (
                <a
                  href={paymentLink}
                  onClick={recordAttributedPaymentClick}
                  className={`${primaryButtonClass} force-white-btn w-full text-sm shadow-[var(--shadow)] sm:w-auto`}
                >
                  Pay {selectedPrice}
                </a>
              ) : (
                <Link
                  href="/contact"
                  className={`${primaryButtonClass} force-white-btn w-full text-sm shadow-[var(--shadow)] sm:w-auto`}
                >
                  Book a Consultation
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
