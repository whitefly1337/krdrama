-- KRDrama schema.
--
-- Security model:
--   * Clients only ever READ their own rows. Every balance / entitlement change
--     goes through a SECURITY DEFINER function or an edge function running with
--     the service role, so nothing a user sends can mint coins or VIP time.
--   * Video sources live in episode_media, which only admins can read. Viewers
--     get a short-lived URL from the episode-stream edge function, and only for
--     episodes they are entitled to.
--   * Guests are Supabase anonymous users, so their wallet and unlocks are
--     server-side too, and survive converting to a real account.
--
-- Coin economy constants are duplicated in src/lib/coins.js for display only;
-- the values below are the ones that count.

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.coin_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Signed: positive when earned, negative when spent.
  amount integer not null,
  reason text not null check (reason in ('signup_bonus', 'ad_reward', 'episode_unlock')),
  ref_id text,
  created_at timestamptz not null default now()
);
create index coin_transactions_user_idx on public.coin_transactions (user_id, created_at desc);
-- AdMob transaction ids are single-use: replaying an SSV callback is a no-op.
create unique index coin_transactions_ad_reward_uniq
  on public.coin_transactions (ref_id) where reason = 'ad_reward';

create table public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  poster_url text not null default '',
  backdrop_url text not null default '',
  trailer_url text not null default '',
  format text not null default 'horizontal' check (format in ('vertical', 'horizontal')),
  genre text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default false,
  total_episodes integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series (id) on delete cascade,
  title text not null default '',
  episode_number integer not null default 1,
  thumbnail_url text not null default '',
  duration integer not null default 0,
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);
create index episodes_series_idx on public.episodes (series_id, episode_number);

-- Admin-only. `video_source` is either a path inside the private "videos"
-- storage bucket (served through a signed URL) or an absolute https URL from a
-- video CDN (Mux, Bunny, Cloudflare Stream...).
create table public.episode_media (
  episode_id uuid primary key references public.episodes (id) on delete cascade,
  video_source text not null default ''
);

create table public.episode_unlocks (
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, episode_id)
);

-- Mirror of the RevenueCat "vip" entitlement. Written only by edge functions
-- after they fetch the subscriber from RevenueCat's API.
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  entitlement_active boolean not null default false,
  product_id text,
  store text,
  period_type text,
  expires_at timestamptz,
  will_renew boolean,
  updated_at timestamptz not null default now()
);

