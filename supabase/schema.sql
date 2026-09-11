-- ============================================================================
-- TURNOUT — DATABASE SCHEMA
--
-- How to use this file: open your Supabase project -> SQL Editor -> New query,
-- paste this entire file in, and click Run. It's safe to run once on a fresh
-- project. Full walkthrough in README.md.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES — one row per player, created automatically on sign-up.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  home_area text,
  games_showed integer not null default 0,
  games_no_show integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by any signed-in player" on public.profiles;
create policy "Profiles are readable by any signed-in player"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "Players can update their own profile" on public.profiles;
create policy "Players can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row the moment someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- GAMES — pickup games (soccer, basketball, pickleball, etc).
-- ----------------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  sport text not null check (sport in
    ('soccer','basketball','pickleball','baseball','volleyball','flag_football','tennis')),
  location text not null,
  starts_at timestamptz not null,
  capacity integer not null check (capacity between 2 and 100),
  notes text,
  status text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "Games are readable by any signed-in player" on public.games;
create policy "Games are readable by any signed-in player"
  on public.games for select to authenticated using (true);

drop policy if exists "Players can post games as themselves" on public.games;
create policy "Players can post games as themselves"
  on public.games for insert to authenticated with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can update their own games" on public.games;
create policy "Organizers can update their own games"
  on public.games for update to authenticated
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can delete their own games" on public.games;
create policy "Organizers can delete their own games"
  on public.games for delete to authenticated using (auth.uid() = organizer_id);

create table if not exists public.game_rsvps (
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'going' check (status in ('going','cancelled','showed','no_show')),
  created_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

alter table public.game_rsvps enable row level security;

drop policy if exists "RSVPs are readable by any signed-in player" on public.game_rsvps;
create policy "RSVPs are readable by any signed-in player"
  on public.game_rsvps for select to authenticated using (true);

drop policy if exists "Players can RSVP as themselves" on public.game_rsvps;
create policy "Players can RSVP as themselves"
  on public.game_rsvps for insert to authenticated with check (auth.uid() = user_id and status = 'going');

drop policy if exists "Players can update their own RSVP to going or cancelled" on public.game_rsvps;
create policy "Players can update their own RSVP to going or cancelled"
  on public.game_rsvps for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('going','cancelled'));

drop policy if exists "Players can remove their own RSVP" on public.game_rsvps;
create policy "Players can remove their own RSVP"
  on public.game_rsvps for delete to authenticated using (auth.uid() = user_id);

