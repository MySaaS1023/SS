"use client";

import Link from "next/link";

import type { ServiceOffering } from "@/lib/site-data";
import { primaryButtonClass } from "@/lib/styles";

export function CustomerOptions({
  token,
  services,
}: {
  token: string;
  services: ServiceOffering[];
}) {
  function record(event: string, service?: string) {
    void fetch(`/api/customer-handoff/${encodeURIComponent(token)}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, service }),
      keepalive: true,
    });
  }
  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      {services.map((service) => {
        return (
          <article key={service.key} className="glass-card flex flex-col p-6">
            <h2 className="text-xl font-semibold text-white">{service.name}</h2>
            <p className="mt-2 text-lg font-semibold text-[#93c5fd]">
              {service.price}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {service.subtitle ?? service.description}
            </p>
            {service.features ? (
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {service.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
              <Link
                href={`/get-started/${encodeURIComponent(token)}?service=${service.key}#intake`}
                onClick={() => record("service_selected", service.key)}
                className={`${primaryButtonClass} force-white-btn w-full`}
              >
                {service.ctaLabel}
              </Link>
            </div>
          </article>
        );
      })}
      <article className="glass-card p-6 lg:col-span-2">
        <h2 className="text-xl font-semibold text-white">
          Need help choosing?
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Contact Steady Start and we’ll help identify the right next step.
        </p>
        <a
          href="mailto:support@steadystartco.com"
          onClick={() => void record("consultation_clicked")}
          className={`${primaryButtonClass} force-white-btn mt-5 inline-flex`}
        >
          Contact Steady Start
        </a>
      </article>
    </div>
  );
}
