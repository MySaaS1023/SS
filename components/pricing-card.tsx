import Link from "next/link";

import { ServiceOffering } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

type PricingCardProps = {
  tier: ServiceOffering;
};

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <div
      className={`glass-card relative flex h-full flex-col p-6 transition duration-200 hover:-translate-y-1 sm:p-7 ${
        tier.featured
          ? "border-[rgba(59,130,246,0.32)] shadow-[0_24px_52px_rgba(59,130,246,0.16)] ring-1 ring-[rgba(139,92,246,0.22)]"
          : "hover:border-[rgba(59,130,246,0.22)] hover:shadow-[0_18px_40px_rgba(59,130,246,0.1)]"
      }`}
    >
      {tier.featured ? (
        <div className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
          Most Popular
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">
          {tier.name}
        </h3>
        <p className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
          {tier.price}
        </p>
        {tier.subtitle ? (
          <p className="text-sm leading-6 text-[var(--muted)]">{tier.subtitle}</p>
        ) : null}
        {tier.description ? (
          <p className="text-sm leading-6 text-[var(--muted)]">{tier.description}</p>
        ) : null}
      </div>

      {"options" in tier && tier.options ? (
        <div className="mt-8 grid flex-1 gap-4">
          {tier.options.map((option) => (
            <div
              key={option.title}
              className="rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5"
            >
              <p className="text-lg font-semibold text-white">{option.title}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-white">
                {option.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a78bfa]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-8 flex-1 space-y-2 text-sm leading-6 text-white">
          {tier.features?.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#60a5fa]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={tier.href}
        className={`${primaryButtonClass} force-white-btn mt-8 text-sm shadow-[var(--shadow)]`}
      >
        {tier.ctaLabel}
      </Link>
    </div>
  );
}
