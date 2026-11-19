import Image from "next/image";
import type { ReactNode } from "react";

type IconKind = "store" | "home" | "business" | "design";

function TemplateIcon({ kind }: { kind: IconKind }) {
  const paths: Record<IconKind, ReactNode> = {
    store: <><path d="m3 4 2 1 3 12h10l3-9H7M9 21h.01M18 21h.01" /><path d="M9 4h10" /></>,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7" /></>,
    business: <><path d="M5 21V3h11v18M16 9h4v12M9 7h3M9 11h3M9 15h3M2 21h20" /></>,
    design: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4m-4-12-2 2 2 2m8-4 2 2-2 2m-5 1 2-6" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>;
}

function BrowserBar() {
  return <div data-browser-bar=""><span data-browser-dots=""><i /><i /><i /></span><span>Template preview</span><span data-browser-menu="">···</span></div>;
}

function SampleNavigation({ kind, name }: { kind: IconKind; name: string }) {
  const links = kind === "store" ? ["Home", "Shop", "Collections"] : ["Home", "Services", "Contact"];
  return <div data-sample-navigation=""><span data-sample-brand=""><TemplateIcon kind={kind} />{name}</span><span data-sample-nav="">{links.map((label) => <span key={label}>{label}</span>)}</span></div>;
}

const features: { label: string; kind: IconKind }[] = [
  { label: "Service Business Websites", kind: "home" },
  { label: "Online Stores", kind: "store" },
  { label: "Professional Business Websites", kind: "business" },
  { label: "Custom Website Design", kind: "design" },
];

export function AboutTemplateShowcase({ className }: { className?: string }) {
  return (
    <figure className={className} aria-label="Illustrative website template showcase">
      <div data-template-stage="" aria-hidden="true">
        <svg data-template-circuits="" viewBox="0 0 1000 580" preserveAspectRatio="none" fill="none">
          <path d="M-30 492C160 570 246 350 449 424S774 505 1030 236M-20 457C200 539 247 337 445 405S778 482 1020 211" stroke="currentColor" strokeWidth="1.5" />
          <path d="M134 458h113l54-39h432l95 55h77" stroke="currentColor" strokeWidth="1" />
          {[ [153, 480], [298, 421], [674, 444], [868, 375] ].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="3.5" fill="currentColor" />)}
        </svg>
        <article data-template-window="services">
          <BrowserBar />
          <SampleNavigation kind="home" name="Your Business" />
          <div data-sample-body="">
            <Image src="/templates/about-home-services.webp" alt="" width={960} height={640} sizes="(max-width: 639px) 100vw, 560px" priority unoptimized />
            <div data-sample-copy="">
              <p data-sample-eyebrow="">A website built around your services</p>
              <p data-sample-title="">Professional<br />Home Services</p>
              <p data-sample-description="">A clear introduction. An easy next step.</p>
              <div data-sample-actions=""><span data-sample-cta="">Get a Quote</span><span data-sample-secondary="">Our Services</span></div>
            </div>
          </div>
        </article>
        <article data-template-window="store">
          <BrowserBar />
          <SampleNavigation kind="store" name="Your Store" />
          <div data-sample-body="">
            <Image src="/templates/about-store.webp" alt="" width={960} height={640} sizes="(max-width: 639px) 50vw, 340px" loading="lazy" unoptimized />
            <div data-sample-copy=""><p data-sample-eyebrow="">Made for your collection</p><p data-sample-title="">Custom<br />Apparel<br />&amp; More</p><span data-sample-cta="">Shop the Collection</span></div>
          </div>
        </article>
        <article data-template-window="corporate">
          <BrowserBar />
          <SampleNavigation kind="business" name="Your Company" />
          <div data-sample-body="">
            <Image src="/templates/about-corporate.webp" alt="" width={960} height={640} sizes="(max-width: 639px) 50vw, 340px" loading="lazy" unoptimized />
            <div data-sample-copy=""><p data-sample-eyebrow="">Present your expertise</p><p data-sample-title="">Business<br />Consulting<br />&amp; Solutions</p><span data-sample-cta="">Get Started</span></div>
          </div>
        </article>
        <div data-template-platform="" />
      </div>
      <ul data-template-features="" aria-label="Website design possibilities">
        {features.map(({ label, kind }) => <li key={label}><TemplateIcon kind={kind} /><span>{label}</span></li>)}
      </ul>
      <figcaption>Illustrative website templates — not client projects.</figcaption>
    </figure>
  );
}
