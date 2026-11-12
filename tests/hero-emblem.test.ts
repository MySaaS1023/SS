import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "../components/hero";

Object.assign(globalThis, { React });

test("homepage hero replaces devices while preserving accessible copy, actions and technology background", () => {
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
  assert.match(html, /src="\/brand\/home-hero-geometric-emblem\.svg"/);
  assert.match(html, /class="home-hero-emblem-visual" aria-hidden="true"/);
  assert.match(html, /alt=""/);
  assert.doesNotMatch(html, /ocean-(?:devices|laptop|phone|device-glow)|Laptop and phone|class="ocean-emblem/);
});

test("hero asset uses eight transparent rotational petals with a genuine pointed outer join", () => {
  const svg = readFileSync("public/brand/home-hero-geometric-emblem.svg", "utf8");
  assert.match(svg, /viewBox="0 0 512 512"/);
  assert.match(svg, /fill="none"/);
  assert.match(svg, /stroke-width="2\.25"/);
  assert.match(svg, /stroke="#[0-9a-f]{6}"/i);
  assert.doesNotMatch(svg, /<(?:ellipse|circle|image|script|foreignObject)\b|data:|https?:\/\/(?!www\.w3\.org)/i);
  const petals = [...svg.matchAll(/<use\b([^>]+)\/>/g)].map(([, attrs]) => {
    assert.match(attrs, /href="#petal"/);
    const rotation = attrs.match(/rotate\((\d+) 256 256\)/);
    return rotation ? Number(rotation[1]) : 0;
  });
  assert.deepEqual(petals, [0, 45, 90, 135, 180, 225, 270, 315]);
  const curve = svg.match(/<path\s+id="petal"\s+d="([^"]+)"/)?.[1];
  assert.ok(curve);
  assert.match(curve, /^M[\d .,-]+C[\d .,-]+C[\d .,-]+Z$/);
  const p = (curve.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  assert.equal(p.length, 14);
  assert.equal(p[0], p[12]);
  assert.equal(p[1], p[13]);
  assert.equal(p[0], 256);
  assert.equal(p[6], 256);
  assert.equal(p[2] + p[10], 512);
  assert.equal(p[4] + p[8], 512);
  assert.equal(p[3], p[11]);
  assert.equal(p[5], p[9]);
  const incoming = [p[6] - p[4], p[7] - p[5]];
  const outgoing = [p[8] - p[6], p[9] - p[7]];
  // Non-collinear incoming/outgoing tangents create an actual cusp, unlike an ellipse.
  assert.notEqual(incoming[0] * outgoing[1] - incoming[1] * outgoing[0], 0);
  assert.ok(p[7] < 40 && p[1] > 250 && p[1] < 275);
  assert.ok(Buffer.byteLength(svg) < 2048);
});
