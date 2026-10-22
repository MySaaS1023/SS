-- Steady Start Referral Program, Phase 4: representative customer intake.
-- Forward-only and additive. Existing referrals and customer records are preserved.

alter table public.referrals
  add column if not exists customer_consent_version text,
  add column if not exists customer_consent_at timestamptz,
  add column if not exists partial_intake_submitted_at timestamptz,
  add column if not exists customer_intake_email_claimed_at timestamptz;

alter table public.referrals drop constraint if exists referrals_status_check;
alter table public.referrals add constraint referrals_status_check
  check (status in (
    'partial',
    'interested',
    'submitted',
    'contacted',
    'consultation_scheduled',
    'customer',
    'payment_pending',
    'payment_confirmed',
    'closed'
  ));

comment on column public.referrals.customer_consent_version is
  'Version of the customer email-consent disclosure accepted on the referral intake form.';
comment on column public.referrals.customer_consent_at is
  'Timestamp when the customer consented to receive Steady Start service information.';
comment on column public.referrals.partial_intake_submitted_at is
  'Timestamp when the representative customer-intake form was first submitted.';
comment on column public.referrals.customer_intake_email_claimed_at is
  'Idempotency claim for the automatic customer intake welcome email.';

create or replace function public.upsert_referral_customer_intake(
  p_partner_id uuid,
  p_referral_code text,
  p_visitor_key uuid,
  p_business_name text,
  p_customer_first_name text,
  p_customer_last_name text,
  p_customer_email text,
  p_customer_phone text,
  p_consent_version text,
  p_consent_at timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attribution public.referral_attributions;
  v_referral public.referrals;
  v_created boolean := false;
  v_accepted boolean := false;
  v_send_email boolean := false;
  v_email text := lower(trim(p_customer_email));
  v_now timestamptz := coalesce(p_consent_at, now());
begin
  if length(trim(p_business_name)) < 1
    or length(trim(p_customer_first_name)) < 1
    or length(trim(p_customer_last_name)) < 1
    or length(v_email) < 3
    or length(trim(p_customer_phone)) < 7
    or length(trim(p_consent_version)) < 1 then
    raise exception 'Invalid customer intake';
  end if;

  if not exists (
    select 1 from public.referral_partners
    where id = p_partner_id
      and referral_code = upper(trim(p_referral_code))
      and status = 'approved'
  ) then
    raise exception 'Approved referral partner not found';
  end if;

  select * into v_attribution
  from public.referral_attributions
  where visitor_key = p_visitor_key
    and partner_id = p_partner_id
    and referral_code = upper(trim(p_referral_code))
    and expires_at > now()
  for update;

  if not found then
    raise exception 'Active referral attribution not found';
  end if;

  -- Serialize intake submissions for the same normalized email so simultaneous
  -- requests cannot create duplicate referrals.
  perform pg_advisory_xact_lock(hashtextextended(v_email, 0));

  select * into v_referral
  from public.referrals
  where lower(customer_email) = v_email
  order by created_at asc
  limit 1
  for update;

  if found then
    if v_referral.partner_id <> p_partner_id then
      raise exception 'Referral ownership conflict';
    end if;

    if v_referral.status in ('partial', 'interested') then
      update public.referrals
      set business_name = trim(p_business_name),
          customer_first_name = trim(p_customer_first_name),
          customer_last_name = trim(p_customer_last_name),
          customer_phone = trim(p_customer_phone),
          permission_confirmed = true,
          customer_consent_version = coalesce(customer_consent_version, trim(p_consent_version)),
          customer_consent_at = coalesce(customer_consent_at, v_now),
          partial_intake_submitted_at = coalesce(partial_intake_submitted_at, v_now),
          customer_last_activity_at = v_now
      where id = v_referral.id
      returning * into v_referral;
      v_accepted := true;
    end if;
  else
    insert into public.referrals (
      partner_id,
      business_name,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
      service_interest,
      source,
      status,
      permission_confirmed,
      customer_consent_version,
      customer_consent_at,
      partial_intake_submitted_at,
      customer_last_activity_at
    ) values (
      p_partner_id,
      trim(p_business_name),
      trim(p_customer_first_name),
      trim(p_customer_last_name),
      v_email,
      trim(p_customer_phone),
      'not_selected',
      'referral_link',
      'partial',
      true,
      trim(p_consent_version),
      v_now,
      v_now,
      v_now
    ) returning * into v_referral;
    v_created := true;
    v_accepted := true;
  end if;

  if v_accepted
    and v_referral.customer_invite_status <> 'sent'
    and (
      v_referral.customer_intake_email_claimed_at is null
      or v_referral.customer_intake_email_claimed_at < now() - interval '10 minutes'
    ) then
    update public.referrals
    set customer_intake_email_claimed_at = v_now
    where id = v_referral.id
    returning * into v_referral;
    v_send_email := true;
  end if;

  update public.referral_attributions
  set referral_id = coalesce(referral_id, v_referral.id)
  where id = v_attribution.id
    and (referral_id is null or referral_id = v_referral.id);

  return jsonb_build_object(
    'created', v_created,
    'accepted', v_accepted,
    'send_email', v_send_email,
    'referral', to_jsonb(v_referral)
  );
end;
$$;

-- A Partial or merely Interested referral is not a completed sale and cannot
-- create a commission. The existing $100 verified-payment behavior is retained.
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
  if v_referral.status in ('partial', 'interested') then
    raise exception 'A completed service request is required before payment confirmation';
  end if;
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

revoke all on function public.upsert_referral_customer_intake(
  uuid,text,uuid,text,text,text,text,text,text,timestamptz
) from public, anon, authenticated;
grant execute on function public.upsert_referral_customer_intake(
  uuid,text,uuid,text,text,text,text,text,text,timestamptz
) to service_role;
