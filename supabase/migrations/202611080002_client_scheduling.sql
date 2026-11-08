-- Additive consultation scheduling only. Existing referrals, customers and auth policies are unchanged.
create table public.consultation_settings (
 id boolean primary key default true check(id), settings jsonb not null,
 version integer not null default 1 check(version>0), updated_at timestamptz not null default now(), updated_by uuid
);
insert into public.consultation_settings(id,settings) values(true,'{"enabled":false,"timeZone":"America/Phoenix","days":[1,2,3,4,5],"startTime":"09:00","endTime":"17:00","durationMinutes":30,"bufferMinutes":15,"blockedDates":[],"dailyLimit":6}'::jsonb);
create table public.consultations (
 id uuid primary key default gen_random_uuid(), title text not null default 'Steady Start — Launch Consultation' check(title='Steady Start — Launch Consultation'),
 business_name text not null check(char_length(business_name) between 1 and 120), full_name text not null check(char_length(full_name) between 1 and 160),
 email text not null check(char_length(email) between 3 and 254), phone text not null check(char_length(phone) between 7 and 40), purpose text not null check(char_length(purpose) between 1 and 500), notes text check(char_length(notes)<=1500),
 starts_at timestamptz not null, ends_at timestamptz not null check(ends_at>starts_at), buffer_minutes integer not null check(buffer_minutes between 0 and 120), customer_time_zone text not null check(char_length(customer_time_zone)<=80),
 status text not null default 'pending' check(status in('pending','confirmed','completed','canceled','rescheduled')),
 zoom_join_url text check(zoom_join_url is null or(char_length(zoom_join_url)<=2048 and zoom_join_url ~ '^https://([a-z0-9-]+\.)*zoom\.(us|com)/(j/[0-9]{9,11}|my/[A-Za-z0-9._-]+)(\?[^#]*)?$')),
 zoom_meeting_id text, zoom_source text not null default 'none' check(zoom_source in('none','manual')),
 source_referral_id uuid references public.referrals(id) on delete set null, source_handoff_id uuid references public.client_handoffs(id) on delete set null,
 request_key_hash text not null unique check(request_key_hash ~ '^[a-f0-9]{64}$'), request_payload_hash text not null check(request_payload_hash ~ '^[a-f0-9]{64}$'),
 version integer not null default 1 check(version>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), created_by uuid, updated_by uuid
);
create index consultations_starts_idx on public.consultations(starts_at,id);
create table public.consultation_audit (
 id uuid primary key default gen_random_uuid(), consultation_id uuid not null references public.consultations(id), actor_user_id uuid,
 action text not null check(char_length(action)<=80), details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table public.consultation_rate_limits (
 key_hash text primary key check(key_hash ~ '^[a-f0-9]{64}$'), attempts integer not null check(attempts between 1 and 9), resets_at timestamptz not null
);
create table public.consultation_notifications (
 id uuid primary key default gen_random_uuid(), consultation_id uuid not null references public.consultations(id), consultation_version integer not null,
 destination text not null check(char_length(destination) between 3 and 254), sender_snapshot text not null check(char_length(sender_snapshot) between 3 and 320), content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
 status text not null check(status in('sending','accepted','failed','indeterminate','delivered','delivery_failed')),
 attempt_count integer not null default 1 check(attempt_count between 1 and 3), started_at timestamptz not null default now(), last_attempt_at timestamptz not null default now(),
 claim_token uuid, provider_message_id text, provider_event text, provider_checked_at timestamptz, accepted_at timestamptz, updated_at timestamptz not null default now(), created_by uuid not null,
 unique(consultation_id,consultation_version)
);
alter table public.consultation_settings enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_audit enable row level security;
alter table public.consultation_rate_limits enable row level security;
alter table public.consultation_notifications enable row level security;
revoke all on public.consultation_settings,public.consultations,public.consultation_audit,public.consultation_rate_limits,public.consultation_notifications from public,anon,authenticated,service_role;
grant select on public.consultation_settings,public.consultations,public.consultation_audit,public.consultation_notifications to service_role;

-- Internal helper. All writes serialize on the singleton settings row before invoking it.
create function public.consultation_slot_available(p_start timestamptz,p_exclude uuid default null)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare s jsonb; tz text; local_start timestamp; local_end timestamp; minutes integer; buffer integer; local_day date;
begin
 select settings into s from public.consultation_settings where id=true;
 if coalesce((s->>'enabled')::boolean,false)=false and p_exclude is null then return false;end if;
 tz:=s->>'timeZone'; minutes:=(s->>'durationMinutes')::integer;buffer:=(s->>'bufferMinutes')::integer;
 if p_start is null or p_start<now()+(case when p_exclude is null then interval '1 hour'else interval '0 minutes'end) or p_start>now()+interval '90 days' then return false;end if;
 local_start:=p_start at time zone tz; local_end:=(p_start+make_interval(mins=>minutes))at time zone tz;local_day:=local_start::date;
 if extract(second from local_start)<>0 or extract(minute from local_start)::integer%15<>0 or local_start::date<>local_end::date or local_start::time<(s->>'startTime')::time or local_end::time>(s->>'endTime')::time then return false;end if;
 if not(s->'days' @> jsonb_build_array(extract(dow from local_start)::integer))or s->'blockedDates' @> to_jsonb(array[local_day::text])then return false;end if;
 -- Roundtrip rejects nonexistent local times and non-canonical repeated DST slots.
 if local_start at time zone tz is distinct from p_start then return false;end if;
 if(select count(*)from public.consultations c where c.status<>'canceled'and c.id is distinct from p_exclude and(c.starts_at at time zone tz)::date=local_day)>=(s->>'dailyLimit')::integer then return false;end if;
 if exists(select 1 from public.consultations c where c.status<>'canceled'and c.id is distinct from p_exclude and c.starts_at<p_start+make_interval(mins=>minutes+buffer)and c.ends_at+make_interval(mins=>c.buffer_minutes)>p_start)then return false;end if;
 return true;
end $$;
create function public.get_consultation_slots(p_date date)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare s jsonb;slot timestamp;candidate timestamptz;result jsonb:='[]'::jsonb;
begin
 select settings into s from public.consultation_settings where id=true;
 if p_date is null or p_date<current_date-1 or p_date>current_date+91 then return result;end if;
 for slot in select generate_series(p_date+(s->>'startTime')::time,p_date+(s->>'endTime')::time,interval '15 minutes')loop
 candidate:=slot at time zone(s->>'timeZone');
 if candidate at time zone(s->>'timeZone')=slot and public.consultation_slot_available(candidate,null)then result:=result||jsonb_build_array(to_char(candidate at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS".000Z"'));end if;
 end loop;return result;
end $$;
create function public.create_consultation_request(p_input jsonb,p_key_hash text,p_payload_hash text,p_rate_hash text,p_actor uuid default null,p_referral uuid default null,p_handoff uuid default null)
returns text language plpgsql security definer set search_path=pg_catalog,public as $$
declare s jsonb;existing public.consultations;start_time timestamptz;new_id uuid;attempts_count integer;
begin
 if p_key_hash is null or p_key_hash!~'^[a-f0-9]{64}$'or p_payload_hash is null or p_payload_hash!~'^[a-f0-9]{64}$'or p_rate_hash is null or p_rate_hash!~'^[a-f0-9]{64}$'then return 'invalid';end if;
 select settings into s from public.consultation_settings where id=true for update;
 select * into existing from public.consultations where request_key_hash=p_key_hash;
 if found then if existing.request_payload_hash=p_payload_hash then return 'received';else return 'invalid';end if;end if;
 delete from public.consultation_rate_limits where resets_at<now()-interval '1 day';
 insert into public.consultation_rate_limits as r(key_hash,attempts,resets_at)values(p_rate_hash,1,now()+interval '15 minutes')on conflict(key_hash)do update set attempts=case when r.resets_at<=now()then 1 else least(r.attempts+1,9)end,resets_at=case when r.resets_at<=now()then now()+interval '15 minutes'else r.resets_at end returning attempts into attempts_count;
 if attempts_count>8 then return 'rate_limited';end if;
 if not exists(select 1 from pg_timezone_names where name=p_input->>'timeZone')then return 'invalid';end if;
 start_time:=(p_input->>'startsAt')::timestamptz;
 if not public.consultation_slot_available(start_time,null)then return 'unavailable';end if;
 if p_actor is null and(select count(*)from public.consultations where lower(email)=lower(p_input->>'email')and created_at>now()-interval '1 day'and status<>'canceled')>=2 then return 'rate_limited';end if;
 insert into public.consultations(business_name,full_name,email,phone,purpose,notes,starts_at,ends_at,buffer_minutes,customer_time_zone,request_key_hash,request_payload_hash,created_by,source_referral_id,source_handoff_id)
 values(p_input->>'businessName',p_input->>'fullName',lower(p_input->>'email'),p_input->>'phone',p_input->>'purpose',nullif(p_input->>'notes',''),start_time,start_time+make_interval(mins=>(s->>'durationMinutes')::integer),(s->>'bufferMinutes')::integer,p_input->>'timeZone',p_key_hash,p_payload_hash,p_actor,case when p_actor is not null then p_referral end,case when p_actor is not null then p_handoff end)returning id into new_id;
 insert into public.consultation_audit(consultation_id,actor_user_id,action)values(new_id,p_actor,'booking_requested');
 return 'received';
end $$;
create function public.update_consultation(p_id uuid,p_version integer,p_action text,p_actor uuid,p_start timestamptz default null,p_zoom text default null)
returns text language plpgsql security definer set search_path=pg_catalog,public as $$
declare c public.consultations;s jsonb;start_time timestamptz;new_status text;
begin
 if p_actor is null or p_id is null or p_version is null or p_version<1 or p_action is null or p_action not in('confirm','reschedule','cancel','complete')then return 'invalid';end if;
 select settings into s from public.consultation_settings where id=true for update;
 select * into c from public.consultations where id=p_id for update;
 if not found or c.version<>p_version then return 'changed';end if;
 if exists(select 1 from public.consultation_notifications where consultation_id=c.id and status='sending'and last_attempt_at>now()-interval '2 minutes')then return 'delivery_pending';end if;
 if c.status in('canceled','completed')then return 'invalid';end if;
 if p_action='confirm'and c.status in('confirmed','rescheduled')then
  if c.zoom_join_url is not distinct from nullif(p_zoom,'')then return 'saved';end if;
  update public.consultations set zoom_join_url=nullif(p_zoom,''),zoom_source=case when nullif(p_zoom,'')is null then 'none'else 'manual'end,version=version+1,updated_at=now(),updated_by=p_actor where id=c.id;
  insert into public.consultation_audit(consultation_id,actor_user_id,action,details)values(c.id,p_actor,'meeting_link_updated',jsonb_build_object('meetingTimeUnchanged',true));
  return 'saved';
 end if;
 start_time:=case when p_action='reschedule'then p_start else c.starts_at end;
 if p_action='confirm'and start_time<now()then return 'unavailable';end if;
 if p_action='reschedule'and not public.consultation_slot_available(start_time,c.id)then return 'unavailable';end if;
 if p_action='complete'and c.starts_at>now()then return 'invalid';end if;
 new_status:=case p_action when 'confirm'then 'confirmed'when 'reschedule'then 'rescheduled'when 'cancel'then 'canceled'else 'completed'end;
 update public.consultations set status=new_status,starts_at=start_time,ends_at=case when p_action='reschedule'then start_time+make_interval(mins=>(s->>'durationMinutes')::integer)else c.ends_at end,buffer_minutes=case when p_action='reschedule'then(s->>'bufferMinutes')::integer else c.buffer_minutes end,
 zoom_join_url=case when p_action in('confirm','reschedule')then nullif(p_zoom,'')else c.zoom_join_url end,zoom_source=case when p_action in('confirm','reschedule')then case when nullif(p_zoom,'')is null then 'none'else 'manual'end else c.zoom_source end,
 version=version+1,updated_at=now(),updated_by=p_actor where id=c.id;
 insert into public.consultation_audit(consultation_id,actor_user_id,action,details)values(c.id,p_actor,p_action,jsonb_build_object('previousStatus',c.status,'previousStart',c.starts_at,'newStart',start_time));return 'saved';
end $$;
create function public.save_consultation_settings(p_settings jsonb,p_version integer,p_actor uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_settings is null or not(p_settings ?& array['enabled','timeZone','days','startTime','endTime','durationMinutes','bufferMinutes','blockedDates','dailyLimit'])or jsonb_typeof(p_settings->'enabled')is distinct from 'boolean'or jsonb_typeof(p_settings->'timeZone')is distinct from 'string'or jsonb_typeof(p_settings->'days')is distinct from 'array'or jsonb_typeof(p_settings->'startTime')is distinct from 'string'or jsonb_typeof(p_settings->'endTime')is distinct from 'string'or jsonb_typeof(p_settings->'durationMinutes')is distinct from 'number'or jsonb_typeof(p_settings->'bufferMinutes')is distinct from 'number'or jsonb_typeof(p_settings->'dailyLimit')is distinct from 'number'or jsonb_typeof(p_settings->'blockedDates')is distinct from 'array'then raise exception 'Scheduling settings require all fields with correct types';end if;
 if p_actor is null or jsonb_typeof(p_settings)<>'object'or octet_length(p_settings::text)>16384 or not exists(select 1 from pg_timezone_names where name=p_settings->>'timeZone')or jsonb_typeof(p_settings->'enabled')<>'boolean'or jsonb_typeof(p_settings->'days')<>'array'or jsonb_array_length(p_settings->'days')not between 1 and 7 or exists(select 1 from jsonb_array_elements_text(p_settings->'days')d where d!~'^[0-6]$')or(p_settings->>'startTime')!~'^([01][0-9]|2[0-3]):(00|15|30|45)$'or(p_settings->>'endTime')!~'^([01][0-9]|2[0-3]):(00|15|30|45)$'or(p_settings->>'startTime')>=(p_settings->>'endTime')or(p_settings->>'durationMinutes')::integer not in(15,30,45,60,90,120)or(p_settings->>'bufferMinutes')::integer not between 0 and 120 or(p_settings->>'bufferMinutes')::integer%15<>0 or(p_settings->>'dailyLimit')::integer not between 1 and 30 or jsonb_typeof(p_settings->'blockedDates')<>'array'or jsonb_array_length(p_settings->'blockedDates')>366 or exists(select 1 from jsonb_array_elements_text(p_settings->'blockedDates')d where d!~'^\d{4}-\d{2}-\d{2}$')then raise exception 'Invalid scheduling settings';end if;
 update public.consultation_settings set settings=p_settings,version=version+1,updated_at=now(),updated_by=p_actor where id=true and version=p_version;return found;
end $$;
create function public.claim_consultation_notification(p_id uuid,p_version integer,p_actor uuid,p_sender text,p_hash text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare c public.consultations;n public.consultation_notifications;new_id uuid:=gen_random_uuid();
begin
 if p_actor is null or p_sender is null or char_length(p_sender)not between 3 and 320 or p_hash is null or p_hash!~'^[a-f0-9]{64}$'then raise exception 'Invalid notification';end if;
 select * into c from public.consultations where id=p_id for update;
 if not found or c.version<>p_version or c.status not in('confirmed','rescheduled','canceled')then return jsonb_build_object('claimed',false,'reason','changed');end if;
 insert into public.consultation_notifications(id,consultation_id,consultation_version,destination,sender_snapshot,content_hash,status,claim_token,created_by)values(new_id,c.id,c.version,c.email,p_sender,p_hash,'sending',gen_random_uuid(),p_actor)on conflict(consultation_id,consultation_version)do nothing;
 select * into n from public.consultation_notifications where consultation_id=c.id and consultation_version=c.version for update;
 if n.id=new_id then return jsonb_build_object('claimed',true,'attempt',to_jsonb(n));end if;
 if n.status in('accepted','delivered','delivery_failed')then return jsonb_build_object('claimed',false,'reason','complete');end if;
 if n.content_hash<>p_hash or n.sender_snapshot<>p_sender or n.destination<>c.email or n.started_at<now()-interval '23 hours'or n.attempt_count>=3 then return jsonb_build_object('claimed',false,'reason','reconcile');end if;
 if n.last_attempt_at>now()-(case when n.status='sending'then interval '2 minutes'else interval '1 minute'end)then return jsonb_build_object('claimed',false,'reason','busy');end if;
 update public.consultation_notifications set attempt_count=attempt_count+1,last_attempt_at=now(),updated_at=now(),status='sending',claim_token=gen_random_uuid()where id=n.id returning * into n;
 return jsonb_build_object('claimed',true,'attempt',to_jsonb(n));
end $$;
create function public.complete_consultation_notification(p_id uuid,p_claim uuid,p_status text,p_provider_id text)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_status is null or p_status not in('accepted','failed','indeterminate')or(p_status='accepted'and(p_provider_id is null or char_length(p_provider_id)not between 1 and 128))then raise exception 'Invalid provider outcome';end if;
 update public.consultation_notifications set status=p_status,provider_message_id=case when p_status='accepted'then p_provider_id end,accepted_at=case when p_status='accepted'then now()end,claim_token=null,updated_at=now()where id=p_id and claim_token=p_claim and status='sending';if not found then raise exception 'Notification claim unavailable';end if;
end $$;
create function public.observe_consultation_notification(p_id uuid,p_event text)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
begin
 if p_event is null or p_event not in('sent','delivered','delivery_delayed','bounced','complained','failed','opened','clicked','suppressed','canceled')then raise exception 'Invalid provider event';end if;
 update public.consultation_notifications set provider_event=p_event,provider_checked_at=now(),updated_at=now(),status=case when p_event='delivered'then 'delivered'when p_event in('bounced','complained','failed','suppressed','canceled')then 'delivery_failed'else status end where id=p_id and provider_message_id is not null and status in('accepted','delivered','delivery_failed');
end $$;
revoke all on function public.consultation_slot_available(timestamptz,uuid),public.get_consultation_slots(date),public.create_consultation_request(jsonb,text,text,text,uuid,uuid,uuid),public.update_consultation(uuid,integer,text,uuid,timestamptz,text),public.save_consultation_settings(jsonb,integer,uuid),public.claim_consultation_notification(uuid,integer,uuid,text,text),public.complete_consultation_notification(uuid,uuid,text,text),public.observe_consultation_notification(uuid,text)from public,anon,authenticated,service_role;
-- The internal helper remains inaccessible even to service_role; definer functions invoke it.
grant execute on function public.get_consultation_slots(date),public.create_consultation_request(jsonb,text,text,text,uuid,uuid,uuid),public.update_consultation(uuid,integer,text,uuid,timestamptz,text),public.save_consultation_settings(jsonb,integer,uuid),public.claim_consultation_notification(uuid,integer,uuid,text,text),public.complete_consultation_notification(uuid,uuid,text,text),public.observe_consultation_notification(uuid,text)to service_role;
