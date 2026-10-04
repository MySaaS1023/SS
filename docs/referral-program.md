# Steady Start Referral Partner Program

## Launch checklist

1. Apply `supabase/migrations/202609300001_referral_partner_program.sql` to a staging Supabase project, verify the existing `hire_us_submissions` table is present, then apply it to production.
2. Set the production environment variables listed below.
3. In Supabase Auth URL Configuration, set the Site URL to the production site and allow `https://www.steadystartco.com/auth/callback`. Add the local callback URL for development when needed.
4. Customize the Supabase invite/magic-link email templates to match Steady Start. Program-status emails continue to use Resend.
5. Create the owner/admin user in Supabase Auth, add that email to `ADMIN_EMAILS`, then log in at `/admin/login`, review `/admin/referral-program`, and approve a test application.
6. Complete the owner/legal review of `/referral-partners/terms` and change `REFERRAL_TERMS_VERSION` whenever those terms change.
7. Complete the end-to-end staging checklist below before launch.

## Environment variables

Existing variables remain required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `RESEND_API_KEY` (server only; existing service/contact emails only)
- `RESEND_FROM_EMAIL` (existing service/contact emails only)
- `ADMIN_EMAIL`

Referral Program additions:

- `NEXT_PUBLIC_SITE_URL` — production origin, for example `https://www.steadystartco.com`.
- `ADMIN_EMAILS` — comma-separated admin allowlist. Falls back to `ADMIN_EMAIL`.
- `REFERRAL_ATTRIBUTION_DAYS` — optional; defaults to `30` and is capped at 365.
- `REFERRAL_DATA_ENCRYPTION_KEY` — server-only random secret of at least 32 characters used to encrypt payout details. Keep stable across deployments and back it up securely.
- `REFERRAL_RESEND_API_KEY` — server-only Resend key used exclusively by Referral Partner Program emails.
- `REFERRAL_RESEND_FROM_EMAIL` — verified sender used exclusively by Referral Partner Program emails.

Never expose the service-role key, either Resend key, or payout encryption key as `NEXT_PUBLIC_*` variables.

## Phase 1 payment workflow

The current site uses hosted Stripe Payment Links but has no server-side Checkout Session metadata or verified webhook. Phase 1 therefore uses **Confirm Customer Payment** in `/admin/referral-program/commissions`. The database function uses a unique transaction/reference value and `ON CONFLICT` handling so a repeated confirmation cannot create a second commission.

Do not connect the existing generic Payment Links directly to commission eligibility. A future Stripe integration must create Checkout Sessions server-side with a durable referral/lead ID, verify the `Stripe-Signature` header, and pass the Stripe event or payment-intent ID as the unique transaction reference.

## Security model

- Supabase Auth provides passwordless sessions; there is no custom password store.
- Only approved partners resolve through the protected portal layout and server APIs.
- Admin access requires an authenticated user whose email is in `ADMIN_EMAILS`.
- Service-role operations occur only in server code.
- RLS permits authenticated partners to select only rows tied to their own approved partner record; partner writes go through authorized server routes.
- Financial transitions are server-only. The database fixes commission value at 10,000 cents and uniquely constrains transaction IDs.
- Payout details are AES-256-GCM encrypted before storage. The portal never returns decrypted payout details.
- First-touch attribution is held in HTTP-only, same-site cookies and cannot be overwritten by another active referral link.
- Attribution changes and financial/admin actions are written to `referral_audit_log`.

## Staging acceptance checklist

- Submit a new application and verify both applicant and admin email.
- Confirm pending, rejected, and suspended applicants cannot use the portal.
- Approve an application; verify invite delivery, opaque code generation, login, and referral-link copy.
- Open a referral link in a clean browser, submit the existing intake, and confirm lead/referral attribution.
- Submit a manual referral and verify permission is required, the lead is created/associated, and duplicate email review is flagged.
- Use two partner accounts to verify first-touch ownership and isolation of referrals/commissions.
- Confirm a payment twice with the same reference and verify exactly one $100 commission.
- Approve and mark the commission paid; verify payout history and partner visibility.
- Reverse an unpaid commission and dispute a paid commission; verify no automatic withdrawal occurs.
- Test application, login, portal cards, referral submission, commissions, settings, and admin pages at mobile widths.

## Legal review

The Referral Partner Terms are intentionally labeled as a draft requiring owner/legal review. Counsel should review commission eligibility, payout timing, tax treatment, advertising/branding rules, suspension/termination, program changes, privacy/consent language, and the treatment of refunds, chargebacks, fraud, duplicates, existing customers, and self-referrals before launch.
