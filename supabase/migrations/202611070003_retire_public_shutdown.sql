-- Retire only the canceled public shutdown setting, including stale deployments.
-- Existing rows and unrelated setting keys are preserved; keeping the site online is allowed.
create function public.reject_public_website_shutdown()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if new.key = 'public_website' and new.website_online = false then
    raise exception 'Public website shutdown is retired; Steady Start must remain online.';
  end if;
  return new;
end $$;
revoke all on function public.reject_public_website_shutdown() from public,anon,authenticated,service_role;
create trigger public_website_stays_online
before insert or update of website_online,key on public.site_settings
for each row execute function public.reject_public_website_shutdown();
