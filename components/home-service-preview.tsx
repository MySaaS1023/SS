import Link from "next/link";
import { HomeIcon } from "@/components/home-icon";
import type { ServiceOffering } from "@/lib/site-data";

export function HomeServicePreview({ service }: { service: ServiceOffering }) {
  const premium = service.key === "premium-website";
  const highlights =
    service.features?.slice(0, 3) ??
    service.options?.map((option) => option.title) ??
    [];
  return (
    <article
      className={`home-service-card ${premium ? "home-service-card-featured" : ""}`}
    >
      {premium ? (
        <span className="home-package-badge">Advanced Features</span>
      ) : null}
      <HomeIcon
        kind={
          premium
            ? "layers"
            : service.key === "standard-website"
              ? "monitor"
              : "rocket"
        }
      />
      <h3>{service.name}</h3>
      <p className="home-service-price">{service.price}</p>
      <p className="home-service-description">
        {service.subtitle ?? service.description}
      </p>
      <ul>
        {highlights.map((highlight) => (
          <li key={highlight}>
            <span aria-hidden="true">✓</span>
            {highlight}
          </li>
        ))}
      </ul>
      <Link href={service.href} className="home-button home-button-primary">
        {service.ctaLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
