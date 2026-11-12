import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("About is business focused, uses the approved brand asset and canonical project intake", async () => {
  const source = await readFile("app/about/page.tsx", "utf8");
  assert.equal((source.match(/<section\s/g) || []).length, 4);
  assert.equal((source.match(/<h1\s/g) || []).length, 1);
  for (const heading of [
    "Building Simple Digital Solutions for",
    "Growing Businesses",
    "What We Do",
    "Why Work With Us",
    "Build Something Great",
  ])
    assert.ok(source.includes(heading));
  assert.match(source, /href="\/get-started"/);
  assert.match(source, /Get Started/);
  assert.match(source, /ApprovedDeviceVisual/);
  const branding = await readFile("components/ocean-brand.tsx", "utf8");
  assert.match(branding, /src="\/brand\/steady-start-s-256\.png"/);
  assert.ok(
    (await readFile("public/brand/steady-start-s-256.png")).length > 0,
  );
  assert.match(source, /canonical: "https:\/\/www\.steadystartco\.com\/about"/);
  assert.doesNotMatch(
    source,
    /christine-wilson|Meet the Owner|personalFacts|Founder|href="\/portfolio"/i,
  );
});

test("Portfolio temporarily redirects while navigation and sitemap omit it", async () => {
  const [route, header, footer, sitemap, nav] = await Promise.all([
    readFile("app/portfolio/page.tsx", "utf8"),
    readFile("components/site-header.tsx", "utf8"),
    readFile("components/site-footer.tsx", "utf8"),
    readFile("app/sitemap.ts", "utf8"),
    readFile("lib/site-data.ts", "utf8"),
  ]);
  assert.match(route, /redirect\("\/about"\)/);
  assert.doesNotMatch(route, /permanentRedirect|PortfolioAlbumGrid/);
  assert.match(header, /navLinks\.map/);
  for (const source of [nav, footer, sitemap])
    assert.doesNotMatch(source, /"\/portfolio"/);
  assert.match(nav, /"\/referral-partners"/);
  assert.match(header, /href="\/get-started"/);
  assert.match(footer, /href: "\/get-started"/);
});

test("Portfolio source, gallery and all gallery image assets remain available for restoration", async () => {
  const archived = await readFile(
    "components/portfolio-page-content.tsx",
    "utf8",
  );
  assert.match(archived, /PortfolioAlbumGrid/);
  assert.match(archived, /Real Client Websites/);
  const data = await readFile("lib/portfolio-data.ts", "utf8");
  const imagePaths = [
    ...data.matchAll(/imageSrc: "(\/portfolio\/[^\"]+)"/g),
  ].map((match) => match[1]);
  assert.ok(imagePaths.length > 0);
  assert.equal(new Set(imagePaths).size, imagePaths.length);
  for (const imagePath of imagePaths)
    assert.ok((await readFile(`public${imagePath}`)).length > 0);
  assert.ok((await readFile("public/christine-wilson-founder.png")).length > 0);
});
