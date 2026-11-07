-- Extends the existing 202610230001 handoff delivery schema; no historical rows deleted.
-- Stop if that migration has not been applied or if an incompatible table exists.
do $$ begin
 if to_regclass('public.client_handoff_deliveries') is null or not exists(select 1 from pg_attribute where attrelid=to_regclass('public.client_handoff_deliveries') and attname='destination' and not attisdropped) then
   raise exception 'Apply and verify 202610230001_client_handoff_delivery.sql before this repair';
 end if;
end $$;
alter table public.client_handoff_deliveries
 add column idempotency_started_at timestamptz,
 add column sender_snapshot text,
 add column claim_token uuid,
 add column last_attempt_at timestamptz,
 add column provider_checked_at timestamptz,
 add column delivery_observed_at timestamptz,
 add column provider_event text,
 add column attempt_history jsonb not null default '[]'::jsonb check(jsonb_typeof(attempt_history)='array' and jsonb_array_length(attempt_history)<=3);
alter table public.client_handoff_deliveries drop constraint client_handoff_deliveries_status_check;
alter table public.client_handoff_deliveries add constraint client_handoff_deliveries_status_check check(status in('sending','accepted','failed','disabled','indeterminate','delivered','delivery_failed'));
revoke all on public.client_handoff_deliveries from public,anon,authenticated,service_role;
-- Preserve the intended original server adapter rights during rollout/rollback.
-- Anonymous and authenticated browser roles retain no direct table access.
grant select,insert,update on public.client_handoff_deliveries to service_role;

