import Image from "next/image";
import type { ReactNode } from "react";
import { PageContainer } from "@/components/page-container";

export function BrandImage({
  className = "",
  priority = false,
  iconOnly = false,
}: {
  className?: string;
  priority?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <span
      className={`original-brand-image ${iconOnly ? "brand-icon-only" : ""} ${className}`}
    >
      <Image
        src="/brand/steady-start-browser-emblem-original.png"
        alt={iconOnly ? "Steady Start" : ""}
        width={708}
        height={536}
        sizes="(max-width: 767px) 48px, 56px"
        priority={priority}
      />
      {!iconOnly && <span className="brand-name">Steady Start</span>}
    </span>
  );
}

export function OceanEmblem({ className = "" }: { className?: string }) {
  return (
    <Image
      className={`ocean-emblem ${className}`}
      aria-hidden="true"
      src="/brand/home-hero-geometric-emblem.svg"
      alt=""
      width={512}
      height={512}
      sizes="140px"
    />
  );
}

export function OceanMesh({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ocean-mesh ${className}`}
      aria-hidden="true"
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      fill="none"
    >
      {Array.from({ length: 14 }, (_, index) => (
        <path
          key={index}
          d={`M-30 ${280 + index * 7} C260 ${440 - index * 7},460 ${350 - index * 11},670 ${220 - index * 5} S970 ${50 + index * 10},1230 ${80 + index * 8}`}
          stroke="currentColor"
          strokeWidth={index === 5 ? 2.4 : 0.8}
          opacity={index % 3 === 0 ? 0.8 : 0.4}
        />
      ))}
      {Array.from({ length: 42 }, (_, index) => (
        <circle
          key={index}
          cx={550 + (index % 14) * 47}
          cy={90 + Math.floor(index / 14) * 32 + Math.sin(index) * 22}
          r={index % 5 === 0 ? 2 : 1.1}
          fill="currentColor"
          opacity={index % 3 === 0 ? 0.7 : 0.3}
        />
      ))}
    </svg>
  );
}

export function OceanWave({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ocean-wave ${className}`}
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
    >
      <path
        fill="var(--brand-ivory)"
        d="M0 70C280 160 516 67 804 76S1188 43 1440 71V120H0Z"
      />
    </svg>
  );
}

export function OceanHero({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ocean-hero ${className}`}>
      <OceanMesh />
      <OceanEmblem />
      <PageContainer>
        <p className="section-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? (
          <p className="ocean-hero-description">{description}</p>
        ) : null}
        {children}
      </PageContainer>
      <OceanWave />
    </section>
  );
}

export function DeviceVisual({ className = "" }: { className?: string }) {
  return (
    <div
      className={`ocean-devices ${className}`}
      role="img"
      aria-label="Laptop and phone displaying the Steady Start logo"
    >
      <div className="ocean-device-glow" />
      <div className="ocean-laptop">
        <div className="ocean-laptop-screen">
          <OceanMesh />
          <span className="ocean-camera" />
          <BrandImage />
          <span className="ocean-device-caption">
            Websites · Automation · Digital Solutions
          </span>
        </div>
        <div className="ocean-keyboard" />
        <div className="ocean-laptop-base" />
      </div>
      <div className="ocean-phone">
        <OceanMesh />
        <span className="ocean-phone-camera" />
        <BrandImage />
        <span className="ocean-phone-home" />
      </div>
    </div>
  );
}
