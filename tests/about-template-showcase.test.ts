import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { AboutTemplateShowcase } from "../components/about-template-showcase";

Object.assign(globalThis, { React });

test("About showcase renders three generic website templates as native content", () => {
  const html = renderToStaticMarkup(React.createElement(AboutTemplateShowcase, { className: "fixture-showcase" }));
  assert.equal((html.match(/<article\b/g) ?? []).length, 3);
  assert.equal((html.match(/data-browser-bar=""/g) ?? []).length, 3);
  for (const label of ["Your Store", "Your Business", "Your Company", "Professional", "Home Services", "Consulting"])
    assert.ok(html.includes(label));
  assert.match(html, /Illustrative website templates — not client projects\./);
  assert.doesNotMatch(html, /Apex|Reliable Climate|MM.Ark|Christine|Aspiration|portfolio\/|aria-roledescription="carousel"|<button\b|<a\b|<form\b|<h1\b|<h2\b/);
  assert.equal((html.match(/<img\b/g) ?? []).length, 3);
  assert.equal((html.match(/alt=""/g) ?? []).length, 3);
  assert.match(html, /data-template-stage="" aria-hidden="true"/);
});

test("showcase labels accurately describe illustrative design possibilities without fake client claims", () => {
  const html = renderToStaticMarkup(React.createElement(AboutTemplateShowcase));
  for (const label of ["Service Business Websites", "Online Stores", "Professional Business Websites", "Custom Website Design"])
    assert.ok(html.includes(label));
  assert.equal((html.match(/<li\b/g) ?? []).length, 4);
  assert.match(html, /aria-label="Website design possibilities"/);
  assert.doesNotMatch(html, /Show next|Show previous|Pause slideshow|Play slideshow|aria-current|tabindex/);
});

test("all supporting photos are optimized local assets with matching reserved dimensions", async () => {
  const html = renderToStaticMarkup(React.createElement(AboutTemplateShowcase));
  let bytes = 0;
  for (const name of ["store", "home-services", "corporate"]) {
    const asset = await readFile(`public/templates/about-${name}.webp`);
    const metadata = await sharp(asset).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 960);
    assert.equal(metadata.height, 640);
    assert.ok(asset.length < 100_000);
    assert.match(html, new RegExp(`src="/templates/about-${name}\\.webp"`));
    await sharp(asset).raw().toBuffer();
    bytes += asset.length;
  }
  assert.equal((html.match(/width="960" height="640"/g) ?? []).length, 3);
  assert.ok(bytes < 200_000);
  assert.doesNotMatch(html, /_next\/image|https?:\/\/|codex-clipboard/);
});

test("About hero removes only its flower and slideshow while preserving other sections and portfolio originals", async () => {
  const source = await readFile("app/about/page.tsx", "utf8");
  assert.match(source, /AboutTemplateShowcase/);
  assert.doesNotMatch(source, /AboutPortfolioGallery|className=\{styles\.heroEmblem\}/);
  assert.match(source, /OceanEmblem className=\{styles\.benefitsEmblem\}/);
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  for (const original of ["apex-homepage-hero.png", "apex-services-section.png", "apex-recent-work.png", "about-apex-homepage.webp"])
    assert.ok((await readFile(`public/portfolio/${original}`)).length > 0);
});
