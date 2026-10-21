-- Standalone completion pages. No customer/referral records or existing policies are changed.
create table public.client_handoffs (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(business_name) between 1 and 120),
  website_url text not null check (char_length(website_url) <= 2048 and website_url ~ '^https://'),
  message text check (message is null or char_length(message) <= 1500),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  encrypted_token text not null check (encrypted_token ~ '^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{58}$'),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  created_by uuid not null,
  deactivated_at timestamptz,
  deactivated_by uuid,
  constraint handoff_revocation_audit check (
    (status = 'active' and deactivated_at is null and deactivated_by is null) or
    (status = 'inactive' and deactivated_at is not null and deactivated_by is not null)
  )
);
create index client_handoffs_created_at_idx on public.client_handoffs(created_at desc, id desc);
alter table public.client_handoffs enable row level security;
-- No public/authenticated RLS policies: access is through server-only, authorized adapters.
revoke all on public.client_handoffs from public, anon, authenticated;
-- Remove privileges supplied by database defaults before the narrow grant.
revoke all on public.client_handoffs from service_role;
grant select, insert, update on public.client_handoffs to service_role;
