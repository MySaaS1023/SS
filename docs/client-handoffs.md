# Client Handoff & Feedback — Phase 1

## What is implemented

Authorized administrators use `/admin/handoffs` from **Client Handoffs** in the existing admin navigation. The existing Supabase admin allowlist and forced-password-change checks remain in force. The server service checks authorization again for create, list, preview and deactivate operations. No new authentication system is introduced.

Enter a client business name, the completed public HTTPS website URL and an optional message. The same completion design serves every client at `/handoff/[token]`. Preview is protected at `/admin/handoffs/[id]/preview`; it does not activate, share or visit the public token URL. Create makes a link active immediately; preview before sharing. If a detail needs correction, deactivate and create a replacement. There is no automatic messaging or email delivery.

Both **Copy link** and **Copy client text** copy only the personalized handoff URL. The text is also selectable for manual copying if clipboard permission is unavailable. Neither button sends a message. Links remain reusable until deactivated. Deactivation affects only the completion link, not the customer's website. Older links remain accessible through paginated admin management.

## Database migration — not applied

Review `supabase/migrations/202610200001_client_handoffs.sql` and apply it first to the approved development/staging Supabase project. It creates only `public.client_handoffs`, its constraints and index. It does not change customer, referral, authentication, pricing or payment tables.

RLS is enabled without public or authenticated policies. Direct access is revoked from PUBLIC, anon and authenticated roles. Only the service-role server adapter receives select/insert/update privileges. Browser code never receives the service-role credential. Storage records only display data, the token hash/ciphertext and admin audit identifiers/timestamps; it has no customer/referral foreign keys.

No SQL has been executed against a live database during local implementation. Migration syntax, grants and actual Supabase behavior require staging verification before production approval.

## Environment requirements

Existing approved development/staging values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `ADMIN_EMAILS` or the existing `ADMIN_EMAIL` allowlist
- `NEXT_PUBLIC_SITE_URL` (local/staging origin locally; canonical HTTPS origin in production)

New requirement: `HANDOFF_TOKEN_ENCRYPTION_KEY`, a cryptographically random **32-byte key encoded as 64 hexadecimal characters**, stored only in the server environment. During the approved readiness stage, a dedicated local key was generated privately and saved in the ignored local environment file. It has not been installed in Vercel or a live database. Use distinct keys for actual environments and securely back up each deployed key. Do not prefix it with `NEXT_PUBLIC_`, print or commit it, reuse a customer password, or replace the referral encryption key. See `handoff-production-readiness.md` for current verification and release gates.

Keep this key stable and backed up. SHA-256 hashes validate public tokens; AES-256-GCM ciphertext permits authorized administrators to copy the same URL later. Losing or changing the key prevents recovery/copy of existing links but does not invalidate already-shared active links. Administrators can still deactivate links without this key. Restoration/rotation requires an explicit operational plan. No fake credentials or mock users are available in the production application.

## Central social/review settings

`lib/social-links.ts` is the single source for Facebook, YouTube, TikTok and Google review settings. Existing follow URLs are retained and shared by the footer and completion pages. These are code-managed public settings, displayed read-only in admin. Updating one setting applies to every handoff; no per-client page coding is needed. Set an unavailable social URL to `null` to hide it.

Google reviews default to hidden. To enable, the owner must verify an eligible Steady Start Google Business Profile, supply its official review URL, and set `googleBusinessProfileVerifiedEligible` to `true`. Both that confirmation and a validated Google-owned review URL are required. This is an explicit owner attestation; code cannot determine profile eligibility from a URL. An unverified or missing profile never blocks the website handoff. Requests are neutral and offer no incentives or rating gating.

## Privacy and boundaries

Tokens contain 256 random bits, are canonical base64url and carry no customer identifiers. Public queries match the token hash and active status, then return only business name, website URL and message. No emails, payments, internal IDs, ciphertext or audit data are exposed publicly. Treat the URL as a bearer link: anyone receiving it can view the intended display content. Administrators should enter no passwords, personal billing information, confidential notes or private website URLs.