create table public.user_library (
  user_id uuid not null references auth.users (id) on delete cascade,
  series_id uuid not null references public.series (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

-- ---------------------------------------------------------------------------
-- Helpers (private schema is not exposed through the Data API)
-- ---------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function private.has_active_subscription(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user
      and entitlement_active
      and (expires_at is null or expires_at > now())
  );
$$;

grant execute on function private.is_admin() to anon, authenticated;
revoke execute on function private.has_active_subscription(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- New users: profile + wallet with the first-entry bonus
-- ---------------------------------------------------------------------------

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  signup_bonus constant integer := 35;
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  insert into public.wallets (user_id, balance) values (new.id, signup_bonus);
  insert into public.coin_transactions (user_id, amount, reason)
  values (new.id, signup_bonus, 'signup_bonus');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- A guest who later links Apple/Google gets a name in user metadata; copy it
-- to the profile unless one is already set.
create or replace function private.handle_user_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set full_name = coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  )
  where id = new.id
    and full_name is null
    and coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name') is not null;
  return new;
end;
$$;

create trigger on_auth_user_metadata_updated
  after update of raw_user_meta_data on auth.users
  for each row execute function private.handle_user_metadata();

-- Keep series.total_episodes in sync with the episodes table.
create or replace function private.sync_total_episodes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  sid uuid := coalesce(new.series_id, old.series_id);
begin
  update public.series
  set total_episodes = (select count(*) from public.episodes where series_id = sid)
  where id = sid;
  if tg_op = 'UPDATE' and new.series_id is distinct from old.series_id then
    update public.series
    set total_episodes = (select count(*) from public.episodes where series_id = old.series_id)
    where id = old.series_id;
  end if;
  return null;
end;
$$;

create trigger episodes_total_count
  after insert or delete or update of series_id on public.episodes
  for each row execute function private.sync_total_episodes();

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- Spend coins on an episode. Atomic: the balance check and the debit are one
-- UPDATE, so parallel requests can't overdraw the wallet.
create or replace function public.unlock_episode(p_episode_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  episode_cost constant integer := 50;
  uid uuid := auth.uid();
  ep_free boolean;
  new_balance integer;
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select e.is_free into ep_free
  from public.episodes e
  join public.series s on s.id = e.series_id
  where e.id = p_episode_id and s.is_published;

  if not found then
    raise exception 'episode_not_found' using errcode = 'P0002';
  end if;

  if ep_free or exists (
    select 1 from public.episode_unlocks where user_id = uid and episode_id = p_episode_id
  ) then
    return jsonb_build_object(
      'success', true,
      'already_unlocked', true,
      'balance', (select balance from public.wallets where user_id = uid)
    );
  end if;

  update public.wallets
  set balance = balance - episode_cost, updated_at = now()
  where user_id = uid and balance >= episode_cost
  returning balance into new_balance;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'insufficient_balance',
      'balance', coalesce((select balance from public.wallets where user_id = uid), 0),
      'cost', episode_cost
    );
  end if;

  insert into public.episode_unlocks (user_id, episode_id)
  values (uid, p_episode_id)
  on conflict do nothing;

  if not found then
    -- A concurrent request unlocked it first: give the coins back.
    update public.wallets
    set balance = balance + episode_cost, updated_at = now()
    where user_id = uid
    returning balance into new_balance;
    return jsonb_build_object('success', true, 'already_unlocked', true, 'balance', new_balance);
  end if;

  insert into public.coin_transactions (user_id, amount, reason, ref_id)
  values (uid, -episode_cost, 'episode_unlock', p_episode_id::text);

  return jsonb_build_object('success', true, 'balance', new_balance);
end;
$$;

revoke execute on function public.unlock_episode(uuid) from public, anon;
grant execute on function public.unlock_episode(uuid) to authenticated;

-- Credit a rewarded ad. Called only by the admob-ssv edge function after it has
-- verified Google's signature. Idempotent per AdMob transaction id.
create or replace function public.award_ad_coins(p_user uuid, p_transaction_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ad_reward constant integer := 10;
  daily_limit constant integer := 20;
  recent integer;
  new_balance integer;
begin
  if p_transaction_id is null or length(p_transaction_id) = 0 then
    return jsonb_build_object('success', false, 'error', 'missing_transaction_id');
  end if;

  if not exists (select 1 from auth.users where id = p_user) then
    return jsonb_build_object('success', false, 'error', 'unknown_user');
  end if;

  select count(*) into recent
  from public.coin_transactions
  where user_id = p_user and reason = 'ad_reward' and created_at > now() - interval '24 hours';

  if recent >= daily_limit then
    return jsonb_build_object('success', false, 'error', 'daily_limit');
  end if;

  insert into public.coin_transactions (user_id, amount, reason, ref_id)
  values (p_user, ad_reward, 'ad_reward', p_transaction_id)
  on conflict (ref_id) where reason = 'ad_reward' do nothing;

  if not found then
    return jsonb_build_object('success', true, 'duplicate', true);
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user, ad_reward)
  on conflict (user_id) do update
    set balance = public.wallets.balance + ad_reward, updated_at = now()
  returning balance into new_balance;

  return jsonb_build_object('success', true, 'balance', new_balance);
end;
$$;

revoke execute on function public.award_ad_coins(uuid, text) from public, anon, authenticated;
grant execute on function public.award_ad_coins(uuid, text) to service_role;

-- Entitlement check used by the episode-stream edge function.
-- p_user may be null (no session): only free episodes pass.
create or replace function public.can_watch_episode(p_user uuid, p_episode_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.profiles where id = p_user and role = 'admin'
    )
    or exists (
      select 1
      from public.episodes e
      join public.series s on s.id = e.series_id
      where e.id = p_episode_id
        and s.is_published
        and (
          e.is_free
          or private.has_active_subscription(p_user)
          or exists (
            select 1 from public.episode_unlocks u
            where u.user_id = p_user and u.episode_id = e.id
          )
        )
    );
$$;

revoke execute on function public.can_watch_episode(uuid, uuid) from public, anon, authenticated;
grant execute on function public.can_watch_episode(uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.episode_media enable row level security;
alter table public.episode_unlocks enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_library enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "wallets: read own" on public.wallets
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "coin_transactions: read own" on public.coin_transactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "series: read published" on public.series
  for select to anon, authenticated
  using (is_published or (select private.is_admin()));
create policy "series: admin insert" on public.series
  for insert to authenticated with check ((select private.is_admin()));
create policy "series: admin update" on public.series
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "series: admin delete" on public.series
  for delete to authenticated using ((select private.is_admin()));

create policy "episodes: read published" on public.episodes
  for select to anon, authenticated
  using (
    exists (select 1 from public.series s where s.id = series_id and s.is_published)
    or (select private.is_admin())
  );
create policy "episodes: admin insert" on public.episodes
  for insert to authenticated with check ((select private.is_admin()));
create policy "episodes: admin update" on public.episodes
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "episodes: admin delete" on public.episodes
  for delete to authenticated using ((select private.is_admin()));

create policy "episode_media: admin only" on public.episode_media
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "episode_unlocks: read own" on public.episode_unlocks
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "subscriptions: read own" on public.subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_library: read own" on public.user_library
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "user_library: add own" on public.user_library
  for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "user_library: remove own" on public.user_library
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Explicit grants (newer projects no longer grant table access to API roles by
-- default). RLS above still decides which rows each role sees.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.series, public.episodes to anon, authenticated;
grant insert, update, delete on public.series, public.episodes to authenticated;
grant select, insert, update, delete on public.episode_media to authenticated;
grant select on public.profiles, public.wallets, public.coin_transactions,
  public.episode_unlocks, public.subscriptions to authenticated;
grant select, insert, delete on public.user_library to authenticated;
grant all on all tables in schema public to service_role;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('videos', 'videos', false, null, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

-- "media" is public-read through its public URL; only admins write.
-- "videos" is private: admins manage it, viewers only get signed URLs.
create policy "media/videos: admin read" on storage.objects
  for select to authenticated
  using (bucket_id in ('media', 'videos') and (select private.is_admin()));
create policy "media/videos: admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('media', 'videos') and (select private.is_admin()));
create policy "media/videos: admin update" on storage.objects
  for update to authenticated
  using (bucket_id in ('media', 'videos') and (select private.is_admin()));
create policy "media/videos: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('media', 'videos') and (select private.is_admin()));
