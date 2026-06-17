import type { ServiceKey } from "@/lib/site-data";

export const PAYMENT_LINKS = {
  starter: "https://buy.stripe.com/eVq6oHfVMbFfdMT53Hd7q03",
  business: "https://buy.stripe.com/6oU8wPdNE8t37ov67Ld7q05",
  premium: "https://buy.stripe.com/bJefZhcJA5gR9wDeEhd7q04",
} as const;

export const SERVICE_PAYMENT_LINKS: Partial<Record<ServiceKey, string>> = {
  "custom-website-bundle": "https://buy.stripe.com/9B6cN56lc8t31070Nrd7q06",
  "custom-website-plus-bundle": "https://buy.stripe.com/bJe3cv3908t31077bPd7q07",
};

export function getServicePaymentLink(serviceKey: ServiceKey) {
  const link = SERVICE_PAYMENT_LINKS[serviceKey];

  return link && link.trim().length > 0 ? link : undefined;
}
