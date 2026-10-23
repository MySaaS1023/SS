# Steady Start Referral Partner Portal Review II — Slides 20–34

Slide-ready content. Apply it to the original deck only after the missing `.pptx` is supplied so its layouts, theme, typography, and 19 existing slides can be preserved exactly.

## 20 — Steady Start Smart Referral System Vision

- One guided journey from representative introduction to onboarding.
- Customer information is captured once and reused securely.
- Representatives see meaningful progress without handling payments.
- Stage labels: Stage 1 **Live**; Stage 2 **Built / awaiting rollout**; Stages 3–4 **Planned**.

Suggested visual: a single horizontal lifecycle with clearly colored status bands.

## 21 — Stage 1 Production Baseline

- **Live:** personalized intake links, partial referrals, first-touch attribution, consent, personalized emails, secure invitation tokens, Partner notifications, commission protection.
- Production baseline commit: `2c43f4c3d6519b8c1ab0fb0ea0e84539a9e7aee5`.
- Existing Partner/Admin authentication and historical data preserved.
- Inbox receipt of the earlier controlled introduction email was not independently verified.

## 22 — Complete End-to-End Automation Workflow

Representative introduction → partial referral → personalized email → secure customer journey → AI-guided selection → verified online or telephone payment → onboarding → commission tracking.

Mark payment/onboarding segments as planned, not live.

## 23 — Personalized Customer Introductions

- **Live:** customer receives a representative-aware Steady Start introduction.
- Secure, expiring link contains no customer PII.
- First open updates activity and sends one deduplicated Partner notification.

## 24 — AI Customer Sales Assistant

- **Built / configuration pending:** optional, non-blocking assistance.
- Uses only the published service catalog and structured answers.
- Cannot invent pricing, scope, guarantees, or deadlines.
- Receives no customer contact details and cannot execute actions.
- Human escalation and the normal form remain visible.

## 25 — Adaptive Service Package Configuration

- Standard questions: site type, pages, branding, booking/cart, integrations, SEO.
- Premium questions: accounts, dashboards, database, CRM, payments, scheduling, automation, chatbot, notifications.
- Deterministic recommendations use existing service IDs.
- Out-of-scope work becomes a custom quote, never a silent commitment.

## 26 — Customer Autosave and Profile Editing

- **Built / rollout pending:** saves Business → Service → Review → Checkout.
- Prefills Stage 1 referral information and allows secure edits.
- Optimistic versioning prevents silent overwrites.
- Existing referral and attribution are updated; no duplicate referral is created.

## 27 — Automated Partner Portal

- **Live:** customer/contact details, referral state, invitations, commissions.
- **Built / rollout pending:** selected package, journey progress, saved time, relevant preferences.
- Referral, payment, and commission statuses remain separate.
- No card information is ever shown.

## 28 — Phone-Assisted Checkout

- **Researched / not live:** representative starts an approved order, not a card form.
- Customer hears the exact server-approved amount and gives authorization.
- PCI service captures keypad digits; representative, AI, recordings, and Steady Start never receive card data.
- Recommended proof of concept: Twilio PCI Mode + `<Pay>` + Stripe connector.

## 29 — Secure Online and Telephone Payment Architecture

- One server-authoritative order and payment state machine.
- Separate Stripe Checkout and telephone-provider adapters.
- Signed webhooks and idempotency are the only proof of payment.
- Browser returns, link clicks, calls, and representatives cannot mark an order paid.

## 30 — Automated Customer Onboarding

- **Planned:** begin only after verified payment.
- Reuse customer/business data; request only missing project requirements.
- Create one onboarding record, notify owner/Partner, retain audit trail.
- Custom quotes require approved pricing before checkout.

## 31 — Payment Verification and Commission Tracking

- Preserve the existing $100 qualifying-referral rule and approval/payout controls.
- Paid webhook updates order exactly once and then evaluates eligibility.
- Refunds, disputes, duplicate events, and reconciliation remain explicit states.
- Never transfer commission automatically without the approved payout process.

## 32 — AI Follow-Up Automation

- **Planned:** consent-based, template-controlled follow-up.
- Trigger only on meaningful inactivity or quote/checkout needs.
- Frequency caps, opt-out, payment suppression, delivery tracking, admin pause.
- No uncontrolled AI-generated messages; SMS remains off pending approval.

## 33 — Security, Privacy, and Compliance

- Server-side token validation, RLS, rate limits, feature flags, audit events.
- AI gets catalog data and minimum structured context; no contact data or secrets.
- No PAN/CVV in database, logs, AI context, transcripts, or recordings.
- Dedicated PCI telephony account, signed webhooks, least-privilege secrets.

## 34 — Implementation Phases and Testing

- Stage 1: **Live and protected by regression tests**.
- Stage 2: **Built locally; migration/configuration/production verification pending**.
- Stage 3: shared orders, Stripe Checkout, compliant telephone payments.
- Stage 4: onboarding, follow-ups, operational controls.
- Quality gates: lint, TypeScript, automated tests, production build, migration review, security and controlled production verification.
