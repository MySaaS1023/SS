-- Steady Start Referral Partner Program, Phase 1
-- Apply in the Supabase SQL editor or through the Supabase CLI after reviewing on staging.

create extension if not exists pgcrypto;

create table if not exists public.referral_partner_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  state text not null,
  heard_about text not null,
  motivation text not null,
  referral_plan text not null,
  website text,
  social_profile text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  terms_version text not null,
  terms_accepted_at timestamptz not null,
  information_confirmed boolean not null check (information_confirmed),
  acceptance_acknowledged boolean not null check (acceptance_acknowledged),
  internal_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists referral_applications_pending_email_idx
  on public.referral_partner_applications (lower(email))
  where status = 'pending';
create index if not exists referral_applications_status_created_idx
  on public.referral_partner_applications (status, created_at desc);

create table if not exists public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  application_id uuid unique references public.referral_partner_applications(id) on delete set null,
  referral_code text not null unique check (referral_code ~ '^SS-[A-HJ-NP-Z2-9]{6}$'),
  status text not null default 'approved' check (status in ('pending','approved','rejected','suspended')),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  city text,
  state text,
  mailing_address text,
  payout_method text check (payout_method is null or payout_method in ('paypal','zelle','check','other')),
  payout_details_encrypted text,
  terms_version text not null,
  terms_accepted_at timestamptz not null,
  approved_at timestamptz,
  suspended_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists referral_partners_email_idx on public.referral_partners (lower(email));
create index if not exists referral_partners_status_idx on public.referral_partners (status);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id) on delete restrict,
  lead_id text,
  customer_id text,
  business_name text,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  website text,
  service_interest text not null,
  notes text,
  source text not null check (source in ('partner_portal','referral_link','admin')),
  status text not null default 'submitted' check (status in ('submitted','contacted','consultation_scheduled','customer','payment_pending','payment_confirmed','closed')),
  permission_confirmed boolean not null default false,
  duplicate_review boolean not null default false,
  submitted_at timestamptz not null default now(),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists referrals_partner_created_idx on public.referrals (partner_id, created_at desc);
create index if not exists referrals_customer_email_idx on public.referrals (lower(customer_email));
create index if not exists referrals_status_idx on public.referrals (status);

create table if not exists public.referral_attributions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id) on delete restrict,
  referral_id uuid references public.referrals(id) on delete set null,
  referral_code text not null,
  visitor_key uuid not null,
  source text not null default 'referral_link',
  landing_path text,
  attributed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  converted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists referral_attributions_first_touch_idx on public.referral_attributions (visitor_key);
create index if not exists referral_attributions_partner_idx on public.referral_attributions (partner_id, attributed_at desc);

create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id) on delete restrict,
  referral_id uuid not null references public.referrals(id) on delete restrict,
  customer_id text,
  transaction_id text not null unique,
  qualifying_payment_amount_cents integer not null check (qualifying_payment_amount_cents > 0),
  commission_amount_cents integer not null default 10000 check (commission_amount_cents = 10000),
  status text not null default 'eligible' check (status in ('not_eligible','pending','eligible','approved','paid','reversed','disputed')),
  eligible_at timestamptz,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  payment_method text,
  payout_reference text,
  admin_notes text,
  paid_review_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists referral_commissions_partner_idx on public.referral_commissions (partner_id, created_at desc);
create index if not exists referral_commissions_status_idx on public.referral_commissions (status);

