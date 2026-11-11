import type { Metadata } from "next";
import Image from "next/image";
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

function DeviceVisual() {
  return (
    <div
      className={styles.devices}
      role="img"
      aria-label="Laptop and phone displaying the approved Steady Start logo"
    >
      <div className={styles.deviceGlow} />
      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          <span className={styles.camera} />
          <Image
            src="/logo.png"
            alt=""
            width={120}
            height={120}
            sizes="(max-width: 767px) 80px, 100px"
            priority
          />
          <p>
            Steady Start<span>LLC</span>
          </p>
        </div>
        <div className={styles.keyboard} />
        <div className={styles.laptopBase} />
      </div>
      <div className={styles.phone}>
        <span className={styles.phoneCamera} />
        <Image src="/logo.png" alt="" width={64} height={64} sizes="48px" />
        <p>
          Steady Start<span>LLC</span>
        </p>
        <span className={styles.phoneHome} />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-heading">
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
          <h2 id="about-benefits-heading">Why Work With Us</h2>
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
        </PageContainer>
      </section>

      <section
        className={styles.ctaSection}
        aria-labelledby="about-cta-heading"
      >
        <PageContainer>
          <div className={styles.cta}>
            <div>
              <h2 id="about-cta-heading">Let&apos;s Build Something Great</h2>
              <p>
                Ready to create a website or set up the right tools for your
                business?
              </p>
            </div>
            <Link
              href="/consultation"
              className="home-button home-button-primary"
            >
              Get a Consultation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
