-- One authoritative public-link configuration, maintained through existing admin authorization.
-- Contains no customer/contact information. No historical settings or records are modified.
create table public.social_settings (
  id text primary key check (id = 'steady-start'),
  settings jsonb not null check (jsonb_typeof(settings) = 'object' and octet_length(settings::text) <= 16384),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.social_settings enable row level security;
revoke all on public.social_settings from public,anon,authenticated,service_role;
grant select,update on public.social_settings to service_role;
insert into public.social_settings(id,settings) values ('steady-start', '{"facebook":"https://www.facebook.com/profile.php?id=61589843720808","youtube":"https://www.youtube.com/channel/UCuVyP9rYxYh0I06v67GH6tg","instagram":"https://www.instagram.com/steadystartllc/","tiktok":"https://www.tiktok.com/@steadystartco","googleBusinessProfileUrl":"https://share.google/3EiiW6pSc2CoKitRs","googleBusinessProfileVerified":true,"googleReviewUrl":"https://g.page/r/CUlLi1ESy6EqEBM/review","googleBusinessProfileVerifiedEligible":true}'::jsonb);


