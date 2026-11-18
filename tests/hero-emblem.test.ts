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
  assert.match(html, /home-hero-technology\.webp/);
  assert.match(html, /class="home-hero-technology-visual" aria-hidden="true"/);
  assert.match(html, /alt=""/);
  assert.doesNotMatch(html, /home-hero-geometric-emblem\.svg|ocean-(?:devices|laptop|phone|device-glow)|class="ocean-emblem/);
});

test("optimized approved graphic decodes and reserves matching intrinsic space without cropping", async () => {
  const asset = readFileSync("public/brand/home-hero-technology.webp");
  const metadata = await sharp(asset).metadata();
  assert.equal(metadata.format, "webp");
  assert.ok(metadata.width && metadata.height);
  // Preserve the full approved 1273 x 1236 artwork, allowing resize rounding.
  assert.ok(Math.abs(metadata.width / metadata.height - 1273 / 1236) < 0.001);
  assert.ok(asset.length < 120_000, "Hero artwork should remain below 120 KB");
  await sharp(asset).raw().toBuffer();
  const html = renderToStaticMarkup(React.createElement(Hero));
  assert.match(html, new RegExp(`width="${metadata.width}"`));
  assert.match(html, new RegExp(`height="${metadata.height}"`));
  assert.match(html, /srcSet=/);
  assert.match(html, /sizes="\(max-width: 767px\) 280px, 330px"/);
});
