-- LOCAL CANDIDATE. Owner approval and isolated verification required before use.
-- No existing Auth users, passwords, sessions, business tables or policies change.
begin;
create table public.auth_recovery_grants (
  nonce_hash text primary key check (nonce_hash ~ '^[a-f0-9]{64}$'),
  user_id uuid not null references auth.users(id) on delete restrict,
  portal text not null check (portal in ('admin', 'partner')),
  session_hash text not null check (session_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  check (expires_at > created_at and expires_at <= created_at + interval '10 minutes')
);
create index auth_recovery_grants_user on public.auth_recovery_grants(user_id, portal);
alter table public.auth_recovery_grants enable row level security;
revoke all on public.auth_recovery_grants from public, anon, authenticated, service_role;
grant select on public.auth_recovery_grants to service_role;

create function public.issue_auth_recovery_grant(p_user uuid, p_portal text, p_nonce_hash text, p_session_hash text, p_expires_at timestamptz)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':recovery', 0));
  update public.auth_recovery_grants set consumed_at = now() where user_id = p_user and portal = p_portal and consumed_at is null;
  insert into public.auth_recovery_grants(nonce_hash, user_id, portal, session_hash, expires_at)
    values(p_nonce_hash, p_user, p_portal, p_session_hash, least(p_expires_at, now() + interval '10 minutes'));
end;
$$;
create function public.consume_auth_recovery_grant(p_user uuid, p_portal text, p_nonce_hash text, p_session_hash text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public as $$
declare affected integer;
begin
  update public.auth_recovery_grants set consumed_at = now()
    where nonce_hash = p_nonce_hash and user_id = p_user and portal = p_portal
      and session_hash = p_session_hash and consumed_at is null and expires_at > now();
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;
revoke all on function public.issue_auth_recovery_grant(uuid,text,text,text,timestamptz), public.consume_auth_recovery_grant(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.issue_auth_recovery_grant(uuid,text,text,text,timestamptz), public.consume_auth_recovery_grant(uuid,text,text,text) to service_role;
commit;
