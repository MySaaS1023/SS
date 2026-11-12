-- LOCAL RELEASE CANDIDATE ONLY. Explicit owner approval, preflight, backup and
-- immutable owner Auth UUID bootstrap required before application/activation.
-- No existing tables, Auth users, environment settings or memberships are changed.
begin;

create table public.administrator_memberships (
  user_id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (length(display_name) between 1 and 160),
  email text not null unique check (email = lower(email) and length(email) between 3 and 254),
  role text not null check (role in ('super_admin', 'admin')),
  status text not null default 'active' check (status in ('active', 'disabled', 'revoked')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.administrator_invitations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(display_name) between 1 and 160),
  email text not null check (email = lower(email) and length(email) between 3 and 254),
  role text not null check (role in ('super_admin', 'admin')),
  status text not null default 'pending_approval' check (status in ('pending_approval', 'approved', 'sent', 'accepted', 'expired', 'revoked')),
  invited_by uuid not null references public.administrator_memberships(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
create unique index administrator_invitation_open_email on public.administrator_invitations(email)
  where status in ('pending_approval', 'approved', 'sent');
create table public.administrator_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete restrict,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

alter table public.administrator_memberships enable row level security;
alter table public.administrator_invitations enable row level security;
alter table public.administrator_audit enable row level security;
revoke all on public.administrator_memberships, public.administrator_invitations, public.administrator_audit from public, anon, authenticated;
-- Server read only; membership changes are exclusively through the guarded RPC.
revoke all on public.administrator_memberships, public.administrator_invitations, public.administrator_audit from service_role;
grant select on public.administrator_memberships, public.administrator_invitations, public.administrator_audit to service_role;

create function public.manage_administrator(
  p_actor uuid, p_target uuid, p_role text, p_status text,
  p_expected_version integer, p_confirmation text
) returns void
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  actor public.administrator_memberships;
  target public.administrator_memberships;
  changed public.administrator_memberships;
begin
  -- All transitions serialize against one lock, so concurrent demotions cannot
  -- remove the last Super Admin. The service server obtains actor from getUser().
  perform pg_advisory_xact_lock(611120001::bigint);
  select * into actor from public.administrator_memberships where user_id = p_actor for update;
  if not found or actor.role <> 'super_admin' or actor.status <> 'active' then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;
  select * into target from public.administrator_memberships where user_id = p_target for update;
  if not found or target.version <> p_expected_version then
    raise exception 'Administrator revision mismatch' using errcode = '40001';
  end if;
  if p_confirmation is null or p_confirmation <> target.email then
    raise exception 'Exact administrator confirmation required' using errcode = '22023';
  end if;
  if p_role is null or p_role not in ('super_admin', 'admin') or
     p_status is null or p_status not in ('active', 'disabled', 'revoked') then
    raise exception 'Invalid administrator transition' using errcode = '22023';
  end if;
  if target.role = 'super_admin' and target.status = 'active' and
     (p_role <> 'super_admin' or p_status <> 'active') and
     (select count(*) from public.administrator_memberships where role = 'super_admin' and status = 'active') <= 1 then
    raise exception 'Last active Super Admin must be retained' using errcode = '23514';
  end if;
  update public.administrator_memberships set role = p_role, status = p_status,
    version = version + 1, updated_at = now() where user_id = p_target returning * into changed;
  insert into public.administrator_audit(actor_user_id, target_user_id, action, before_state, after_state)
    values (p_actor, p_target, 'administrator.access_changed', to_jsonb(target), to_jsonb(changed));
end;
$$;
revoke all on function public.manage_administrator(uuid,uuid,text,text,integer,text) from public, anon, authenticated;
grant execute on function public.manage_administrator(uuid,uuid,text,text,integer,text) to service_role;

-- No bootstrap or invitations are created here. Owner bootstrap must be an
-- independently approved transaction that verifies auth.users.id/email and
-- records an administrator.bootstrap audit event atomically.
commit;
