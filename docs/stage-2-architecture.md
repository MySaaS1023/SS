# Steady Start Stage 2 Architecture and Rollout

## Status

Stage 1 remains the production baseline. Stage 2 is implemented in code but is not live until the additive migration and production configuration are approved, applied, and verified.

## Reused production capabilities

- Secure, expiring customer invitation tokens and token hashing.
- Existing `referrals`, `referral_partners`, `partner_notifications`, and `referral_audit_log` records.
- Existing four-step Business → Service → Review → Checkout intake.
- Canonical service catalog and existing service IDs.
- Existing attribution, Referral Partner access controls, Resend integration, commission controls, and admin authentication.

## Stage 2 data model

Migration `202610220002_customer_journey_stage2.sql` adds only nullable or defaulted columns to `referrals`: a whitelisted customer profile, whitelisted service preferences, intake step, optimistic-concurrency version, autosave timestamp, progress stage, and structured AI recommendation metadata. It creates one index and adds bounded checks without deleting or rewriting records.

Direct `anon` and `authenticated` writes remain revoked. Customer links call trusted server routes, which validate the token hash, expiration, rate limit, email ownership, and profile version before writing. Audit entries contain field names and versions, not raw profile data.

## AI integration

The server calls the OpenAI Responses API only when both feature flags are on. It sends the published service catalog, whitelisted preferences, a deterministic recommendation, and the customer's current question. Customer email, phone, surname, business profile, token, and referral identifiers are not sent.

Structured Outputs enforce a closed JSON schema. The prompt treats customer text as untrusted, provides no tools, forbids invented pricing or scope, forbids secrets and payment-card data, and requires escalation when the catalog cannot answer safely. Provider failures fail closed while the existing form remains available.

Required configuration:

- `CUSTOMER_JOURNEY_V2_ENABLED=true`
- `AI_SALES_ASSISTANT_ENABLED=true`
- `OPENAI_API_KEY` stored only in the Vercel Production secret store
- `OPENAI_MODEL` set to an owner-approved Structured Outputs-capable model

Recommended rollout:

1. Apply and verify the reviewed migration in the existing production Supabase project.
2. Deploy with both feature flags off and run Stage 1 regression checks.
3. Set the customer journey flag on and verify autosave with a synthetic referral.
4. Set the AI flag on only after the model and spending controls are approved.
5. Verify mobile, accessibility, audit entries, partner isolation, and failure fallback.

## Payment architecture boundary

Stage 2 does not create or verify payments. Current static payment links are not treated as proof of payment. Stage 3 requires one server-authoritative order/payment state machine with separate adapters for Stripe Checkout and the approved telephone provider. Signed provider webhooks—not redirects, clicks, calls, or representative actions—must be the payment authority.

No PAN, CVV, PIN, recovery link, API key, or provider secret may enter the application database, logs, AI context, transcript, or call recording.

## Telephone payment provider research

### 1. Twilio Programmable Voice + `<Pay>` + Stripe Pay Connector — recommended

- Services: dedicated Twilio subaccount in PCI Mode, U.S. number, Programmable Voice, TwiML `<Pay>`, branded Stripe Pay Connector, signed webhooks.
- Stripe compatibility: direct documented connector.
- Public planning cost: Stripe connector $0.15 per successful transaction; a U.S. local number and voice minutes are additional; Stripe processing is additional. Confirm current pricing and MOTO treatment before purchase.
- Compliance: enable PCI Mode on a dedicated Account SID; keep DTMF, recordings, transcriptions, logs, representatives, and AI outside the card-data path.
- Complexity: medium. Strong API control and the cleanest fit with a shared server-side order model.
- Tradeoff: flexible and economical, but Steady Start remains responsible for correct call design, webhook verification, account isolation, and PCI scope management.

### 2. Paytia SecureFlow / IVR with Stripe

- Services: Paytia secure IVR or agent-assisted payment flow plus Stripe.
- Stripe compatibility: documented PaymentIntents integration.
- Cost: quote required.
- Compliance: PCI Level 1 service with DTMF masking and agent/recording exclusion claims; confirm callback authentication, evidence, retention, and responsibility matrix contractually.
- Complexity: medium-low operationally; less custom telephony engineering.
- Tradeoff: managed controls may reduce implementation burden, but public pricing and callback-security detail are limited.

### 3. PCI Pal Key to Pay / Automated Speak to Pay

- Services: PCI Pal DTMF masking or automated IVR, telephony/contact-center connection, and Stripe.
- Stripe compatibility: documented.
- Public planning cost: marketplace listings indicate an enterprise-style named-agent annual floor; obtain a direct quote for the automated flow.
- Compliance: designed to keep card data away from agents and ordinary systems; confirm recording, evidence, and responsibility boundaries.
- Complexity: medium-high procurement and enterprise integration.
- Tradeoff: mature compliance specialization, likely disproportionate cost for the initial small-business volume.

Recommendation: approve a sandbox proof of concept for a dedicated Twilio PCI subaccount and Stripe Pay Connector. Do not activate or purchase it until the owner approves current pricing, call recording policy, PCI responsibilities, customer authorization language, and operational support plan.

Primary references:

- [Twilio `<Pay>`](https://www.twilio.com/docs/voice/twiml/pay)
- [Twilio PCI workflows](https://www.twilio.com/docs/voice/pci-workflows)
- [Twilio Pay Connectors](https://www.twilio.com/docs/voice/twiml/pay/pay-connectors)
- [Twilio webhook security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
- [Paytia Stripe integration](https://www.paytia.com/us/integrations/stripe)
- [PCI Pal DTMF masking](https://www.pcipal.com/solutions/solutions-by-technology/dtmf-masking/)
- [PCI SSC telephone payment guidance](https://listings.pcisecuritystandards.org/documents/Protecting_Telephone_Based_Payment_Card_Data_v3-0_nov_2018.pdf)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

## Owner approvals still required

- Production Supabase migration application.
- OpenAI model, API secret, spending/rate limits, and privacy/retention review.
- Production feature-flag activation.
- Stage 3 order schema and Stripe webhook deployment.
- Telephone provider selection, purchase, PCI responsibility review, and sandbox activation.
- Follow-up timing/templates and any future SMS registration.