create table if not exists public.referral_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.referral_partners(id) on delete restrict,
  commission_id uuid not null unique references public.referral_commissions(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  payment_method text not null,
  payout_reference text not null,
  paid_at timestamptz not null,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists referral_payouts_partner_idx on public.referral_payouts (partner_id, paid_at desc);

create table if not exists public.referral_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists referral_audit_entity_idx on public.referral_audit_log (entity_type, entity_id, created_at desc);

-- Preserve referral ownership on the existing Steady Start lead record.
alter table if exists public.hire_us_submissions
  add column if not exists referral_partner_id uuid references public.referral_partners(id) on delete set null,
  add column if not exists referral_code text,
  add column if not exists referral_id uuid references public.referrals(id) on delete set null,
  add column if not exists referral_source text,
  add column if not exists referral_attributed_at timestamptz;
create index if not exists hire_us_referral_partner_idx on public.hire_us_submissions (referral_partner_id);

create or replace function public.set_referral_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists referral_applications_updated_at on public.referral_partner_applications;
create trigger referral_applications_updated_at before update on public.referral_partner_applications
for each row execute function public.set_referral_updated_at();
drop trigger if exists referral_partners_updated_at on public.referral_partners;
create trigger referral_partners_updated_at before update on public.referral_partners
for each row execute function public.set_referral_updated_at();
drop trigger if exists referrals_updated_at on public.referrals;
create trigger referrals_updated_at before update on public.referrals
for each row execute function public.set_referral_updated_at();
drop trigger if exists referral_commissions_updated_at on public.referral_commissions;
create trigger referral_commissions_updated_at before update on public.referral_commissions
for each row execute function public.set_referral_updated_at();

alter table public.referral_partner_applications enable row level security;
alter table public.referral_partners enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_attributions enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.referral_payouts enable row level security;
alter table public.referral_audit_log enable row level security;

-- Partners may read only their own limited records. All writes and all admin work use
-- verified server routes with the service role; the service role bypasses RLS.
drop policy if exists "partners read own profile" on public.referral_partners;
create policy "partners read own profile" on public.referral_partners for select to authenticated
using (user_id = auth.uid());

drop policy if exists "partners read own referrals" on public.referrals;
create policy "partners read own referrals" on public.referrals for select to authenticated
using (partner_id in (select id from public.referral_partners where user_id = auth.uid() and status = 'approved'));

drop policy if exists "partners read own commissions" on public.referral_commissions;
create policy "partners read own commissions" on public.referral_commissions for select to authenticated
using (partner_id in (select id from public.referral_partners where user_id = auth.uid() and status = 'approved'));

drop policy if exists "partners read own payouts" on public.referral_payouts;
create policy "partners read own payouts" on public.referral_payouts for select to authenticated
using (partner_id in (select id from public.referral_partners where user_id = auth.uid() and status = 'approved'));

revoke all on public.referral_partner_applications from anon, authenticated;
revoke insert, update, delete on public.referral_partners from anon, authenticated;
revoke insert, update, delete on public.referrals from anon, authenticated;
revoke all on public.referral_attributions from anon, authenticated;
revoke insert, update, delete on public.referral_commissions from anon, authenticated;
revoke insert, update, delete on public.referral_payouts from anon, authenticated;
revoke all on public.referral_audit_log from anon, authenticated;
grant select on public.referral_partners, public.referrals, public.referral_commissions, public.referral_payouts to authenticated;

comment on table public.referral_partner_applications is 'Referral Partner applications; never auto-approved.';
comment on column public.referral_partners.payout_details_encrypted is 'AES-GCM ciphertext produced by the application; never plaintext.';
comment on column public.referral_commissions.transaction_id is 'Unique payment provider event or manual transaction reference; enforces commission idempotency.';

create or replace function public.confirm_referral_payment(
  p_referral_id uuid,
  p_transaction_id text,
  p_payment_amount_cents integer,
  p_payment_date timestamptz
) returns public.referral_commissions
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_referral public.referrals;
  v_commission public.referral_commissions;
begin
  if p_payment_amount_cents <= 0 or length(trim(p_transaction_id)) < 3 then
    raise exception 'Invalid payment confirmation';
  end if;
  select * into v_referral from public.referrals where id = p_referral_id for update;
  if not found then raise exception 'Referral not found'; end if;
  insert into public.referral_commissions (
    partner_id, referral_id, customer_id, transaction_id,
    qualifying_payment_amount_cents, commission_amount_cents, status, eligible_at
  ) values (
    v_referral.partner_id, v_referral.id, v_referral.customer_id, trim(p_transaction_id),
    p_payment_amount_cents, 10000, 'eligible', coalesce(p_payment_date, now())
  ) on conflict (transaction_id) do nothing returning * into v_commission;
  if v_commission.id is null then
    select * into v_commission from public.referral_commissions where transaction_id = trim(p_transaction_id);
    if v_commission.referral_id <> p_referral_id then raise exception 'Transaction reference already belongs to another referral'; end if;
  else
    update public.referrals set status = 'payment_confirmed', converted_at = coalesce(converted_at, p_payment_date, now()) where id = p_referral_id;
  end if;
  return v_commission;
end;
$$;

create or replace function public.mark_referral_commission_paid(
  p_commission_id uuid,
  p_payment_method text,
  p_payout_reference text,
  p_paid_at timestamptz,
  p_recorded_by uuid
) returns public.referral_commissions
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_commission public.referral_commissions;
begin
  update public.referral_commissions
  set status = 'paid', paid_at = coalesce(p_paid_at, now()), payment_method = p_payment_method,
      payout_reference = p_payout_reference
  where id = p_commission_id and status = 'approved'
  returning * into v_commission;
  if v_commission.id is null then raise exception 'Only an approved commission can be marked paid'; end if;
  insert into public.referral_payouts (partner_id, commission_id, amount_cents, payment_method, payout_reference, paid_at, recorded_by)
  values (v_commission.partner_id, v_commission.id, v_commission.commission_amount_cents, p_payment_method, p_payout_reference, v_commission.paid_at, p_recorded_by);
  return v_commission;
end;
$$;

revoke all on function public.confirm_referral_payment(uuid,text,integer,timestamptz) from public, anon, authenticated;
revoke all on function public.mark_referral_commission_paid(uuid,text,text,timestamptz,uuid) from public, anon, authenticated;
grant execute on function public.confirm_referral_payment(uuid,text,integer,timestamptz) to service_role;
grant execute on function public.mark_referral_commission_paid(uuid,text,text,timestamptz,uuid) to service_role;