-- Only the organizer of a game may mark a player showed / no-show, and it's
-- the only path that changes anyone's Turnout Score — a player can never
-- edit their own attendance record.
create or replace function public.mark_attendance(p_id uuid, p_user_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_organizer uuid;
  v_previous text;
begin
  if p_status not in ('showed', 'no_show') then
    raise exception 'invalid status';
  end if;

  select organizer_id into v_organizer from public.games where id = p_id;
  if v_organizer is null then
    raise exception 'game not found';
  end if;
  if auth.uid() <> v_organizer then
    raise exception 'only the organizer can mark attendance';
  end if;

  select status into v_previous from public.game_rsvps where game_id = p_id and user_id = p_user_id;
  if v_previous is null then
    raise exception 'player has no rsvp for this game';
  end if;

  update public.game_rsvps set status = p_status where game_id = p_id and user_id = p_user_id;

  if v_previous not in ('showed', 'no_show') then
    if p_status = 'showed' then
      update public.profiles set games_showed = games_showed + 1 where id = p_user_id;
    else
      update public.profiles set games_no_show = games_no_show + 1 where id = p_user_id;
    end if;
  end if;
end;
$$;

grant execute on function public.mark_attendance(uuid, uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- TEE TIMES — golf-specific, capped at foursomes.
-- ----------------------------------------------------------------------------
create table if not exists public.tee_times (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  course_name text not null,
  starts_at timestamptz not null,
  capacity integer not null default 4 check (capacity between 2 and 4),
  notes text,
  status text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.tee_times enable row level security;

drop policy if exists "Tee times are readable by any signed-in player" on public.tee_times;
create policy "Tee times are readable by any signed-in player"
  on public.tee_times for select to authenticated using (true);

drop policy if exists "Players can post tee times as themselves" on public.tee_times;
create policy "Players can post tee times as themselves"
  on public.tee_times for insert to authenticated with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can update their own tee times" on public.tee_times;
create policy "Organizers can update their own tee times"
  on public.tee_times for update to authenticated
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can delete their own tee times" on public.tee_times;
create policy "Organizers can delete their own tee times"
  on public.tee_times for delete to authenticated using (auth.uid() = organizer_id);

create table if not exists public.tee_time_rsvps (
  tee_time_id uuid not null references public.tee_times (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'going' check (status in ('going','cancelled','showed','no_show')),
  created_at timestamptz not null default now(),
  primary key (tee_time_id, user_id)
);

alter table public.tee_time_rsvps enable row level security;

drop policy if exists "Tee time RSVPs are readable by any signed-in player" on public.tee_time_rsvps;
create policy "Tee time RSVPs are readable by any signed-in player"
  on public.tee_time_rsvps for select to authenticated using (true);

drop policy if exists "Players can RSVP to tee times as themselves" on public.tee_time_rsvps;
create policy "Players can RSVP to tee times as themselves"
  on public.tee_time_rsvps for insert to authenticated with check (auth.uid() = user_id and status = 'going');

drop policy if exists "Players can update their own tee time RSVP" on public.tee_time_rsvps;
create policy "Players can update their own tee time RSVP"
  on public.tee_time_rsvps for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('going','cancelled'));

drop policy if exists "Players can remove their own tee time RSVP" on public.tee_time_rsvps;
create policy "Players can remove their own tee time RSVP"
  on public.tee_time_rsvps for delete to authenticated using (auth.uid() = user_id);

create or replace function public.mark_tee_time_attendance(p_id uuid, p_user_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_organizer uuid;
  v_previous text;
begin
  if p_status not in ('showed', 'no_show') then
    raise exception 'invalid status';
  end if;

  select organizer_id into v_organizer from public.tee_times where id = p_id;
  if v_organizer is null then
    raise exception 'tee time not found';
  end if;
  if auth.uid() <> v_organizer then
    raise exception 'only the organizer can mark attendance';
  end if;

  select status into v_previous from public.tee_time_rsvps where tee_time_id = p_id and user_id = p_user_id;
  if v_previous is null then
    raise exception 'player has no rsvp for this tee time';
  end if;

  update public.tee_time_rsvps set status = p_status where tee_time_id = p_id and user_id = p_user_id;

  if v_previous not in ('showed', 'no_show') then
    if p_status = 'showed' then
      update public.profiles set games_showed = games_showed + 1 where id = p_user_id;
    else
      update public.profiles set games_no_show = games_no_show + 1 where id = p_user_id;
    end if;
  end if;
end;
$$;

grant execute on function public.mark_tee_time_attendance(uuid, uuid, text) to authenticated;

-- ----------------------------------------------------------------------------
-- LEAGUES — informational listings with an "interested" signal.
-- ----------------------------------------------------------------------------
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  sport text not null check (sport in
    ('soccer','basketball','pickleball','baseball','volleyball','flag_football','tennis','golf')),
  name text not null,
  schedule text,
  location text not null,
  description text,
  contact_info text,
  created_at timestamptz not null default now()
);

alter table public.leagues enable row level security;

drop policy if exists "Leagues are readable by any signed-in player" on public.leagues;
create policy "Leagues are readable by any signed-in player"
  on public.leagues for select to authenticated using (true);

drop policy if exists "Players can post leagues as themselves" on public.leagues;
create policy "Players can post leagues as themselves"
  on public.leagues for insert to authenticated with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can update their own leagues" on public.leagues;
create policy "Organizers can update their own leagues"
  on public.leagues for update to authenticated
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists "Organizers can delete their own leagues" on public.leagues;
create policy "Organizers can delete their own leagues"
  on public.leagues for delete to authenticated using (auth.uid() = organizer_id);

create table if not exists public.league_interest (
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

alter table public.league_interest enable row level security;

drop policy if exists "League interest is readable by any signed-in player" on public.league_interest;
create policy "League interest is readable by any signed-in player"
  on public.league_interest for select to authenticated using (true);

drop policy if exists "Players can mark their own interest" on public.league_interest;
create policy "Players can mark their own interest"
  on public.league_interest for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Players can remove their own interest" on public.league_interest;
create policy "Players can remove their own interest"
  on public.league_interest for delete to authenticated using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- REALTIME — let the app live-update when games/RSVPs change.
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['games', 'game_rsvps', 'tee_times', 'tee_time_rsvps'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
