import Image from "next/image";
import type { ReactNode } from "react";
import { PageContainer } from "@/components/page-container";

export function BrandImage({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`original-brand-image ${className}`}>
      <Image
        src="/brand/steady-start-original.png"
        alt="Steady Start"
        width={2172}
        height={724}
        sizes="(max-width: 767px) 170px, 220px"
        priority={priority}
      />
    </span>
  );
}

export function OceanEmblem({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ocean-emblem ${className}`}
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <ellipse
          key={index}
          cx="60"
          cy="35"
          rx="13"
          ry="24"
          transform={`rotate(${index * 45} 60 60)`}
        />
      ))}
    </svg>
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
        fill="var(--brand-lagoon-teal)"
        d="M0 29C280 129 516 28 804 38S1188 1 1440 32V120H0Z"
      />
      <path
        fill="var(--brand-electric-aqua)"
        d="M0 36C280 133 516 34 804 44S1188 8 1440 39V120H0Z"
      />
      <path
        fill="var(--brand-pacific-blue)"
        d="M0 46C280 143 516 42 804 54S1188 18 1440 49V120H0Z"
      />
      <path
        fill="#fff"
        d="M0 56C280 151 516 54 804 65S1188 30 1440 60V120H0Z"
      />
      <path
        fill="var(--brand-sunset-orange)"
        d="M0 66C280 155 516 63 804 72S1188 39 1440 67V120H0Z"
      />
      <path
        fill="var(--brand-seafoam)"
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
      aria-label="Laptop and phone displaying the original Steady Start logo"
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
