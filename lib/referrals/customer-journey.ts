import {
  type ServiceKey,
  resolveServiceKey,
  serviceOfferings,
} from "@/lib/site-data";

export const CUSTOMER_JOURNEY_PROFILE_FIELDS = [
  "businessName",
  "businessType",
  "serviceModel",
  "projectGoals",
  "extraNotes",
] as const;

export const CUSTOMER_PREFERENCE_KEYS = [
  "websiteType",
  "pagesNeeded",
  "hasBranding",
  "needsBooking",
  "needsCommerce",
  "integrations",
  "seoPriority",
  "needsAccounts",
  "needsDashboard",
  "needsDatabase",
  "needsCrm",
  "needsPayments",
  "needsScheduling",
  "needsAutomation",
  "needsChatbot",
  "needsNotifications",
  "needsBusinessSetup",
  "businessState",
] as const;

export type CustomerPreferenceKey = (typeof CUSTOMER_PREFERENCE_KEYS)[number];
export type CustomerPreferences = Partial<
  Record<CustomerPreferenceKey, string | boolean | string[]>
>;

export type CustomerProfile = Partial<
  Record<(typeof CUSTOMER_JOURNEY_PROFILE_FIELDS)[number], string>
>;

export type ServiceRecommendation = {
  service: ServiceKey | "recommend";
  reason: string;
  customQuote: boolean;
};

const advancedPreferenceKeys: CustomerPreferenceKey[] = [
  "needsAccounts",
  "needsDashboard",
  "needsDatabase",
  "needsCrm",
  "needsPayments",
  "needsAutomation",
  "needsChatbot",
  "needsNotifications",
];

function limitedText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sanitizeCustomerProfile(value: unknown): CustomerProfile {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const result: CustomerProfile = {};
  for (const key of CUSTOMER_JOURNEY_PROFILE_FIELDS) {
    const normalized = limitedText(
      input[key],
      key === "extraNotes" ? 2_000 : 1_000,
    );
    if (normalized) result[key] = normalized;
  }
  return result;
}

export function sanitizeCustomerPreferences(
  value: unknown,
): CustomerPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const result: CustomerPreferences = {};
  for (const key of CUSTOMER_PREFERENCE_KEYS) {
    const item = input[key];
    if (typeof item === "boolean") result[key] = item;
    if (typeof item === "string") {
      const normalized = limitedText(item, 240);
      if (normalized) result[key] = normalized;
    }
    if (Array.isArray(item)) {
      const normalized = item
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 12);
      if (normalized.length) result[key] = normalized;
    }
  }
  return result;
}

export function recommendServiceFromPreferences(
  preferences: CustomerPreferences,
): ServiceRecommendation {
  const needsWebsite = Boolean(
    preferences.websiteType ||
    preferences.pagesNeeded ||
    preferences.needsBooking ||
    preferences.needsCommerce,
  );
  const needsAdvanced = advancedPreferenceKeys.some(
    (key) =>
      preferences[key] === true ||
      (typeof preferences[key] === "string" &&
        Boolean((preferences[key] as string).trim())),
  );
  const needsSetup = preferences.needsBusinessSetup === true;

  if (needsSetup && needsWebsite)
    return {
      service: "complete-business-launch",
      reason:
        "Your business setup and website needs fit the Complete Business Launch Package. Steady Start will confirm the custom scope and quote.",
      customQuote: true,
    };
  if (needsAdvanced)
    return {
      service: "premium-website",
      reason:
        "Customer accounts, databases, dashboards, integrations, payments, or automation require the Premium Website Package or a confirmed custom quote.",
      customQuote: false,
    };
  if (needsWebsite)
    return {
      service: "standard-website",
      reason:
        "Your website needs align with the Standard Website Package. Included features do not add separate fees.",
      customQuote: false,
    };
  if (needsSetup)
    return {
      service: "business-setup",
      reason:
        "Your current needs align with Business Setup. Steady Start will confirm state-specific requirements and pricing.",
      customQuote: true,
    };
  return {
    service: "recommend",
    reason:
      "Share a few website, business setup, or automation preferences so Steady Start can recommend the right next step.",
    customQuote: true,
  };
}

export function normalizeSelectedService(value: unknown) {
  if (value === "recommend") return "recommend" as const;
  return (
    resolveServiceKey(typeof value === "string" ? value : undefined) ?? null
  );
}

export function customerProgressStage(step: number, selectedService: unknown) {
  if (step >= 4) return "submitted";
  if (step >= 3) return "review_ready";
  if (normalizeSelectedService(selectedService)) return "service_selected";
  return "profile_started";
}

export function customerJourneyV2Enabled() {
  return process.env.CUSTOMER_JOURNEY_V2_ENABLED === "true";
}

export function aiSalesAssistantEnabled() {
  return (
    customerJourneyV2Enabled() &&
    process.env.AI_SALES_ASSISTANT_ENABLED === "true"
  );
}

export function publicServiceCatalogForAi() {
  return serviceOfferings.map((service) => ({
    id: service.key,
    name: service.name,
    price: service.price,
    description: service.subtitle ?? service.description ?? "",
    includedFeatures: service.features ?? [],
    quoteOptions: service.options?.map((option) => option.title) ?? [],
  }));
}

export function redactAssistantQuestion(value: string) {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/(?:\+?\d[\d().\s-]{6,}\d)/g, "[number removed]")
    .trim()
    .slice(0, 1_000);
}
