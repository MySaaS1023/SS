import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { AboutPortfolioGallery } from "../components/about-portfolio-gallery";
import {
  aboutPortfolioSlides,
  galleryIsRotating,
  galleryReducer,
  initialGalleryState,
  scheduleGalleryRotation,
} from "../lib/about-portfolio-gallery";
import { serviceBusinessSlides } from "../lib/portfolio-data";

Object.assign(globalThis, { React });

function ready() {
  return galleryReducer(initialGalleryState, { type: "environment", hidden: false, reducedMotion: false });
}

test("gallery never starts before motion preference and document visibility are known", () => {
  assert.equal(galleryIsRotating(initialGalleryState), false);
  assert.deepEqual(galleryReducer(initialGalleryState, { type: "tick", total: 3 }), initialGalleryState);
  assert.equal(galleryIsRotating(ready()), true);
});

test("automatic gallery advances and wraps, while manual navigation stops rotation until explicit play", () => {
  let state = ready();
  for (const expected of [1, 2, 0]) {
    state = galleryReducer(state, { type: "tick", total: 3 });
    assert.equal(state.index, expected);
  }
  state = galleryReducer(state, { type: "select", index: -1, total: 3 });
  assert.equal(state.index, 2);
  assert.equal(galleryIsRotating(state), false);
  assert.equal(galleryReducer(state, { type: "tick", total: 3 }).index, 2);
  state = galleryReducer(state, { type: "play" });
  assert.equal(galleryIsRotating(state), true);
  assert.equal(galleryReducer(state, { type: "tick", total: 3 }).index, 0);
});

test("hover, focus pause and hidden-tab state prevent unexpected automatic changes", () => {
  const hovering = galleryReducer(ready(), { type: "hover", hovered: true });
  assert.equal(galleryIsRotating(hovering), false);
  assert.equal(galleryReducer(hovering, { type: "tick", total: 3 }).index, 0);
  assert.equal(galleryIsRotating(galleryReducer(hovering, { type: "hover", hovered: false })), true);
  const focused = galleryReducer(hovering, { type: "pause" });
  assert.equal(galleryIsRotating(galleryReducer(focused, { type: "hover", hovered: false })), false);
  const hidden = galleryReducer(ready(), { type: "environment", reducedMotion: false, hidden: true });
  assert.equal(galleryIsRotating(hidden), false);
  assert.equal(galleryReducer(hidden, { type: "tick", total: 3 }).index, 0);
  assert.equal(galleryIsRotating(galleryReducer(hidden, { type: "environment", reducedMotion: false, hidden: false })), true);
});

test("reduced motion disables automatic rotation including later preference changes", () => {
  let state = galleryReducer(ready(), { type: "environment", hidden: false, reducedMotion: true });
  assert.equal(galleryIsRotating(state), false);
  assert.equal(galleryIsRotating(galleryReducer(state, { type: "play" })), false);
  state = galleryReducer(state, { type: "select", index: 1, total: 3 });
  assert.equal(state.index, 1, "Manual controls remain available with reduced motion");
  state = galleryReducer(state, { type: "environment", hidden: false, reducedMotion: false });
  assert.equal(galleryIsRotating(state), false, "Do not unexpectedly restart after preference changes");
  assert.equal(galleryIsRotating(galleryReducer(state, { type: "play" })), true);
});

test("gallery rotation uses 4.5-second scheduling and exposes cleanup without starting paused timers", () => {
  let called = 0;
  let cleared = 0;
  let tick: (() => void) | undefined;
  const every = (callback: () => void, interval: number) => {
    called++;
    assert.equal(interval, 4500);
    tick = callback;
    return () => { cleared++; };
  };
  let advanced = 0;
  const idle = scheduleGalleryRotation(false, () => advanced++, every);
  assert.equal(called, 0);
  idle();
  assert.equal(cleared, 0);
  const cleanup = scheduleGalleryRotation(true, () => advanced++, every);
  assert.equal(called, 1);
  tick?.();
  assert.equal(advanced, 1);
  cleanup();
  assert.equal(cleared, 1);
});

test("SSR provides one accessible active screenshot, descriptive controls and a real first image", () => {
  const html = renderToStaticMarkup(React.createElement(AboutPortfolioGallery, { className: "portfolio-fixture" }));
  assert.match(html, /aria-roledescription="carousel"/);
  assert.equal((html.match(/aria-roledescription="slide"/g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="false"/g) ?? []).length, 1);
  assert.equal((html.match(/<div[^>]+aria-roledescription="slide"[^>]+aria-hidden="true"/g) ?? []).length, 2);
  assert.match(html, /Apex Landscaping &amp; Home Repair LLC website — homepage screenshot/);
  assert.match(html, /src="\/portfolio\/about-apex-homepage.webp"/);
  assert.match(html, /aria-label="Previous portfolio screenshot"/);
  assert.match(html, /aria-label="Next portfolio screenshot"/);
  assert.match(html, /aria-label="Pause slideshow"/);
  assert.equal((html.match(/aria-current="true"/g) ?? []).length, 1);
  assert.match(html, /tabindex="0"/);
  assert.doesNotMatch(html, /Reliable Climate|MM.Ark|Aspiration|\/portfolio\/mmark|<form|<iframe/);
});

test("gallery assets are full approved Apex screenshots, optimized and correctly dimensioned", async () => {
  assert.equal(aboutPortfolioSlides.length, 3);
  assert.equal(new Set(aboutPortfolioSlides.map((slide) => slide.business)).size, 1);
  let totalBytes = 0;
  for (const slide of aboutPortfolioSlides) {
    const canonical = serviceBusinessSlides.find((source) => source.id === slide.id);
    assert.equal(canonical?.imageSrc, slide.originalSrc);
    const original = await sharp(await readFile(`public${slide.originalSrc}`)).metadata();
    const asset = await readFile(`public${slide.src}`);
    const metadata = await sharp(asset).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, slide.width);
    assert.equal(metadata.height, slide.height);
    assert.ok(original.width && original.height);
    assert.ok(Math.abs(slide.width / slide.height - original.width / original.height) < 0.003, "Preserve the full original screenshot aspect ratio");
    assert.ok(asset.length < 160_000);
    await sharp(asset).raw().toBuffer();
    totalBytes += asset.length;
  }
  assert.ok(totalBytes < 300_000);
});
