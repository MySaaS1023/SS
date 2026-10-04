-- Steady Start Referral Program, Phase 3: referral-link automation and Partner notifications.
-- This migration does not backfill notifications or modify existing referral activity.

alter table public.referral_attributions
  add column if not exists services_viewed_at timestamptz;

create table if not exists public.partner_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  referral_id uuid references public.referrals(id) on delete cascade,
  commission_id uuid references public.referral_commissions(id) on delete cascade,
  event_key text not null unique,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists partner_notifications_partner_created_idx
  on public.partner_notifications (partner_id, created_at desc);
create index if not exists partner_notifications_partner_unread_idx
  on public.partner_notifications (partner_id, is_read, created_at desc);

alter table public.partner_notifications enable row level security;

drop policy if exists "partners read own notifications" on public.partner_notifications;
create policy "partners read own notifications" on public.partner_notifications
  for select to authenticated
  using (
    partner_id in (
      select id from public.referral_partners
      where user_id = auth.uid() and status = 'approved'
    )
  );

revoke insert, update, delete on public.partner_notifications from anon, authenticated;
grant select on public.partner_notifications to authenticated;

comment on table public.partner_notifications is 'Forward-only in-app Partner notifications; event_key enforces idempotency.';
