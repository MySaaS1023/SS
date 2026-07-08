import Link from "next/link";

import type { PricingPlan } from "@/lib/site-data";
import { primaryButtonClass, secondaryButtonClass } from "@/lib/styles";

type PricingCardProps = {
  plan: PricingPlan;
};

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <article
      className={`glass-card flex h-full flex-col p-6 ${
        plan.featured ? "border-[rgba(79,140,255,0.46)]" : ""
      }`}
    >
      <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
      <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
        {plan.price}
      </p>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{plan.description}</p>
      <ul className="mt-6 flex-1 space-y-3 text-sm text-white">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={plan.href}
        className={`${
          plan.featured ? primaryButtonClass : secondaryButtonClass
        } force-white-btn mt-8 justify-center text-sm`}
      >
        {plan.ctaLabel}
      </Link>
    </article>
  );
}
