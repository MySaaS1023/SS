import { serviceBusinessSlides } from "@/lib/portfolio-data";

export const GALLERY_INTERVAL_MS = 4500;

const selectedViews = [
  { id: "service-homepage", page: "Homepage", image: "about-apex-homepage.webp", width: 1200, height: 721 },
  { id: "service-services", page: "Services section", image: "about-apex-services.webp", width: 1200, height: 625 },
  { id: "service-recent-work", page: "Recent work section", image: "about-apex-recent-work.webp", width: 1200, height: 537 },
] as const;

export const aboutPortfolioSlides = selectedViews.map((view) => {
  const original = serviceBusinessSlides.find((slide) => slide.id === view.id);
  if (!original) throw new Error("Approved portfolio screenshot is missing");
  return {
    id: view.id,
    business: "Apex Landscaping & Home Repair LLC",
    page: view.page,
    src: `/portfolio/${view.image}`,
    originalSrc: original.imageSrc,
    alt: `Apex Landscaping & Home Repair LLC website — ${view.page.toLowerCase()} screenshot`,
    width: view.width,
    height: view.height,
  };
});

export type GalleryState = {
  index: number;
  paused: boolean;
  hovered: boolean;
  hidden: boolean;
  reducedMotion: boolean;
  environmentReady: boolean;
};

export const initialGalleryState: GalleryState = {
  index: 0,
  paused: false,
  hovered: false,
  hidden: true,
  reducedMotion: true,
  environmentReady: false,
};

export type GalleryAction =
  | { type: "environment"; hidden: boolean; reducedMotion: boolean }
  | { type: "hover"; hovered: boolean }
  | { type: "pause" }
  | { type: "play" }
  | { type: "select"; index: number; total: number }
  | { type: "tick"; total: number };

export function galleryIsRotating(state: GalleryState) {
  return state.environmentReady && !state.paused && !state.hovered && !state.hidden && !state.reducedMotion;
}

function wrap(index: number, total: number) {
  return total > 0 ? ((index % total) + total) % total : 0;
}

export function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case "environment":
      return { ...state, environmentReady: true, hidden: action.hidden, reducedMotion: action.reducedMotion, paused: state.paused || action.reducedMotion };
    case "hover":
      return { ...state, hovered: action.hovered };
    case "pause":
      return { ...state, paused: true };
    case "play":
      return state.reducedMotion ? state : { ...state, paused: false };
    case "select":
      return { ...state, index: wrap(action.index, action.total), paused: true };
    case "tick":
      return galleryIsRotating(state) ? { ...state, index: wrap(state.index + 1, action.total) } : state;
  }
}

export function scheduleGalleryRotation(
  enabled: boolean,
  next: () => void,
  every: (callback: () => void, interval: number) => () => void,
) {
  return enabled ? every(next, GALLERY_INTERVAL_MS) : () => {};
}
