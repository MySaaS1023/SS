-- LOCAL CANDIDATE ONLY. Requires independently approved administrator membership
-- migration, immutable owner bootstrap, Auth/provider verification and two gates.
-- This migration does not create Auth users, memberships, emails or invitations.
begin;

alter table public.administrator_invitations
  add column expires_at timestamptz not null default (now() + interval '24 hours'),
  add column updated_at timestamptz not null default now(),
  add column nonce_hash text check (nonce_hash is null or nonce_hash ~ '^[a-f0-9]{64}$'),
  add column auth_token_hash text check (auth_token_hash is null or auth_token_hash ~ '^[a-f0-9]{64}$'),
  add column auth_user_id uuid references auth.users(id) on delete restrict,
  add column send_claim uuid,
  add column send_actor_user_id uuid references auth.users(id) on delete restrict,
  add column send_attempted_at timestamptz,
  add column provider_message_id uuid,
  add column last_error_code text check (last_error_code is null or last_error_code in ('auth_generation_failed', 'auth_binding_failed', 'provider_rejected', 'outcome_unknown')),
  add column acceptance_claim uuid,
  add column acceptance_claimed_at timestamptz;

alter table public.administrator_invitations drop constraint administrator_invitations_status_check;
alter table public.administrator_invitations add constraint administrator_invitations_status_check
  check (status in ('pending_approval', 'approved', 'sending', 'sent', 'accepted', 'expired', 'revoked', 'failed', 'unknown'));
drop index public.administrator_invitation_open_email;
create unique index administrator_invitation_open_email on public.administrator_invitations(email)
  where status in ('pending_approval', 'approved', 'sending', 'sent', 'failed', 'unknown');

alter table public.administrator_invitations enable row level security;
revoke all on public.administrator_invitations from public, anon, authenticated, service_role;
grant select on public.administrator_invitations to service_role;

create function public.prepare_administrator_invitation(p_actor uuid, p_name text, p_email text)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  if not exists (select 1 from public.administrator_memberships where user_id=p_actor and role='super_admin' and status='active') then
    raise exception 'Super Admin required' using errcode='42501';
  end if;
  if p_name is null or length(btrim(p_name)) not between 1 and 160 or p_name ~ '[[:cntrl:]]' or p_email is null or p_email <> lower(btrim(p_email)) or length(p_email) not between 3 and 254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Invalid invitation' using errcode='22023';
  end if;
  -- Never repurpose an existing Auth identity, partner or membership.
  if exists (select 1 from auth.users where lower(email)=p_email)
    or exists (select 1 from public.administrator_memberships where email=p_email)
    or exists (select 1 from public.referral_partners where lower(email)=p_email) then
    raise exception 'Existing identity requires approved onboarding' using errcode='23505';
  end if;
  insert into public.administrator_invitations(display_name,email,role,invited_by)
    values(btrim(p_name),p_email,'admin',p_actor) returning * into r;
  insert into public.administrator_audit(actor_user_id,action,after_state)
    values(p_actor,'administrator.invitation_prepared',jsonb_build_object('invitation_id',r.id,'role','admin','status',r.status));
  return jsonb_build_object('id',r.id,'display_name',r.display_name,'email',r.email,'role',r.role,'status',r.status,'expires_at',r.expires_at);
end;
$$;

create function public.reserve_administrator_invitation(p_actor uuid,p_id uuid,p_confirmation text,p_nonce_hash text,p_expires_at timestamptz)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  if not exists (select 1 from public.administrator_memberships where user_id=p_actor and role='super_admin' and status='active') then raise exception 'Super Admin required' using errcode='42501'; end if;
  select * into r from public.administrator_invitations where id=p_id for update;
  if not found or r.role<>'admin' or r.status not in ('pending_approval','approved') or r.send_attempted_at is not null or r.expires_at<=now() or p_confirmation is null or p_confirmation<>r.email then return null; end if;
  if p_nonce_hash is null or p_nonce_hash !~ '^[a-f0-9]{64}$' or p_expires_at is null or p_expires_at<=now() or p_expires_at>now()+interval '61 minutes' then raise exception 'Invalid invitation proof' using errcode='22023'; end if;
  if exists(select 1 from auth.users where lower(email)=r.email)
    or exists(select 1 from public.administrator_memberships where email=r.email)
    or exists(select 1 from public.referral_partners where lower(email)=r.email) then
    raise exception 'Existing identity requires approved onboarding' using errcode='23505';
  end if;
  update public.administrator_invitations set status='sending',nonce_hash=p_nonce_hash,expires_at=p_expires_at,send_claim=gen_random_uuid(),send_actor_user_id=p_actor,send_attempted_at=now(),updated_at=now()
    where id=p_id returning * into r;
  insert into public.administrator_audit(actor_user_id,action,after_state)
    values(p_actor,'administrator.invitation_send_reserved',jsonb_build_object('invitation_id',r.id,'status',r.status));
  return to_jsonb(r);
