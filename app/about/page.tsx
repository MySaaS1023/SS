import type { Metadata } from "next";
import { DeviceVisual as ApprovedDeviceVisual } from "@/components/ocean-brand";
import Link from "next/link";
import type { ReactNode } from "react";

import { PageContainer } from "@/components/page-container";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Steady Start | Digital Solutions for Growing Businesses",
  description:
    "Steady Start is a small, U.S.-based web development company creating custom websites, business tools, integrations and practical digital solutions.",
  alternates: { canonical: "https://www.steadystartco.com/about" },
  openGraph: {
    title: "About Steady Start | Digital Solutions for Growing Businesses",
    description:
      "Simple websites and practical digital tools to help your business launch and grow.",
    url: "https://www.steadystartco.com/about",
  },
};

const services = [
  {
    title: "Custom Websites",
    description:
      "Professional, mobile-friendly websites built for your business.",
    icon: (
      <>
        <rect x="5" y="4" width="22" height="17" rx="2" />
        <path d="M2 26h28l-3-5H5l-3 5Z" />
      </>
    ),
  },
  {
    title: "Booking & Integrations",
    description: "Scheduling, payments, and tools that keep you organized.",
    icon: (
      <>
        <rect x="4" y="6" width="24" height="23" rx="3" />
        <path d="M10 3v7M22 3v7M4 14h24M10 20h3M19 20h3M10 25h3" />
      </>
    ),
  },
  {
    title: "Automation & AI Tools",
    description: "Save time and simplify your daily operations.",
    icon: (
      <>
        <path d="m13 3 6 0 1 4 3 2 4-1 3 5-3 3v3l3 3-3 5-4-1-3 2-1 3h-6l-1-3-3-2-4 1-3-5 3-3v-3l-3-3 3-5 4 1 3-2 1-4Z" />
        <circle cx="16" cy="17" r="5" />
      </>
    ),
  },
  {
    title: "Business Setup",
    description: "A complete online setup to help you launch and grow.",
    icon: (
      <>
        <path d="M4 4v24h25M9 21l7-7 5 3 8-10M23 7h6v6" />
      </>
    ),
  },
];

const benefits = [
  { title: "Simple & Practical", description: "Clear, easy-to-use solutions." },
  {
    title: "Reliable & Supportive",
    description: "A trusted partner from start to finish.",
  },
  {
    title: "Business Growth Focused",
    description: "Tools designed to help your business move forward.",
  },
];

function ServiceIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function OceanLines({ className, id }: { className: string; id: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient
          id={id}
          x1="50"
          y1="350"
          x2="1140"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--brand-blue, #0866cc)" stopOpacity="0.08" />
          <stop
            offset="0.52"
            stopColor="var(--brand-aqua, #00cfa8)"
            stopOpacity="0.8"
          />
          <stop
            offset="1"
            stopColor="var(--brand-aqua, #00cfa8)"
            stopOpacity="0.15"
          />
        </linearGradient>
      </defs>
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={index}
          d={`M-30 ${280 + index * 7} C260 ${440 - index * 7}, 460 ${350 - index * 11}, 670 ${220 - index * 5} S970 ${50 + index * 10}, 1230 ${80 + index * 8}`}
          stroke={`url(#${id})`}
          strokeWidth={index === 5 ? 2.5 : 0.9}
        />
      ))}
      {Array.from({ length: 42 }, (_, index) => (
        <circle
          key={index}
          cx={550 + (index % 14) * 47}
          cy={90 + Math.floor(index / 14) * 32 + Math.sin(index) * 22}
          r={index % 5 === 0 ? 2 : 1.2}
          fill="var(--brand-aqua, #00cfa8)"
          opacity={index % 3 === 0 ? 0.7 : 0.28}
        />
      ))}
    </svg>
  );
}

function OceanEmblem({ className }: { className: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
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

function HeroTransition() {
  return (
    <svg
      className={styles.heroTransition}
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
    >
      <path
        fill="var(--brand-teal, #007e75)"
        d="M0 29C280 129 516 28 804 38S1188 1 1440 32V120H0Z"
      />
      <path
        fill="var(--brand-blue, #0866cc)"
        d="M0 42C280 139 516 40 804 49S1188 13 1440 44V120H0Z"
      />
      <path
        fill="var(--brand-seafoam, #f5f9fc)"
        d="M0 53C280 147 516 50 804 60S1188 25 1440 55V120H0Z"
      />
      <path
        fill="var(--brand-orange, #ff8a16)"
        d="M0 66C280 155 516 63 804 72S1188 39 1440 67V120H0Z"
      />
      <path
        fill="var(--brand-seafoam, #f5f9fc)"
        d="M0 70C280 160 516 67 804 76S1188 43 1440 71V120H0Z"
      />
    </svg>
  );
}

function DeviceVisual() {
  return <ApprovedDeviceVisual />;
}

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-heading">
        <OceanLines className={styles.heroMesh} id="about-hero-wave" />
        <OceanEmblem className={styles.heroEmblem} />
        <PageContainer className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>About Steady Start</p>
            <h1 id="about-heading">
              Building Simple Digital Solutions for{" "}
              <span>Growing Businesses</span>
            </h1>
            <p className={styles.description}>
              Steady Start is a small, U.S.-based web development company that
              helps businesses establish a professional online presence,
              streamline their operations, and grow with practical, easy-to-use
              digital solutions.
            </p>
          </div>
          <DeviceVisual />
        </PageContainer>
        <HeroTransition />
      </section>

      <section
        className={styles.services}
        aria-labelledby="about-services-heading"
      >
        <PageContainer>
          <h2 id="about-services-heading">What We Do</h2>
          <p className={styles.sectionDescription}>
            We create, build, and set up the digital tools businesses need to
            work smarter.
          </p>
          <ul className={styles.serviceGrid}>
            {services.map((service) => (
              <li key={service.title}>
                <div className={styles.serviceIcon}>
                  <ServiceIcon>{service.icon}</ServiceIcon>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>

      <section
        className={styles.benefits}
        aria-labelledby="about-benefits-heading"
      >
        <PageContainer>
          <div className={styles.benefitsPanel}>
            <div className={styles.benefitsTitle}>
              <OceanEmblem className={styles.benefitsEmblem} />
              <h2 id="about-benefits-heading">Why Work With Us</h2>
            </div>
            <ul className={styles.benefitGrid}>
              {benefits.map((benefit) => (
                <li key={benefit.title}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </PageContainer>
      </section>

      <section
        className={styles.ctaSection}
        aria-labelledby="about-cta-heading"
      >
        <PageContainer>
          <div className={styles.cta}>
            <OceanLines className={styles.ctaWaves} id="about-cta-wave" />
            <div className={styles.ctaCopy}>
              <h2 id="about-cta-heading">Let&apos;s Build Something Great</h2>
              <p>
                Ready to create a website or set up the right tools for your
                business?
              </p>
            </div>
            <Link
              href="/consultation"
              className={`home-button ${styles.consultationButton}`}
            >
              Get a Consultation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
