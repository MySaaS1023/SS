"use client";

import { useEffect, useMemo, useState } from "react";

import { PortfolioCategory, PortfolioSlide } from "@/lib/portfolio-data";

type PortfolioCarouselProps = {
  slides: PortfolioSlide[];
};

type PortfolioFilter = "all" | PortfolioCategory;

const filters: Array<{ label: string; value: PortfolioFilter }> = [
  { label: "All Work", value: "all" },
  { label: "Service Businesses", value: "service" },
  { label: "Product Businesses", value: "product" },
];

function clampSlideIndex(index: number, total: number) {
  if (index < 0) {
    return total - 1;
  }

  if (index >= total) {
    return 0;
  }

  return index;
}

export function PortfolioCarousel({ slides }: PortfolioCarouselProps) {
  const [activeFilter, setActiveFilter] = useState<PortfolioFilter>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const visibleSlides = useMemo(() => {
    if (activeFilter === "all") {
      return slides;
    }

    return slides.filter((slide) => slide.category === activeFilter);
  }, [activeFilter, slides]);

  const activeSlide = visibleSlides[activeIndex] ?? visibleSlides[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          clampSlideIndex(currentIndex - 1, visibleSlides.length),
        );
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((currentIndex) =>
          clampSlideIndex(currentIndex + 1, visibleSlides.length),
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleSlides.length]);

  function goToPrevious() {
    setActiveIndex((currentIndex) =>
      clampSlideIndex(currentIndex - 1, visibleSlides.length),
    );
  }

  function goToNext() {
    setActiveIndex((currentIndex) =>
      clampSlideIndex(currentIndex + 1, visibleSlides.length),
    );
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
    <div className="mx-auto w-[min(1200px,92vw)]">
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.2)] ${
                isActive
                  ? "border-[#3B82F6] bg-[#3B82F6] text-white shadow-[0_16px_32px_rgba(59,130,246,0.24)]"
                  : "border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.04)] text-[var(--muted)] hover:border-[rgba(59,130,246,0.32)] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <section
        className="glass-card overflow-hidden rounded-[1.75rem] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.38)] sm:p-5 lg:p-6"
        aria-roledescription="carousel"
        aria-label="Steady Start portfolio screenshots"
      >
        <div className="space-y-5">
          <div
            className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[1.25rem] border border-[rgba(148,163,184,0.14)] bg-[linear-gradient(135deg,rgba(2,6,23,0.72),rgba(15,23,42,0.88))] p-3 sm:min-h-[520px] lg:min-h-[680px] xl:min-h-[760px]"
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Show previous portfolio screenshot"
              className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(2,6,23,0.72)] text-2xl text-white shadow-[0_16px_36px_rgba(2,6,23,0.32)] transition hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.22)] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.24)] sm:flex"
            >
              {"\u2190"}
            </button>

            <img
              key={activeSlide.id}
              src={activeSlide.imageSrc}
              alt={activeSlide.imageAlt}
              className="max-h-[720px] w-full max-w-full rounded-xl object-contain sm:max-h-[760px] lg:max-h-[800px]"
            />

            <button
              type="button"
              onClick={goToNext}
              aria-label="Show next portfolio screenshot"
              className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(2,6,23,0.72)] text-2xl text-white shadow-[0_16px_36px_rgba(2,6,23,0.32)] transition hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.22)] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.24)] sm:flex"
            >
              {"\u2192"}
            </button>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              {activeSlide.pageLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
              {activeSlide.projectName}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#bfdbfe]">
              {activeSlide.businessType}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {activeSlide.description}
            </p>

            <div className="mt-5">
              <p className="text-sm font-semibold text-white" aria-live="polite">
                {activeIndex + 1} / {visibleSlides.length}
              </p>
              <div
                className="mt-4 flex flex-wrap justify-center gap-2"
                aria-label="Portfolio slide progress"
              >
                {visibleSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${slide.projectName} ${slide.pageLabel}`}
                    className={`h-2.5 rounded-full transition focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.2)] ${
                      activeIndex === index
                        ? "w-8 bg-[#3B82F6]"
                        : "w-2.5 bg-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.32)]"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Show previous portfolio screenshot"
                  className="rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[rgba(59,130,246,0.12)] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.2)]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Show next portfolio screenshot"
                  className="rounded-xl border border-[#3B82F6] bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[rgba(59,130,246,0.2)]"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
