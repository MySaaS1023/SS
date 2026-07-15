"use client";

import { useEffect, useState } from "react";

import { PortfolioSlide } from "@/lib/portfolio-data";

type PortfolioAlbumProps = {
  animation: "from-left" | "from-right";
  title: string;
  slides: PortfolioSlide[];
};

function clampSlideIndex(index: number, total: number) {
  if (index < 0) {
    return total - 1;
  }

  if (index >= total) {
    return 0;
  }

  return index;
}

function PortfolioAlbum({ animation, title, slides }: PortfolioAlbumProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((currentIndex) => clampSlideIndex(currentIndex - 1, slides.length));
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((currentIndex) => clampSlideIndex(currentIndex + 1, slides.length));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  function goToPrevious() {
    setActiveIndex((currentIndex) => clampSlideIndex(currentIndex - 1, slides.length));
  }

  function goToNext() {
    setActiveIndex((currentIndex) => clampSlideIndex(currentIndex + 1, slides.length));
  }

  function handleTouchEnd(touchEndX: number) {
    if (touchStartX === null) {
      return;
    }

    const swipeDistance = touchStartX - touchEndX;

    if (Math.abs(swipeDistance) > 42) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStartX(null);
  }

  if (!activeSlide) {
    return null;
  }

  return (
    <section
      className={`portfolio-album portfolio-album-${animation} glass-card flex h-full flex-col rounded-[1.5rem] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.32)] sm:p-5`}
      aria-roledescription="carousel"
      aria-label={`${title} portfolio album`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            {title}
          </h2>
          <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            {activeSlide.pageLabel}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-white" aria-live="polite">
          {activeIndex + 1} / {slides.length}
        </p>
      </div>

      <div
        className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-[1.15rem] border border-[rgba(148,163,184,0.14)] bg-[linear-gradient(135deg,rgba(2,6,23,0.72),rgba(15,23,42,0.88))] p-3 sm:min-h-[430px] lg:min-h-[500px]"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <button
          type="button"
          onClick={goToPrevious}
          aria-label={`Show previous ${title} screenshot`}
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(2,6,23,0.72)] text-xl text-white shadow-[0_16px_36px_rgba(2,6,23,0.32)] transition hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.22)] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.24)]"
        >
          {"\u2190"}
        </button>

        <img
          key={activeSlide.id}
          src={activeSlide.imageSrc}
          alt={activeSlide.imageAlt}
          className="max-h-[470px] w-full max-w-full rounded-xl object-contain sm:max-h-[560px]"
        />

        <button
          type="button"
          onClick={goToNext}
          aria-label={`Show next ${title} screenshot`}
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(2,6,23,0.72)] text-xl text-white shadow-[0_16px_36px_rgba(2,6,23,0.32)] transition hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.22)] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.24)]"
        >
          {"\u2192"}
        </button>
      </div>

      <div
        className="mt-4 flex flex-wrap justify-center gap-2"
        aria-label={`${title} slide progress`}
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${slide.pageLabel}`}
            className={`h-2.5 rounded-full transition focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.2)] ${
              activeIndex === index
                ? "w-8 bg-[#3B82F6]"
                : "w-2.5 bg-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.32)]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

type PortfolioAlbumGridProps = {
  ecommerceSlides: PortfolioSlide[];
  serviceSlides: PortfolioSlide[];
};

export function PortfolioAlbumGrid({
  ecommerceSlides,
  serviceSlides,
}: PortfolioAlbumGridProps) {
  return (
    <div className="mx-auto grid w-[min(1180px,92vw)] gap-6 lg:grid-cols-2">
      <PortfolioAlbum
        animation="from-left"
        title="Service Business"
        slides={serviceSlides}
      />
      <PortfolioAlbum
        animation="from-right"
        title="E-commerce"
        slides={ecommerceSlides}
      />
    </div>
  );
}
