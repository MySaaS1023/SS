-- Additive, private partner documents. Existing partners, terms and records are unchanged.
-- Stop on name/bucket collisions; never repurpose existing storage.
do $$ begin
 if exists(select 1 from storage.buckets where id='partner-resources')then raise exception 'Partner resource bucket already exists; inspect before applying';end if;
 if not exists(select 1 from pg_class where oid='storage.objects'::regclass and relrowsecurity)or not exists(select 1 from pg_class where oid='storage.buckets'::regclass and relrowsecurity)then raise exception 'Expected Supabase storage RLS is not enabled';end if;
end $$;
create table public.partner_resources (
 id uuid primary key, title text not null check(char_length(title) between 1 and 160),
 description text not null default '' check(char_length(description)<=2000),
 category text not null check(category in('Policies','Agreements','Tax Documents','Sales Scripts','Training Materials','Other Resources')),
 classification text not null check(classification in('general','completed_tax')),
 target_partner_id uuid references public.referral_partners(id) on delete restrict,
 published boolean not null default false, acknowledgment_required boolean not null default false,
 current_version_id uuid, revision integer not null default 1 check(revision>0),
 created_by uuid not null, updated_by uuid not null, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(classification<>'completed_tax' or target_partner_id is not null)
);
create table public.partner_resource_versions (
 id uuid primary key,resource_id uuid not null references public.partner_resources(id) on delete restrict,
 version_number integer not null check(version_number>0),file_path text not null unique,
 original_filename text not null check(char_length(original_filename) between 1 and 180),
 mime_type text not null check(mime_type in('application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain')),
 byte_size integer not null check(byte_size between 1 and 3145728),sha256 text not null check(sha256~'^[a-f0-9]{64}$'),
 release_notes text not null default '' check(char_length(release_notes)<=1000),created_by uuid not null,created_at timestamptz not null default now(),
 unique(resource_id,version_number),unique(resource_id,id),
 check(file_path=resource_id::text||'/'||id::text||case mime_type when 'application/pdf'then '.pdf'when 'text/plain'then '.txt'else '.docx'end)
);
alter table public.partner_resources add constraint partner_resource_current_version_fk foreign key(id,current_version_id)references public.partner_resource_versions(resource_id,id) deferrable initially deferred;
create table public.partner_resource_acknowledgments (
 id uuid primary key default gen_random_uuid(),version_id uuid not null references public.partner_resource_versions(id)on delete restrict,
 partner_id uuid not null references public.referral_partners(id)on delete restrict,user_id uuid not null,
 acknowledged_at timestamptz not null default now(),unique(version_id,partner_id)
);
create table public.partner_resource_audit (
 id uuid primary key default gen_random_uuid(),resource_id uuid not null references public.partner_resources(id)on delete restrict,
 actor_user_id uuid not null,action text not null check(action in('created','updated','replaced','acknowledged')),
 details jsonb not null default '{}'::jsonb check(jsonb_typeof(details)='object'),created_at timestamptz not null default now()
);
create index partner_resources_updated_idx on public.partner_resources(updated_at desc,id);
create index partner_resource_ack_partner_idx on public.partner_resource_acknowledgments(partner_id,acknowledged_at desc);
alter table public.partner_resources enable row level security;
alter table public.partner_resource_versions enable row level security;
alter table public.partner_resource_acknowledgments enable row level security;
alter table public.partner_resource_audit enable row level security;
revoke all on public.partner_resources,public.partner_resource_versions,public.partner_resource_acknowledgments,public.partner_resource_audit from public,anon,authenticated,service_role;
grant select on public.partner_resources,public.partner_resource_versions,public.partner_resource_acknowledgments,public.partner_resource_audit to service_role;