end;
$$;

create function public.bind_administrator_invitation(p_actor uuid,p_id uuid,p_claim uuid,p_user uuid,p_auth_token_hash text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  if not exists(select 1 from public.administrator_memberships where user_id=p_actor and role='super_admin' and status='active') then raise exception 'Super Admin required' using errcode='42501'; end if;
  select * into r from public.administrator_invitations where id=p_id for update;
  if not found or r.status<>'sending' or r.role<>'admin' or r.send_claim is distinct from p_claim or p_claim is null or r.expires_at<=now() or r.auth_user_id is not null or p_auth_token_hash is null or p_auth_token_hash !~ '^[a-f0-9]{64}$' then return false; end if;
  if not exists(select 1 from auth.users where id=p_user and lower(email)=r.email and email_confirmed_at is null and created_at>=r.created_at)
    or exists(select 1 from public.administrator_memberships where user_id=p_user or email=r.email)
    or exists(select 1 from public.referral_partners where user_id=p_user or lower(email)=r.email) then return false; end if;
  update public.administrator_invitations set auth_user_id=p_user,auth_token_hash=p_auth_token_hash,updated_at=now() where id=p_id;
  insert into public.administrator_audit(actor_user_id,target_user_id,action,after_state)
    values(p_actor,p_user,'administrator.invitation_auth_bound',jsonb_build_object('invitation_id',r.id,'role','admin'));
  return true;
end;
$$;

create function public.complete_administrator_invitation_send(p_actor uuid,p_id uuid,p_claim uuid,p_outcome text,p_provider_id uuid,p_error_code text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  select * into r from public.administrator_invitations where id=p_id for update;
  -- A claimed attempt may record its outcome even if the inviter is disabled
  -- during the provider call. Acceptance still requires an active Super Admin.
  if not found or r.send_actor_user_id is distinct from p_actor or r.status<>'sending' or p_claim is null or r.send_claim is distinct from p_claim then return false; end if;
  if p_outcome is null or p_outcome not in ('accepted','rejected','unknown') then return false; end if;
  if p_outcome='accepted' and (p_provider_id is null or r.auth_user_id is null or r.auth_token_hash is null) then return false; end if;
  if p_error_code is not null and p_error_code not in ('auth_generation_failed','auth_binding_failed','provider_rejected','outcome_unknown') then return false; end if;
  update public.administrator_invitations set status=case p_outcome when 'accepted' then 'sent' when 'rejected' then 'failed' else 'unknown' end,
    provider_message_id=p_provider_id,last_error_code=p_error_code,updated_at=now()
    where id=p_id returning * into r;
  insert into public.administrator_audit(actor_user_id,target_user_id,action,after_state)
    values(p_actor,r.auth_user_id,'administrator.invitation_delivery_recorded',jsonb_build_object('invitation_id',r.id,'status',r.status,'provider_message_id',r.provider_message_id,'error_code',r.last_error_code));
  return true;
end;
$$;

create function public.revoke_administrator_invitation(p_actor uuid,p_id uuid,p_confirmation text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  if not exists(select 1 from public.administrator_memberships where user_id=p_actor and role='super_admin' and status='active') then raise exception 'Super Admin required' using errcode='42501'; end if;
  select * into r from public.administrator_invitations where id=p_id for update;
  if not found or r.status in ('accepted','revoked') or p_confirmation is null or p_confirmation<>r.email then return false; end if;
  update public.administrator_invitations set status='revoked',nonce_hash=null,auth_token_hash=null,acceptance_claim=null,updated_at=now() where id=p_id;
  insert into public.administrator_audit(actor_user_id,target_user_id,action,before_state,after_state)
    values(p_actor,r.auth_user_id,'administrator.invitation_revoked',jsonb_build_object('invitation_id',r.id,'status',r.status),jsonb_build_object('invitation_id',r.id,'status','revoked'));
  return true;
end;
$$;

create function public.claim_administrator_invitation_acceptance(p_id uuid,p_user uuid,p_nonce_hash text)
returns uuid language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations; claim uuid;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  select * into r from public.administrator_invitations where id=p_id for update;
  if not found or r.role<>'admin' or r.status<>'sent' or r.expires_at<=now() or p_nonce_hash is null or r.nonce_hash is distinct from p_nonce_hash or r.auth_user_id is distinct from p_user or r.acceptance_claim is not null then return null; end if;
  if not exists(select 1 from public.administrator_memberships where user_id=r.invited_by and role='super_admin' and status='active')
    or not exists(select 1 from auth.users where id=p_user and lower(email)=r.email and email_confirmed_at is not null)
    or exists(select 1 from public.administrator_memberships where user_id=p_user or email=r.email)
    or exists(select 1 from public.referral_partners where user_id=p_user or lower(email)=r.email) then return null; end if;
  claim:=gen_random_uuid();
  update public.administrator_invitations set acceptance_claim=claim,acceptance_claimed_at=now(),updated_at=now() where id=p_id;
  insert into public.administrator_audit(actor_user_id,target_user_id,action,after_state)
    values(p_user,p_user,'administrator.invitation_acceptance_reserved',jsonb_build_object('invitation_id',r.id));
  return claim;
end;
$$;

create function public.accept_administrator_invitation(p_id uuid,p_user uuid,p_nonce_hash text,p_acceptance_claim uuid)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare r public.administrator_invitations;
begin
  perform pg_advisory_xact_lock(611120001::bigint);
  select * into r from public.administrator_invitations where id=p_id for update;
  if not found or r.role<>'admin' or r.status<>'sent' or r.expires_at<=now() or p_nonce_hash is null or r.nonce_hash is distinct from p_nonce_hash or r.auth_user_id is distinct from p_user or p_acceptance_claim is null or r.acceptance_claim is distinct from p_acceptance_claim or r.acceptance_claimed_at<now()-interval '5 minutes' then return false; end if;
  if not exists(select 1 from public.administrator_memberships where user_id=r.invited_by and role='super_admin' and status='active')
    or not exists(select 1 from auth.users where id=p_user and lower(email)=r.email and email_confirmed_at is not null)
    or exists(select 1 from public.administrator_memberships where user_id=p_user or email=r.email)
    or exists(select 1 from public.referral_partners where user_id=p_user or lower(email)=r.email) then return false; end if;
  -- No role, identity, email or access scope is accepted from the browser.
  insert into public.administrator_memberships(user_id,display_name,email,role,status)
    values(p_user,r.display_name,r.email,'admin','active');
  update public.administrator_invitations set status='accepted',accepted_at=now(),nonce_hash=null,auth_token_hash=null,acceptance_claim=null,updated_at=now() where id=p_id;
  insert into public.administrator_audit(actor_user_id,target_user_id,action,after_state)
    values(p_user,p_user,'administrator.invitation_accepted',jsonb_build_object('invitation_id',r.id,'role','admin','status','active'));
  return true;
end;
$$;

revoke all on function public.prepare_administrator_invitation(uuid,text,text) from public,anon,authenticated;
revoke all on function public.reserve_administrator_invitation(uuid,uuid,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.bind_administrator_invitation(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.complete_administrator_invitation_send(uuid,uuid,uuid,text,uuid,text) from public,anon,authenticated;
revoke all on function public.revoke_administrator_invitation(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.claim_administrator_invitation_acceptance(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.accept_administrator_invitation(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.prepare_administrator_invitation(uuid,text,text),public.reserve_administrator_invitation(uuid,uuid,text,text,timestamptz),public.bind_administrator_invitation(uuid,uuid,uuid,uuid,text),public.complete_administrator_invitation_send(uuid,uuid,uuid,text,uuid,text),public.revoke_administrator_invitation(uuid,uuid,text),public.claim_administrator_invitation_acceptance(uuid,uuid,text),public.accept_administrator_invitation(uuid,uuid,text,uuid) to service_role;

commit;
