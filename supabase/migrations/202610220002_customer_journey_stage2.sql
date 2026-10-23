-- Steady Start Referral Program, Stage 2: resumable customer journey.
-- Forward-only and additive. Existing referral, partner, lead, and commission rows are preserved.

alter table public.referrals
  add column if not exists customer_profile jsonb not null default '{}'::jsonb,
  add column if not exists service_preferences jsonb not null default '{}'::jsonb,
  add column if not exists customer_intake_step smallint not null default 1,
  add column if not exists customer_profile_version integer not null default 1,
  add column if not exists customer_autosaved_at timestamptz,
  add column if not exists customer_progress_stage text,
  add column if not exists ai_recommendation jsonb,
  add column if not exists ai_last_assisted_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'referrals_customer_intake_step_check'
      and conrelid = 'public.referrals'::regclass
  ) then
    alter table public.referrals
      add constraint referrals_customer_intake_step_check
      check (customer_intake_step between 1 and 4);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'referrals_customer_profile_version_check'
      and conrelid = 'public.referrals'::regclass
  ) then
    alter table public.referrals
      add constraint referrals_customer_profile_version_check
      check (customer_profile_version > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'referrals_customer_progress_stage_check'
      and conrelid = 'public.referrals'::regclass
  ) then
    alter table public.referrals
      add constraint referrals_customer_progress_stage_check
      check (
        customer_progress_stage is null
        or customer_progress_stage in (
          'profile_started',
          'service_selected',
          'review_ready',
          'submitted',
          'checkout_started',
          'payment_verified',
          'onboarding_started'
        )
      );
  end if;
end $$;

create index if not exists referrals_customer_progress_idx
  on public.referrals (customer_progress_stage, customer_last_activity_at desc);

comment on column public.referrals.customer_profile is
  'Versioned customer-editable business profile fields for the secure intake journey.';
comment on column public.referrals.service_preferences is
  'Whitelisted adaptive package answers; never contains payment card data.';
comment on column public.referrals.customer_profile_version is
  'Optimistic concurrency version for customer autosave.';
comment on column public.referrals.ai_recommendation is
  'Structured catalog-bound recommendation metadata; raw AI conversation text is not stored.';

-- Customer bearer links are resolved by trusted server routes. Keep direct table
-- writes unavailable to public and authenticated roles; existing RLS remains active.
revoke insert, update, delete on public.referrals from anon, authenticated;
