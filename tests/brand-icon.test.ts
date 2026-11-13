import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandImage } from "../components/ocean-brand";
import { Logo } from "../components/logo";
import { OceanEmblem } from "../components/ocean-brand";
import { readFileSync } from "node:fs";

test("approved browser-path emblem uses a separate accessible HTML business name in shared lockups", () => {
  const html = renderToStaticMarkup(React.createElement(BrandImage));
  assert.match(html, /steady-start-browser-emblem-original\.png/);
  assert.match(html, /<span class="brand-name">Steady Start<\/span>/);
  assert.match(html, /alt=""/);
  assert.doesNotMatch(
    html,
    /steady-start-original\.png|steady-start-s-256\.png/,
  );
});

test("compact icon-only logo retains accessible identity without embedding a duplicate business-name label", () => {
  const html = renderToStaticMarkup(
    React.createElement(Logo, { compact: true, iconOnly: true }),
  );
  assert.match(html, /aria-label="Steady Start home"/);
  assert.match(html, /alt="Steady Start"/);
  assert.match(html, /brand-icon-only/);
  assert.doesNotMatch(html, /class="brand-name"/);
  assert.match(html, /href="\/"/);
});

test("shared and About accents reuse the approved pointed geometric artwork without rounded replacements", () => {
  const html = renderToStaticMarkup(React.createElement(OceanEmblem));
  assert.match(html, /home-hero-geometric-emblem\.svg/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /alt=""/);
  const about = readFileSync("app/about/page.tsx", "utf8");
  assert.match(about, /src="\/brand\/home-hero-geometric-emblem\.svg"/);
  const shared = readFileSync("components/ocean-brand.tsx", "utf8");
  const emblem = shared.slice(
    shared.indexOf("export function OceanEmblem"),
    shared.indexOf("export function OceanMesh"),
  );
  assert.doesNotMatch(emblem, /<ellipse|<circle/);
});
