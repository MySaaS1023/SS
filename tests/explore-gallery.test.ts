import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SampleWebsite } from "../components/explore/sample-website";
import { exploreClients } from "../lib/explore-clients";
import {
  designCategories,
  designInquiryHref,
  filterWebsiteDesigns,
  getWebsiteDesign,
  nextClientIndex,
  shouldAutoplayClientSlider,
  websiteDesigns,
} from "../lib/explore-designs";

test("eight unique original designs cover every advertised filter without empty categories", () => {
  assert.equal(websiteDesigns.length, 8);
  assert.equal(new Set(websiteDesigns.map((design) => design.id)).size, 8);
  assert.equal(designCategories.length, 8);
  for (const category of designCategories) {
    const result = filterWebsiteDesigns(category.id);
    assert.ok(result.length > 0, category.label);
    if (category.id !== "all")
      assert.ok(result.every((design) => design.category === category.id));
  }
  assert.deepEqual(
    filterWebsiteDesigns("service").map((design) => design.id),
    ["home-services", "landscaping"],
  );
  assert.equal(filterWebsiteDesigns("all").length, 8);
});

test("selected design uses only the existing intake route and allowlisted IDs", () => {
  for (const design of websiteDesigns) {
    assert.equal(getWebsiteDesign(design.id)?.name, design.name);
    const link = new URL(
      designInquiryHref(design.id),
      "https://www.steadystartco.com",
    );
    assert.equal(link.pathname, "/get-started");
    assert.equal(link.searchParams.get("design"), design.id);
    assert.equal([...link.searchParams].length, 1);
  }
  for (const input of [
    undefined,
    null,
    [],
    "https://evil.example",
    "<script>",
    "home-services&email=private",
  ])
    assert.equal(getWebsiteDesign(input), undefined);
  assert.equal(designInquiryHref("unrecognized"), "/get-started");
});

test("carousel wraps both directions and honors each independent pause condition", () => {
  assert.equal(nextClientIndex(2, 1, 3), 0);
  assert.equal(nextClientIndex(0, -1, 3), 2);
  assert.equal(nextClientIndex(0, 1, 0), 0);
  const playing = {
    paused: false,
    hovered: false,
    focused: false,
    reducedMotion: false,
  };
  assert.equal(shouldAutoplayClientSlider(playing), true);
  for (const condition of Object.keys(playing))
    assert.equal(
      shouldAutoplayClientSlider({ ...playing, [condition]: true }),
      false,
      condition,
    );
});

test("real client entries use approved destinations and never fabricated screenshots", () => {
  assert.deepEqual(
    exploreClients.map((client) => client.url),
    [
      "https://grubelps.com",
      "https://apexlhservices.com",
      "https://rccsnm.com",
    ],
  );
  assert.ok(
    exploreClients
      .find((client) => client.id === "apex")
      ?.imageSrc?.startsWith("/portfolio/"),
  );
  assert.ok(
    exploreClients
      .filter((client) => client.id !== "apex")
      .every((client) => client.imageSrc === null),
  );
  assert.ok(
    exploreClients.every(
      (client) => !JSON.stringify(client).includes("socialPlatforms"),
    ),
  );
});

test("sample previews render native layouts and inert social examples without fake destinations or clients", () => {
  for (const design of websiteDesigns) {
    const html = renderToStaticMarkup(
      React.createElement(SampleWebsite, { design }),
    );
    assert.ok(html.includes(`data-sample-design="${design.id}"`));
    assert.ok(html.includes(design.brand.replace(/&/g, "&amp;")));
    assert.doesNotMatch(
      html,
      /<a\b|<button\b|<h1\b|Apex|Grubel|Reliable Climate/,
    );
    for (const platform of design.socialPlatforms)
      assert.ok(html.includes(`aria-label="${platform} integration example"`));
    assert.ok(html.includes('role="img"'));
    if (design.imageSrc)
      assert.ok(design.imageAlt && html.includes(design.imageAlt));
  }
});

test("interactive gallery provides accessible modal, explicit sample disclosure and safe slider lifecycle", async () => {
  const source = await readFile(
    "components/explore/explore-gallery.tsx",
    "utf8",
  );
  assert.match(source, /element\.showModal\(\)/);
  assert.match(source, /onCancel=/);
  assert.match(source, /previousFocus\?\.focus\(\)/);
  assert.match(source, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(source, /setViewport\("desktop"\)/);
  assert.match(source, /setViewport\("mobile"\)/);
  assert.match(source, /aria-pressed=\{viewport === "mobile"\}/);
  assert.match(source, /5000/);
  assert.match(source, /window\.clearInterval\(timer\)/);
  assert.match(source, /visibilitychange/);
  assert.match(source, /function select\(next: number\) \{\s*setPaused\(true\)/);
  assert.match(source, /not a live store or booking system/);
  const styles = await readFile("app/explore/explore.module.css", "utf8");
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /container-type:\s*inline-size/);
  assert.match(styles, /object-fit:\s*contain/);
});
