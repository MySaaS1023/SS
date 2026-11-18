import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { Hero } from "../components/hero";

Object.assign(globalThis, { React });

test("homepage technology graphic preserves accessible copy, actions and technology background", () => {
  const html = renderToStaticMarkup(React.createElement(Hero));
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  assert.match(text, /Launch Your Business Online With Confidence/);
  assert.match(text, /From custom websites to AI automation, we create a professional online presence that helps your business grow, save time, and bring in more customers\./);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/<a\b/g) ?? []).length, 2);
  assert.match(html, /href="\/get-started"/);
  assert.match(html, /href="\/#services"/);
  assert.match(text, /Start Your Project.*Learn More/);
  assert.match(html, /class="ocean-mesh\s*"/);
  assert.match(html, /class="ocean-wave\s*"/);
  assert.match(html, /home-hero-technology-transparent\.webp/);
  assert.match(html, /class="home-hero-technology-visual" aria-hidden="true"/);
  assert.match(html, /alt=""/);
  assert.doesNotMatch(html, /home-hero-technology\.webp|home-hero-geometric-emblem\.svg|ocean-(?:devices|laptop|phone|device-glow)|class="ocean-emblem/);
});

test("optimized transparent graphic retains real alpha and matching intrinsic space without cropping", async () => {
  const asset = readFileSync("public/brand/home-hero-technology-transparent.webp");
  const metadata = await sharp(asset).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.hasAlpha, true);
  assert.ok(metadata.width && metadata.height);
  // Preserve the complete supplied transparent 1536 x 1024 cutout.
  assert.equal(metadata.width / metadata.height, 1536 / 1024);
  assert.ok(asset.length < 120_000, "Hero artwork should remain below 120 KB");
  const { data, info } = await sharp(asset).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alphaAt = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
  for (const [x, y] of [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]]) {
    assert.equal(alphaAt(x, y), 0, "Artwork corners must be genuinely transparent");
  }
  for (let x = 0; x < info.width; x++) {
    // The supplied cutout has sparse 1/255 alpha pixels on its bottom border.
    // Preserve that near-transparent edge, while rejecting any solid strip.
    assert.ok(alphaAt(x, info.height - 1) <= 1, "No opaque/light-blue bottom strip may remain");
  }
  let transparentPixels = 0;
  let softEdgePixels = 0;
  let visiblePixels = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) transparentPixels++;
    if (data[i] > 0 && data[i] < 255) softEdgePixels++;
    if (data[i] > 200) visiblePixels++;
  }
  assert.ok(transparentPixels > info.width * info.height * 0.4, "Cutout must retain transparent negative space");
  assert.ok(softEdgePixels > 0, "Blue lighting and softened edges need partial alpha");
  assert.ok(visiblePixels > info.width * info.height * 0.1, "Device and icon artwork must remain visible");
  const html = renderToStaticMarkup(React.createElement(Hero));
  assert.match(html, new RegExp(`width="${metadata.width}"`));
  assert.match(html, new RegExp(`height="${metadata.height}"`));
  assert.match(html, /src="\/brand\/home-hero-technology-transparent\.webp"/);
  assert.doesNotMatch(html, /\/_next\/image/);
});
