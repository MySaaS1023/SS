-- Steady Start Referral Program, Phase 2: secure customer handoff.
-- Existing referrals remain not_sent and are never emailed by this migration.

alter table public.referrals
  add column if not exists customer_access_token_hash text,
  add column if not exists customer_access_token_encrypted text,
  add column if not exists customer_access_token_expires_at timestamptz,
  add column if not exists customer_invite_status text not null default 'not_sent',
  add column if not exists customer_invite_sent_at timestamptz,
  add column if not exists customer_invite_last_attempt_at timestamptz,
  add column if not exists customer_invite_resend_count integer not null default 0,
  add column if not exists customer_invite_failure text,
  add column if not exists customer_first_viewed_at timestamptz,
  add column if not exists customer_last_viewed_at timestamptz,
  add column if not exists selected_service text,
  add column if not exists selected_package text,
  add column if not exists service_selected_at timestamptz,
  add column if not exists payment_link_clicked_at timestamptz,
  add column if not exists consultation_clicked_at timestamptz,
  add column if not exists customer_last_activity_at timestamptz;

alter table public.referrals drop constraint if exists referrals_customer_invite_status_check;
alter table public.referrals add constraint referrals_customer_invite_status_check
  check (customer_invite_status in ('not_sent','sending','sent','failed'));
alter table public.referrals drop constraint if exists referrals_customer_invite_resend_count_check;
alter table public.referrals add constraint referrals_customer_invite_resend_count_check
  check (customer_invite_resend_count >= 0);

create unique index if not exists referrals_customer_access_token_hash_idx
  on public.referrals (customer_access_token_hash)
  where customer_access_token_hash is not null;
create index if not exists referrals_customer_invite_status_idx
  on public.referrals (customer_invite_status, customer_invite_last_attempt_at desc);

comment on column public.referrals.customer_access_token_hash is 'SHA-256 hash used to validate the customer bearer link.';
comment on column public.referrals.customer_access_token_encrypted is 'AES-GCM ciphertext used only by authorized resend/copy workflows.';
