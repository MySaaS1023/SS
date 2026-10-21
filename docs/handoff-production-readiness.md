# Client Handoff release readiness — October 20, 2026

Release status: PREPARED, AWAITING FINAL APPROVAL. No production migration, environment edit, commit, push or deployment performed. No software installed or infrastructure added during this review.

## Completed reviews

- Design: branded completion card, responsive layout, accessible controls and hidden unconfigured Google button reviewed; no blockers. Prior isolated browser fixture passed desktop and 320px checks.
- Development: existing admin authentication reused and checked before every storage operation; safe public projection, 256-bit random bearer tokens, SHA-256 lookup, authenticated encryption, immediate active-status revocation and isolated additive migration reviewed; no blockers.
- QA: 76/76 automated tests, TypeScript and lint passed. One existing portfolio-carousel image warning. Mock/fixture tests cover unauthorized operations, copying, revocation, unsafe input and review gating.
- Deployment: existing MySaaS1023/SS main -> Vercel ss workflow reviewed. No new repository, Vercel project or database required.

## Checks and limits

Turbopack production build passed, including integrated type/lint checks and all generation steps. Local built-app GET checks: home, pricing, portfolio, about, contact and referral-partners returned 200. Malformed handoff returned 404 with no-store, no-referrer, noindex and no Google analytics. Local admin/partner login returned 500 because local Supabase variables are deliberately absent; no production credentials were copied locally. Authenticated end-to-end application/database verification remains pending release; it is not represented as passed. Existing isolated PostgreSQL migration tests passed 10 checks; these do not establish live Supabase Auth/PostgREST behavior.

Live read-only Supabase catalog preflight PASSED on the existing Steady Start project leiislnqyvrflyhskpds, PostgreSQL 17.6. Transaction read-only was on. All five new object names are unused; required roles, UUID execution, schema usage and CREATE permission are available. Existing tables retain RLS. Default grants are permissive, so the migration explicitly revokes all before narrowly granting service-role SELECT/INSERT/UPDATE. The candidate transaction asserts RLS, zero policies and effective privileges including MAINTAIN before commit.

Production public application assets reference this same Supabase project. No customer data or credential values were inspected. Migration-history table is absent: apply only 202610200001_client_handoffs.sql, never the historical migration directory.

## Environment readiness

Existing Production NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS and NEXT_PUBLIC_SITE_URL entries can be reused. Names/scopes were checked without revealing values. Existing live server credential validity for the new table remains a post-migration check.

HANDOFF_TOKEN_ENCRYPTION_KEY is the only new variable. A dedicated cryptographically generated 32-byte key already exists in ignored .env.local; preserve it. It is absent from Vercel. After approval, add it privately as a server-only Production secret to existing project ss, without replacing any existing variable. Keep a secure recovery copy: changing the key breaks recovery/copying of existing encrypted tokens. Never use a NEXT_PUBLIC prefix. Preview shares Supabase entries and must not be used for test writes to production.

Google stays disabled until an official eligible review URL is confirmed. Existing centralized Facebook, YouTube and TikTok links need no API credentials.

## Exact approved-release sequence

1. Obtain final approval covering the named production migration, single new Vercel secret, feature-only commit/push and resulting production deployment. Record the current Ready deployment and repository HEAD for rollback.
2. Re-run the saved read-only catalog preflight immediately before execution. Stop for object collisions or changed security assumptions. Review the candidate transaction against the exact source migration/hash. Do not repair/replay old migration history.
3. In the existing Supabase SQL Editor run only Handoff-Approved-Release-Candidate.sql. The transaction creates only client_handoffs and its index, enables RLS, strips default grants, grants service SELECT/INSERT/UPDATE and checks privileges before commit. On any error stop and roll back; do not publish application code.
4. Run the prepared read-only postflight and compare existing table/policy metadata with preflight. Stop if RLS, privileges, indexes or constraints differ from expectations. Do not alter old tables/policies or customer records.
5. Privately add only HANDOFF_TOKEN_ENCRYPTION_KEY to Production in existing Vercel ss. Preserve existing values/scopes. No production credentials need to be downloaded locally.
6. Review feature-only diff and secret exclusion, commit and push to existing main workflow. That push releases production and is covered by the same explicit approval. Monitor Vercel ss until Ready; verify the canonical domain serves the intended commit.
7. Verify signed-out/unauthorized management denial; then use an authorized admin and a clearly labeled synthetic handoff to test create, list, preview, URL-only copy, fresh public resolution and deactivation. Verify actual anonymous/authenticated direct table reads/writes denied, service privileges limited, and fresh revoked URLs expose no client data. Stop release acceptance and roll back app if these checks fail. Synthetic writes must be included in final approval; no existing customer records are used or modified.
8. Check privacy headers, Google absence, socials, responsive display and public/referral route regressions. After acceptance, the existing admin can create Apex Landscaping & Home Repair LLC with https://www.apexlhservices.com and a personalized congratulations message, then send the single copied handoff link.

Rollback: restore the previously Ready Vercel deployment if necessary. Retain the additive table and dedicated key. Do not drop records, change old policies, rotate secrets or alter DNS as automatic rollback.

## Remaining gates

Final release approval; additive production migration/postflight; installation of the one missing server secret; GitHub/Vercel release; actual live Auth/PostgREST and authorized synthetic handoff smoke tests. The preflight passed; the handoff table does not exist yet, so live feature security/persistence cannot be claimed verified before approval. No local-stack installation or new infrastructure is required.
