-- Client handoff contact and delivery enhancements.
-- Forward-only and additive: existing handoffs, tokens, audit history, referrals,
-- and customer records are preserved.

alter table public.client_handoffs
  add column if not exists business_phone text,
  add column if not exists business_email text,
  add column if not exists contact_name text,
  add column if not exists source_referral_id uuid references public.referrals(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'client_handoffs_business_phone_length'
      and conrelid = 'public.client_handoffs'::regclass
  ) then
    alter table public.client_handoffs
      add constraint client_handoffs_business_phone_length
      check (business_phone is null or char_length(business_phone) between 7 and 40) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'client_handoffs_business_email_length'
      and conrelid = 'public.client_handoffs'::regclass
  ) then
    alter table public.client_handoffs
      add constraint client_handoffs_business_email_length
      check (business_email is null or char_length(business_email) between 3 and 254) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'client_handoffs_contact_name_length'
      and conrelid = 'public.client_handoffs'::regclass
  ) then
    alter table public.client_handoffs
      add constraint client_handoffs_contact_name_length
      check (contact_name is null or char_length(contact_name) between 1 and 160) not valid;
  end if;
end $$;

create index if not exists client_handoffs_source_referral_idx
  on public.client_handoffs(source_referral_id)
  where source_referral_id is not null;

create table if not exists public.client_handoff_deliveries (
  id uuid primary key default gen_random_uuid(),
  handoff_id uuid not null references public.client_handoffs(id) on delete restrict,
  channel text not null check (channel in ('email', 'sms')),
  destination text not null check (char_length(destination) between 3 and 254),
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  status text not null check (status in ('sending', 'accepted', 'failed', 'disabled')),
  attempt_count smallint not null default 1 check (attempt_count between 1 and 3),
  provider text,
  provider_message_id text,
  last_error_code text,
  consent_confirmed_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (handoff_id, channel, destination, content_hash)
);

create index if not exists client_handoff_deliveries_handoff_idx
  on public.client_handoff_deliveries(handoff_id, created_at desc);

alter table public.client_handoff_deliveries enable row level security;
revoke all on public.client_handoff_deliveries from public, anon, authenticated;
revoke all on public.client_handoff_deliveries from service_role;
grant select, insert, update on public.client_handoff_deliveries to service_role;