Public pages are dynamic and not cached, excluded from search indexing and sitemap entries, and use generic metadata. Scoped headers set no-referrer and restrict third-party scripts/connections. Handoff screens do not mount analytics tags or referral activity/banner loaders. The admin navigation uses a full-document boundary when entering handoffs, avoiding previously loaded marketing analytics. Outbound actions suppress referrers. No referral code, pricing, checkout flow or customer record is modified by handoff visits.

Infrastructure request/access logs may still contain requested token paths; configure log access/retention appropriately before release. Do not add tokens or handoff contents to application logs or analytics. This feature does not fetch or screenshot submitted website URLs.

## Verification and release checklist

Behavioral tests use an injected in-memory store and isolated encryption fixtures. They cover authorization before storage, creation, stable reuse, preview, public field projection, immediate revocation, missing/wrong keys, authenticated-ciphertext tampering, unsafe URLs, malformed tokens/IDs, storage-error sanitization, pagination and review/social gating. React server-render tests cover escaped client content, default/optional sections and review gating.

Run the existing test suite, TypeScript, standalone ESLint and production build. On this computer use `node node_modules/next/dist/bin/next build --turbopack`. No dependency or lockfile changes are needed.

The current release uses the existing production infrastructure after explicit approval. Follow handoff-production-readiness.md for the approved sequence. Isolated tests cover these behaviors; confirm them with an authorized synthetic record after migration/release:

1. The migration applies cleanly and anon/authenticated direct table reads/writes are denied.
2. Existing allowlisted administrators can create, list, preview, copy and deactivate. Signed-out users, partners and accounts requiring a password change cannot manage handoffs.
3. Create an isolated test client, confirm repeated copies preserve the URL, then deactivate and confirm the shared URL no longer resolves on a fresh request.
4. Clipboard fallback, keyboard focus, mobile wrapping, long business names/messages and external links work in the supported browsers.
5. Google remains absent until eligibility is verified and the review URL approved; follow links are correct.
6. Public responses have no-store/no-referrer/noindex protections and no third-party analytics/referral requests. Existing referral behavior is unchanged on its own routes.

Production migration application, credential configuration, commit/push and deployment all remain pending explicit approval.

## Local verification — October 20, 2026

- Automated tests: **76 passed, 0 failed** (63 existing + 13 new behavioral/render tests).
- TypeScript: passed, including the production build's check.
- Standalone ESLint: passed; one pre-existing `no-img-element` warning in `components/portfolio-carousel.tsx:112`.
- Full production build: **passed, exit 0**, using `node node_modules/next/dist/bin/next build --turbopack` with process-only `NEXT_TELEMETRY_DISABLED=1`. All 51 generation steps and final build traces completed. The existing default Webpack build still encounters Windows short-path sandbox `EPERM` output-directory errors in this agent session. No compiler switch, dependency change, temporary output path or build-worker override was retained in project configuration. The requested Turbopack build is the local release check; Vercel must also report Ready before acceptance.
- Browser fixture: actual shared forms, copy control, completion card and core service used with isolated mock actions, mock authorization and in-memory storage. Created an Apex fixture, previewed it, verified the copied text is exactly the single personalized URL, verified cancel preserves activity, and verified explicit confirmation revokes access. Fixture data was discarded and its server stopped.
- Completion fixture inspected at desktop and 320px; no horizontal overflow. Google review CTA absent under default settings. Captured preview is labeled as an isolated fixture.
- Built Next app HTTP checks: malformed token returned 404; missing service configuration returned a generic 500 unavailable state. Both carried no-store, no-referrer, noindex and scoped CSP headers, with no Google tag in HTML. Homepage remained 200 with its usual analytics. No live service credentials were supplied.
- No live database persistence, authentication or RLS integration verification is claimed. No migration, commit, push, deployment or production configuration operation was performed.
