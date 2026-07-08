export const PAYMENT_LINKS: Record<"starter" | "pro" | "business", string> = {
  starter: "",
  pro: "",
  business: "",
};

export type PricingPlanKey = keyof typeof PAYMENT_LINKS;

export function getPaymentLink(planKey: PricingPlanKey) {
  const link = PAYMENT_LINKS[planKey];
  return link && link.trim().length > 0 ? link : undefined;
}
