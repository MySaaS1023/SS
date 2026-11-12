-- CANDIDATE ONLY: requires explicit owner approval and administrator bootstrap.
-- No record is archived by installing this migration. No business rows are deleted.
begin;
create table public.referral_record_archives (
  kind text not null check (kind in ('application','partner','referral','resource')),
  record_id uuid not null,
  archived_by uuid not null references auth.users(id) on delete restrict,
  archived_at timestamptz not null default now(),
  primary key(kind,record_id)
);
create table public.referral_archive_audit (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  kind text not null, record_id uuid not null,
  action text not null check (action='archived'),
  created_at timestamptz not null default now()
);
alter table public.referral_record_archives enable row level security;
alter table public.referral_archive_audit enable row level security;
revoke all on public.referral_record_archives, public.referral_archive_audit from public,anon,authenticated,service_role;
grant select on public.referral_record_archives, public.referral_archive_audit to service_role;

create function public.archive_referral_record(p_actor uuid,p_kind text,p_record uuid,p_confirmation text)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_record jsonb;
begin
  -- Service-role only; the HTTP route independently authenticates the actor.
  if p_confirmation is distinct from ('ARCHIVE '||p_record::text) then raise exception 'Confirmation required'; end if;
  perform 1 from public.administrator_memberships where user_id=p_actor and status='active' and role in ('admin','super_admin') for share;
  if not found then raise exception 'Active administrator required'; end if;
  if p_kind='application' then
    select to_jsonb(a) into v_record from public.referral_partner_applications a where id=p_record for update;
    if v_record is null or v_record->>'status'<>'rejected' then raise exception 'Only rejected applications may be archived'; end if;
    if exists(select 1 from public.referral_partners where application_id=p_record) then raise exception 'Linked application retained'; end if;
  elsif p_kind='partner' then
    select to_jsonb(p) into v_record from public.referral_partners p where id=p_record for update;
    if v_record is null or v_record->>'status' not in ('suspended','rejected') then raise exception 'Inactive partner required'; end if;
    if exists(select 1 from public.referrals where partner_id=p_record)
      or exists(select 1 from public.referral_attributions where partner_id=p_record)
      or exists(select 1 from public.referral_commissions where partner_id=p_record)
      or exists(select 1 from public.referral_payouts where partner_id=p_record)
    then raise exception 'Linked partner history retained'; end if;
  elsif p_kind='referral' then
    select to_jsonb(r) into v_record from public.referrals r where id=p_record for update;
    if v_record is null or v_record->>'status'<>'closed' then raise exception 'Submitted referrals are not removable drafts'; end if;
    if nullif(v_record->>'lead_id','') is not null or nullif(v_record->>'customer_id','') is not null
      or nullif(v_record->>'customer_access_token_hash','') is not null
      or nullif(v_record->>'customer_invite_sent_at','') is not null
      or nullif(v_record->>'customer_invite_last_attempt_at','') is not null
      or coalesce(v_record->>'customer_invite_status','not_sent')<>'not_sent'
      or exists(select 1 from public.referral_commissions where referral_id=p_record)
      or exists(select 1 from public.referral_attributions where referral_id=p_record)
      or exists(select 1 from public.hire_us_submissions h where to_jsonb(h)->>'referral_id'=p_record::text)
      or exists(select 1 from public.client_handoffs where source_referral_id=p_record)
      or exists(select 1 from public.consultations where source_referral_id=p_record)
    then raise exception 'Customer, financial or invitation dependencies retained'; end if;
  elsif p_kind='resource' then
    -- Resource versions, acknowledgments and policies are retained. Existing
    -- publish/unpublish workflow is the only supported removal from partner view.
    raise exception 'Use audited resource unpublish instead';
  else raise exception 'Unsupported archive kind';
  end if;
  insert into public.referral_record_archives(kind,record_id,archived_by) values(p_kind,p_record,p_actor);
  insert into public.referral_archive_audit(actor_user_id,kind,record_id,action) values(p_actor,p_kind,p_record,'archived');
end;
$$;
revoke all on function public.archive_referral_record(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.archive_referral_record(uuid,text,uuid,text) to service_role;
-- No partner DELETE/UPDATE grants or policies are added. Existing ownership RLS,
-- financial rows, attribution, resource versions and customer dependencies remain.
commit;