create function public.claim_handoff_email_delivery(p_handoff_id uuid,p_actor uuid,p_destination text,p_content_hash text,p_sender text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare h public.client_handoffs;d public.client_handoff_deliveries;new_id uuid;
begin
 if p_actor is null or p_destination is null or char_length(p_destination) not between 3 and 254 or p_content_hash is null or p_content_hash!~'^[a-f0-9]{64}$' or p_sender is null then raise exception 'Invalid delivery';end if;
 select * into h from public.client_handoffs where id=p_handoff_id for update;
 if not found or h.status<>'active' then return jsonb_build_object('claimed',false,'reason','unavailable');end if;
 new_id:=gen_random_uuid();
 insert into public.client_handoff_deliveries(id,handoff_id,channel,destination,content_hash,status,attempt_count,provider,created_by,idempotency_started_at,sender_snapshot,last_attempt_at,claim_token,attempt_history)
 values(new_id,h.id,'email',p_destination,p_content_hash,'sending',1,'resend',p_actor,now(),p_sender,now(),gen_random_uuid(),jsonb_build_array(jsonb_build_object('number',1,'startedAt',now(),'status','pending')))
 on conflict(handoff_id,channel,destination,content_hash)do nothing;
 select * into d from public.client_handoff_deliveries where handoff_id=h.id and channel='email' and destination=p_destination and content_hash=p_content_hash for update;
 if d.id=new_id then return jsonb_build_object('claimed',true,'attempt',to_jsonb(d));end if;
 if d.status in('accepted','delivered','delivery_failed')then return jsonb_build_object('claimed',false,'reason','complete','attempt',to_jsonb(d));end if;
 -- Historical failures predate provider idempotency; silently retrying could duplicate a real message.
 if d.idempotency_started_at is null then return jsonb_build_object('claimed',false,'reason','legacy','attempt',to_jsonb(d));end if;
 if d.sender_snapshot is distinct from p_sender then return jsonb_build_object('claimed',false,'reason','changed');end if;
 if d.idempotency_started_at<now()-interval '23 hours' or d.attempt_count>=3 then return jsonb_build_object('claimed',false,'reason','expired');end if;
 if d.last_attempt_at>now()-(case when d.status='sending' then interval '2 minutes' else interval '1 minute' end)then return jsonb_build_object('claimed',false,'reason','busy');end if;
 update public.client_handoff_deliveries set status='sending',attempt_count=attempt_count+1,last_attempt_at=now(),updated_at=now(),last_error_code=null,claim_token=gen_random_uuid(),attempt_history=attempt_history||jsonb_build_array(jsonb_build_object('number',d.attempt_count+1,'startedAt',now(),'status','pending')) where id=d.id returning * into d;
 return jsonb_build_object('claimed',true,'attempt',to_jsonb(d));
end $$;
create function public.complete_handoff_email_delivery(p_id uuid,p_claim uuid,p_status text,p_provider_id text)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
declare d public.client_handoff_deliveries;
begin
 if p_status is null or p_status not in('accepted','failed','indeterminate')or(p_status='accepted'and(p_provider_id is null or char_length(p_provider_id)not between 1 and 128))then raise exception 'Invalid outcome';end if;
 update public.client_handoff_deliveries set status=p_status,provider_message_id=case when p_status='accepted'then p_provider_id else null end,sent_at=case when p_status='accepted'then now()else null end,updated_at=now(),last_error_code=case when p_status='failed'then 'provider_rejected'when p_status='indeterminate'then 'provider_uncertain'else null end,claim_token=null,
 attempt_history=jsonb_set(attempt_history,array[(jsonb_array_length(attempt_history)-1)::text],(attempt_history->(jsonb_array_length(attempt_history)-1))||jsonb_build_object('finishedAt',now(),'status',p_status))
 where id=p_id and claim_token=p_claim and status='sending' returning * into d;
 if not found then raise exception 'Delivery claim unavailable';end if;
end $$;

create table public.client_handoff_feedback(id uuid primary key default gen_random_uuid(),handoff_id uuid not null unique references public.client_handoffs(id),rating integer not null check(rating between 1 and 5),comment text check(comment is null or char_length(comment)<=1000),created_at timestamptz not null default now());
create index client_handoff_feedback_created_idx on public.client_handoff_feedback(created_at desc,id desc);
create table public.client_handoff_feedback_rate_limits(key_hash text primary key check(key_hash~'^[a-f0-9]{64}$'),resets_at timestamptz not null,attempts integer not null check(attempts between 1 and 9));
create index client_handoff_feedback_rate_resets_idx on public.client_handoff_feedback_rate_limits(resets_at);
alter table public.client_handoff_feedback enable row level security;
alter table public.client_handoff_feedback_rate_limits enable row level security;
revoke all on public.client_handoff_feedback,public.client_handoff_feedback_rate_limits from public,anon,authenticated,service_role;
grant select on public.client_handoff_feedback to service_role;
create function public.consume_client_handoff_feedback_rate(p_key_hash text)returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare n integer;
begin
 if p_key_hash is null or p_key_hash!~'^[a-f0-9]{64}$'then return false;end if;
 delete from public.client_handoff_feedback_rate_limits where resets_at<now()-interval '1 day';
 insert into public.client_handoff_feedback_rate_limits as r(key_hash,resets_at,attempts)values(p_key_hash,now()+interval '15 minutes',1)
 on conflict(key_hash)do update set attempts=case when r.resets_at<=now()then 1 else least(r.attempts+1,9)end,resets_at=case when r.resets_at<=now()then now()+interval '15 minutes'else r.resets_at end returning attempts into n;
 return n<=8;
end $$;
create function public.submit_client_handoff_feedback(p_token_hash text,p_rating integer,p_comment text)returns text language plpgsql security definer set search_path=pg_catalog,public as $$
declare h public.client_handoffs;
begin
 if p_token_hash is null or p_token_hash!~'^[a-f0-9]{64}$'or p_rating is null or p_rating not between 1 and 5 or(p_comment is not null and char_length(p_comment)>1000)then return 'invalid';end if;
 select * into h from public.client_handoffs where token_hash=p_token_hash for update;
 if not found or h.status<>'active'then return 'unavailable';end if;
 insert into public.client_handoff_feedback(handoff_id,rating,comment)values(h.id,p_rating,p_comment)on conflict(handoff_id)do nothing;
 if not found then return 'duplicate';end if;return 'accepted';
end $$;
revoke all on function public.claim_handoff_email_delivery(uuid,uuid,text,text,text),public.complete_handoff_email_delivery(uuid,uuid,text,text),public.consume_client_handoff_feedback_rate(text),public.submit_client_handoff_feedback(text,integer,text)from public,anon,authenticated,service_role;
grant execute on function public.claim_handoff_email_delivery(uuid,uuid,text,text,text),public.complete_handoff_email_delivery(uuid,uuid,text,text),public.consume_client_handoff_feedback_rate(text),public.submit_client_handoff_feedback(text,integer,text)to service_role;
