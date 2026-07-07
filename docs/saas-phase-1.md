# Steady Start SaaS Phase 1

Steady Start is shifting from a service-only website into an AI-powered SaaS platform for local service businesses.

The Phase 1 goal is not to build every product feature immediately. The goal is to create the architecture that lets future modules grow safely around organizations, roles, and dashboard workflows.

## Product Direction

Steady Start will support local service businesses such as contractors, electricians, roofers, landscapers, cleaning companies, HVAC providers, plumbers, handymen, property services, and other small local teams.

Long-term modules include:

- Website builder
- CRM
- Scheduling
- Project management
- Estimates
- Invoices
- Payments
- Customer portal
- AI assistant
- Marketing automation

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
- Appointments
- Invoices
- Files
- Emails
- Website settings
- Marketing automations
- AI assistant threads
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
