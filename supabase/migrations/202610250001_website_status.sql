-- Persistent public website availability control.
-- Additive only: no existing content, customer, referral, handoff, or payment
-- records are changed or removed.

create table if not exists public.site_settings (
  key text primary key,
  website_online boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint site_settings_key_length check (char_length(key) between 1 and 80)
);

insert into public.site_settings (key, website_online)
values ('public_website', true)
on conflict (key) do nothing;

alter table public.site_settings enable row level security;
revoke all on public.site_settings from public, anon, authenticated;
revoke all on public.site_settings from service_role;
grant select, insert, update on public.site_settings to service_role;