create function public.save_partner_resource(p_id uuid,p_expected_revision integer,p_actor uuid,p_metadata jsonb,p_file jsonb)
returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare old public.partner_resources;v_id uuid;v_number integer;next_id uuid;
begin
 if p_id is null or p_actor is null or p_expected_revision is null or p_expected_revision<0 or jsonb_typeof(p_metadata)<>'object'then raise exception 'Invalid resource';end if;
 if p_expected_revision=0 then
  if p_file is null then raise exception 'New document requires a file';end if;
  insert into public.partner_resources(id,title,description,category,classification,target_partner_id,published,acknowledgment_required,created_by,updated_by)
  values(p_id,p_metadata->>'title',coalesce(p_metadata->>'description',''),p_metadata->>'category',p_metadata->>'classification',(p_metadata->>'targetPartnerId')::uuid,(p_metadata->>'published')::boolean,(p_metadata->>'acknowledgmentRequired')::boolean,p_actor,p_actor);
 else
  select * into old from public.partner_resources where id=p_id for update;
  if not found or old.revision<>p_expected_revision then raise exception 'Resource changed; reload before saving'using errcode='40001';end if;
  if old.classification='completed_tax'and((p_metadata->>'classification')is distinct from 'completed_tax'or(p_metadata->>'targetPartnerId')::uuid is distinct from old.target_partner_id)then raise exception 'Completed tax document privacy and recipient are immutable'using errcode='22023';end if;
  update public.partner_resources set title=p_metadata->>'title',description=coalesce(p_metadata->>'description',''),category=p_metadata->>'category',classification=p_metadata->>'classification',target_partner_id=(p_metadata->>'targetPartnerId')::uuid,published=(p_metadata->>'published')::boolean,acknowledgment_required=(p_metadata->>'acknowledgmentRequired')::boolean,revision=revision+1,updated_by=p_actor,updated_at=now()where id=p_id;
 end if;
 if p_file is not null then
  v_id:=(p_file->>'id')::uuid;
  select coalesce(max(version_number),0)+1 into v_number from public.partner_resource_versions where resource_id=p_id;
  insert into public.partner_resource_versions(id,resource_id,version_number,file_path,original_filename,mime_type,byte_size,sha256,release_notes,created_by)
  values(v_id,p_id,v_number,p_file->>'path',p_file->>'filename',p_file->>'mime',(p_file->>'byteSize')::integer,p_file->>'sha256',coalesce(p_file->>'releaseNotes',''),p_actor);
  update public.partner_resources set current_version_id=v_id where id=p_id;
 end if;
 insert into public.partner_resource_audit(resource_id,actor_user_id,action,details)values(p_id,p_actor,case when p_expected_revision=0 then 'created'when p_file is not null then 'replaced'else 'updated'end,jsonb_build_object('before',case when p_expected_revision=0 then null else to_jsonb(old)end,'after',(select to_jsonb(r)from public.partner_resources r where id=p_id),'versionId',v_id));
 return p_id;
end $$;

create function public.acknowledge_partner_resource(p_version_id uuid,p_partner_id uuid,p_user_id uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$
declare resource public.partner_resources;new_id uuid;
begin
 if not exists(select 1 from public.referral_partners where id=p_partner_id and user_id=p_user_id and status='approved')then raise exception 'Approved partner required';end if;
 select r.* into resource from public.partner_resources r where r.current_version_id=p_version_id for share;
 if not found or not resource.published or not resource.acknowledgment_required or(resource.target_partner_id is not null and resource.target_partner_id<>p_partner_id)or(resource.classification='completed_tax'and resource.target_partner_id is distinct from p_partner_id)then raise exception 'Resource unavailable';end if;
 insert into public.partner_resource_acknowledgments(version_id,partner_id,user_id)values(p_version_id,p_partner_id,p_user_id)on conflict(version_id,partner_id)do nothing returning id into new_id;
 if new_id is not null then insert into public.partner_resource_audit(resource_id,actor_user_id,action,details)values(resource.id,p_user_id,'acknowledged',jsonb_build_object('versionId',p_version_id,'partnerId',p_partner_id,'kind','receipt_only'));end if;
end $$;
revoke all on function public.save_partner_resource(uuid,integer,uuid,jsonb,jsonb),public.acknowledge_partner_resource(uuid,uuid,uuid)from public,anon,authenticated,service_role;
grant execute on function public.save_partner_resource(uuid,integer,uuid,jsonb,jsonb),public.acknowledge_partner_resource(uuid,uuid,uuid)to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)values('partner-resources','partner-resources',false,3145728,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']);
-- Restrictive bucket guard also blocks any preexisting broad permissive browser policy.
-- Other storage buckets retain their existing permissions and policies.
create policy steady_start_partner_resources_private on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'partner-resources')with check(bucket_id<>'partner-resources');
-- Browser roles also cannot change this bucket to public or delete/reconfigure it.
create policy steady_start_partner_resource_bucket_private on storage.buckets as restrictive for all to anon,authenticated using(id<>'partner-resources')with check(id<>'partner-resources');
