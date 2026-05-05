import { PAYMENT_LINKS } from "@/lib/payment-links";
import { PricingPackage } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

type PricingCardProps = {
  tier: PricingPackage;
};

export function PricingCard({ tier }: PricingCardProps) {
  return (
    <div
      className={`glass-panel relative flex h-full flex-col rounded-[2rem] border p-7 shadow-[var(--shadow)] transition duration-200 hover:-translate-y-1 ${
        tier.featured
          ? "scale-[1.02] border-[rgba(59,130,246,0.4)] ring-1 ring-[rgba(139,92,246,0.28)]"
          : "border-[var(--line)]"
      }`}
    >
      {tier.featured ? (
        <div className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(90deg,#3B82F6,#8B5CF6)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
          Most Popular
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">
            {tier.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{tier.description}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-4xl font-semibold tracking-[-0.03em] text-white">
          {tier.price}
        </p>
      </div>

      <ul className="mt-8 flex-1 space-y-3 text-sm leading-6 text-white">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-sm"
          >
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={PAYMENT_LINKS[tier.key]}
        className={`${primaryButtonClass} force-white-btn mt-8 text-sm shadow-[var(--shadow)]`}
        aria-label={`Pay for ${tier.name} with Stripe`}
      >
        Get Started
      </a>
    </div>
  );
}
