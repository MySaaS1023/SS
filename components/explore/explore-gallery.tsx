"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState, type FocusEvent } from "react";
import { exploreClients } from "@/lib/explore-clients";
import {
  designCategories,
  designInquiryHref,
  filterWebsiteDesigns,
  nextClientIndex,
  shouldAutoplayClientSlider,
  websiteDesigns,
  type DesignCategory,
  type WebsiteDesign,
} from "@/lib/explore-designs";
import { SampleWebsite } from "./sample-website";

export function ClientWebsiteSlider() {
  const [index, setIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const autoplay = shouldAutoplayClientSlider({
    paused: paused || hidden,
    hovered,
    focused,
    reducedMotion,
  });
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(
      () =>
        setIndex((current) =>
          nextClientIndex(current, 1, exploreClients.length),
        ),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [autoplay]);
  function select(next: number) {
    setPaused(true);
    setIndex(nextClientIndex(next, 0, exploreClients.length));
  }
  function leaveFocus(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setFocused(false);
  }
  const client = exploreClients[index];
  return (
    <div
      className="explore-client-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Completed client websites"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={leaveFocus}
    >
      <div
        className="explore-client-slide"
        key={client.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${exploreClients.length}: ${client.name}`}
        aria-live={autoplay ? "off" : "polite"}
      >
        <div className="explore-client-copy">
          <span className="explore-kicker">FEATURED CLIENT PROJECT</span>
          <h3>{client.name}</h3>
          <p>{client.description}</p>
          <a
            className="explore-button"
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${client.name} live website (opens in a new tab)`}
          >
            Visit Live Website <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="explore-browser explore-client-browser">
          <div className="explore-browser-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <small>{new URL(client.url).hostname}</small>
          </div>
          <div className="explore-client-screen">
            {client.imageSrc ? (
              <Image
                src={client.imageSrc}
                alt={client.imageAlt}
                width={1200}
                height={721}
                unoptimized
                loading="lazy"
              />
            ) : (
              <div className="explore-missing-asset">
                <svg
                  viewBox="0 0 64 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="60" height="40" rx="4" />
                  <path d="M2 10h60M22 47h20M32 42v5" />
                  <circle cx="22" cy="22" r="3" />
                  <path d="m10 35 12-8 10 6 10-12 12 14" />
                </svg>
                <strong>Homepage screenshot pending</strong>
                <p>
                  The live project is available using the website link. No
                  substitute image is shown.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="explore-slider-controls">
        <button
          type="button"
          onClick={() => select(index - 1)}
          aria-label="Previous client website"
        >
          ←
        </button>
        <div
          className="explore-slide-dots"
          aria-label="Choose a client website"
        >
          {exploreClients.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${item.name}`}
              aria-pressed={index === i}
              onClick={() => select(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => select(index + 1)}
          aria-label="Next client website"
        >
          →
        </button>
        <button
          type="button"
          className="explore-play-control"
          disabled={reducedMotion}
          onClick={() => setPaused((current) => !current)}
          aria-label={
            paused ? "Play client slideshow" : "Pause client slideshow"
          }
        >
          {reducedMotion ? "Motion off" : paused ? "▶ Play" : "Ⅱ Pause"}
        </button>
      </div>
      <p className="explore-slider-status">
        {index + 1} / {exploreClients.length} ·{" "}
        {reducedMotion
          ? "Automatic transitions disabled by your motion preference."
          : "Advances every 5 seconds. Pauses while you browse."}
      </p>
    </div>
  );
}

function DesignPreview({
  design,
  onClose,
}: {
  design: WebsiteDesign | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  useEffect(() => {
    if (!design) return;
    const element = dialog.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (element && !element.open) element.showModal();
    close.current?.focus();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [design]);
  if (!design) return null;
  return (
    <dialog
      ref={dialog}
      className="explore-preview-dialog"
      aria-labelledby="design-preview-title"
      aria-describedby="design-preview-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="explore-dialog-toolbar">
        <div>
          <span className="explore-kicker">CUSTOMIZABLE SAMPLE PREVIEW</span>
          <h2 id="design-preview-title">{design.name}</h2>
        </div>
        <button
          ref={close}
          type="button"
          className="explore-close"
          onClick={onClose}
          aria-label="Close design preview"
        >
          ✕
        </button>
      </div>
      <p id="design-preview-description" className="explore-preview-note">
        An illustrative static design, not a live store or booking system.
        Layout, colors, content, and integrations can be tailored to your
        business.
      </p>
      <div className="explore-preview-actions">
        <div role="group" aria-label="Preview display size">
          <button
            type="button"
            aria-pressed={viewport === "desktop"}
            onClick={() => setViewport("desktop")}
          >
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={viewport === "mobile"}
            onClick={() => setViewport("mobile")}
          >
            Mobile
          </button>
        </div>
        <Link href={designInquiryHref(design.id)} className="explore-button">
          Use This Design <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className={`explore-preview-canvas explore-preview-${viewport}`}>
        <div className="explore-browser">
          <div className="explore-browser-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <small>Illustrative sample website</small>
          </div>
          <SampleWebsite design={design} />
        </div>
      </div>
    </dialog>
  );
}

export function WebsiteDesignGallery() {
  const [category, setCategory] = useState<DesignCategory>("all");
  const [preview, setPreview] = useState<WebsiteDesign | null>(null);
  const designs = filterWebsiteDesigns(category);
  return (
    <>
      <div
        className="explore-filters"
        role="group"
        aria-label="Filter website designs"
      >
        {designCategories.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="explore-filter-status" role="status">
        {designs.length} {designs.length === 1 ? "design" : "designs"} ·
        Original, customizable samples
      </p>
      <div className="explore-design-grid">
        {designs.map((design) => (
          <article key={design.id} className="explore-design-card">
            <div className="explore-card-visual" aria-hidden="true">
              <div className="explore-browser">
                <div className="explore-browser-bar">
                  <span />
                  <span />
                  <span />
                </div>
                <SampleWebsite design={design} compact />
              </div>
            </div>
            <div className="explore-card-content">
              <span className="explore-sample-tag">ILLUSTRATIVE SAMPLE</span>
              <h3>{design.name}</h3>
              <p>{design.description}</p>
              <div className="explore-card-actions">
                <button
                  type="button"
                  className="explore-button-secondary"
                  aria-label={`Preview ${design.name} design`}
                  onClick={() => setPreview(design)}
                >
                  Preview Design
                </button>
                <Link
                  className="explore-design-link"
                  href={designInquiryHref(design.id)}
                  aria-label={`Use ${design.name} design`}
                >
                  Use This Design <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <DesignPreview
        key={preview?.id ?? "closed"}
        design={preview}
        onClose={() => setPreview(null)}
      />
    </>
  );
}

export function ExploreHeroMockup() {
  const design = websiteDesigns[0];
  return (
    <figure
      className="explore-hero-art"
      aria-label="Desktop and mobile sample website mockups"
    >
      <div className="explore-hero-desktop explore-browser" aria-hidden="true">
        <div className="explore-browser-bar">
          <span />
          <span />
          <span />
        </div>
        <SampleWebsite design={design} compact />
      </div>
      <div className="explore-hero-phone" aria-hidden="true">
        <SampleWebsite design={design} compact />
      </div>
      <figcaption>
        One custom website. A great experience on every screen.
      </figcaption>
    </figure>
  );
}
