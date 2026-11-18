"use client";

import NextImage from "next/image";
import { useEffect, useReducer, useRef } from "react";
import {
  aboutPortfolioSlides,
  galleryIsRotating,
  galleryReducer,
  initialGalleryState,
  scheduleGalleryRotation,
} from "@/lib/about-portfolio-gallery";

export function AboutPortfolioGallery({ className }: { className?: string }) {
  const [state, dispatch] = useReducer(galleryReducer, initialGalleryState);
  const rotationIntent = useRef<"play" | "pause" | null>(null);
  const slides = aboutPortfolioSlides;
  const active = slides[state.index];
  const rotating = galleryIsRotating(state);
  const motionDisabled = state.environmentReady && state.reducedMotion;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateEnvironment = () => dispatch({ type: "environment", hidden: document.hidden, reducedMotion: motion.matches });
    updateEnvironment();
    motion.addEventListener("change", updateEnvironment);
    document.addEventListener("visibilitychange", updateEnvironment);
    return () => {
      motion.removeEventListener("change", updateEnvironment);
      document.removeEventListener("visibilitychange", updateEnvironment);
    };
  }, []);

  useEffect(() => scheduleGalleryRotation(rotating, () => dispatch({ type: "tick", total: slides.length }), (callback, interval) => {
    const timer = window.setInterval(callback, interval);
    return () => window.clearInterval(timer);
  }), [rotating, slides.length]);

  useEffect(() => {
    if (!state.environmentReady || state.hidden) return;
    const next = new window.Image();
    next.decoding = "async";
    next.fetchPriority = "low";
    next.src = slides[(state.index + 1) % slides.length].src;
  }, [state.environmentReady, state.hidden, state.index, slides]);

  function select(index: number) {
    dispatch({ type: "select", index, total: slides.length });
  }

  return (
    <section
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label="Steady Start client website portfolio"
      tabIndex={0}
      onMouseEnter={() => dispatch({ type: "hover", hovered: true })}
      onMouseLeave={() => dispatch({ type: "hover", hovered: false })}
      onFocusCapture={() => dispatch({ type: "pause" })}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          select(state.index + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
    >
      <div data-gallery-frame="" onClick={() => dispatch({ type: "pause" })}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-gallery-slide=""
            data-active={index === state.index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.page}`}
            aria-hidden={index !== state.index}
          >
            <NextImage
              src={slide.src}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1152px) 48vw, 540px"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
              unoptimized
            />
          </div>
        ))}
      </div>
      <div data-gallery-caption="" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        <p>{active.business}</p>
        <span>{active.page} · {state.index + 1} of {slides.length}</span>
      </div>
      <div data-gallery-controls="">
        <button type="button" aria-label="Previous portfolio screenshot" onClick={() => select(state.index - 1)}><span aria-hidden="true">←</span></button>
        <div data-gallery-dots="" role="group" aria-label="Choose a portfolio screenshot">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" aria-label={`Show ${slide.business} — ${slide.page}`} aria-current={index === state.index ? "true" : undefined} onClick={() => select(index)}><span aria-hidden="true" /></button>
          ))}
        </div>
        <button type="button" aria-label="Next portfolio screenshot" onClick={() => select(state.index + 1)}><span aria-hidden="true">→</span></button>
        <button
          data-gallery-rotation=""
          type="button"
          disabled={motionDisabled}
          aria-label={motionDisabled ? "Automatic slideshow disabled for reduced motion" : state.paused ? "Play slideshow" : "Pause slideshow"}
          onPointerDown={() => { rotationIntent.current = state.paused ? "play" : "pause"; }}
          onPointerCancel={() => { rotationIntent.current = null; }}
          onKeyDown={() => { rotationIntent.current = null; }}
          onClick={() => {
            dispatch({ type: rotationIntent.current ?? (state.paused ? "play" : "pause") });
            rotationIntent.current = null;
          }}
        >{motionDisabled ? "Auto-play off" : state.paused ? "Play" : "Pause"}</button>
      </div>
    </section>
  );
}
