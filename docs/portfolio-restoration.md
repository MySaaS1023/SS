# Temporary public Portfolio removal

The `/portfolio` route temporarily uses Next.js `redirect("/about")` (HTTP 307). This avoids a permanent redirect being cached when Portfolio is restored. No authentication, middleware, environment variable, database or client website was changed.

## Hidden public links

- `lib/site-data.ts`: Portfolio removed from `navLinks`, which drives both the desktop header and mobile navigation.
- `components/site-footer.tsx`: Portfolio removed from Services links. Referral Partners, legal links, customer intake, QR/connect and social links remain.
- `app/sitemap.ts`: Portfolio omitted while it redirects.
- The homepage already links its secondary CTA to `/#services`; it needed no change. No remaining active public button points exclusively to `/portfolio`.

## Preserved source and assets

- `components/portfolio-page-content.tsx` is the previous `app/portfolio/page.tsx` retained verbatim, including its layout and CTAs.
- `components/portfolio-carousel.tsx`, `lib/portfolio-data.ts`, all 14 files in `public/portfolio/` and their content are unchanged.
- Existing local assets include nine Apex screenshots and five `mmark` e-commerce screenshots. The current repository has no separately named Reliable Climate Control Solutions, Grubel Property Services or Emli's listing/assets. Nothing was deleted or replaced, and no attempt was made to access or change any of these client projects. The owner's project references for future restoration are Reliable Climate Control Solutions (hidden), Grubel Property Services (`https://grubelps.com`), Apex Landscaping & Home Repair (`https://apexlhservices.com`) and Emli's (hidden).
- The founder image remains in `public/` for preservation but is no longer used or requested by the About page. The redesigned page uses only the approved `/logo.png` on a CSS laptop-and-phone presentation.

## Restore later

1. Replace `app/portfolio/page.tsx` with `export { default } from "@/components/portfolio-page-content";` to restore the preserved page.
2. Re-add `{ href: "/portfolio", label: "Portfolio" }` after Pricing in `navLinks` in `lib/site-data.ts`.
3. Re-add the same entry in `serviceLinks` in `components/site-footer.tsx`.
4. Re-add `"/portfolio"` to the `routes` array in `app/sitemap.ts`.
5. Update the temporary-removal assertions in `tests/about-portfolio.test.ts` and `tests/portal-design.test.ts`; run tests, typecheck, lint, build and desktop/mobile navigation checks before release.

The About consultation CTA uses the existing `/consultation` route and BookingForm; its existing contact fallback remains available when online scheduling is disabled. Referral attribution and intake code are unchanged.
