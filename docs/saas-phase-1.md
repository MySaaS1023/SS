# Steady Start SaaS Phase 1

Steady Start is shifting from a service-only website into an AI-powered SaaS platform for service and product businesses.

The Phase 1 goal is not to build every product feature immediately. The goal is to create the architecture that lets future modules grow safely around organizations, roles, and dashboard workflows.

## Product Direction

Steady Start will support local service businesses such as contractors, electricians, roofers, landscapers, cleaning companies, HVAC providers, plumbers, handymen, property services, consultants, photographers, and other local teams.

It will also support product businesses such as clothing brands, heat press stores, handmade goods, jewelry, candles, digital products, coffee shops, online retail, and other entrepreneurs selling products.

Steady Start is not a Shopify clone or a Squarespace clone. The goal is an AI operating system that helps entrepreneurs launch, build, manage, and grow from one place.

Long-term modules include:

- Website builder
- CRM
- Scheduling
- Project management
- Products
- Orders
- Estimates
- Invoices
- Payments
- Customer portal
- AI assistant
- Marketing automation

## Application Split

The product has two separate experiences:

- Public marketing website: a storefront that converts visitors into customers.
- Authenticated application: the protected SaaS platform after signup or login.

Dashboard pages must never be linked from public marketing navigation or exposed in the sitemap. The authenticated app currently lives under `/dashboard` and is protected by middleware until Supabase authentication is connected.

## Routing Direction

Business accounts should use `/dashboard`.

The `/admin` route is treated as a compatibility redirect so old admin-style links do not break, but new product work should be built under `/dashboard`.

## Tenant Boundary

All SaaS records should belong to an organization before they are exposed in authenticated dashboard workflows.

Use `organization_id` on data tables such as:

- Users and memberships
- Leads
- Customers
- Projects
- Orders
- Products
- Services
- Appointments
- Invoices
- Files
- Emails
- Website settings
- Marketing automations
- AI assistant threads
- AI history
- Analytics
- Billing

The current public intake flow stays compatible while the migration happens. Public lead/request records can be mapped into an organization during onboarding or when a business account is created.

## Roles

The first role model includes:

- Owner
- Admin
- Employee
- Customer

Permissions are centralized in `lib/saas/permissions.ts` so future API routes and dashboard actions can check access consistently.

## Implementation Rule

Keep production workflows intact while migrating:

- Contact requests
- Consultation scheduling
- Email automation
- Project workflow
- Vendor management
- Availability scheduling
- Intake and payment flow

Do not remove existing behavior until the organization-scoped replacement is implemented and verified.
