-- RollIQ MVP schema: profiles, sessions, techniques, rolls.
-- Every table is owned by a single auth user and locked down with RLS.

create extension if not exists "pgcrypto";

create type belt_enum as enum ('white', 'blue', 'purple', 'brown', 'black');
create type session_type_enum as enum (
  'fundamentals', 'advanced', 'open_mat', 'private', 'competition_class'
);
create type position_enum as enum (
  'guard', 'mount', 'side_control', 'back_control',
  'standing', 'submissions', 'escapes', 'transitions'
);

-- Shared trigger to keep updated_at current on every write.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles ------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  current_belt belt_enum not null default 'white',
  current_stripes int not null default 0 check (current_stripes between 0 and 4),
  home_gym text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are self-readable" on profiles
  for select using (auth.uid() = id);
create policy "profiles are self-insertable" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles are self-updatable" on profiles
  for update using (auth.uid() = id);
create policy "profiles are self-deletable" on profiles
  for delete using (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row the moment someone signs up, so the client
-- never has to juggle "auth succeeded but profile insert failed" states.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- sessions --------------------------------------------------------------

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  gi boolean not null,
  duration_minutes int check (duration_minutes > 0),
  session_type session_type_enum not null,
  instructor text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sessions_user_id_date_idx on sessions (user_id, date desc);

alter table sessions enable row level security;

create policy "sessions are owner-readable" on sessions
  for select using (auth.uid() = user_id);
create policy "sessions are owner-insertable" on sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions are owner-updatable" on sessions
  for update using (auth.uid() = user_id);
create policy "sessions are owner-deletable" on sessions
  for delete using (auth.uid() = user_id);

create trigger sessions_set_updated_at
  before update on sessions
  for each row execute function set_updated_at();

-- techniques --------------------------------------------------------------

create table techniques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position position_enum not null,
  notes text,
  resource_url text,
  drill_count int not null default 0 check (drill_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index techniques_user_id_idx on techniques (user_id);

alter table techniques enable row level security;

create policy "techniques are owner-readable" on techniques
  for select using (auth.uid() = user_id);
create policy "techniques are owner-insertable" on techniques
  for insert with check (auth.uid() = user_id);
create policy "techniques are owner-updatable" on techniques
  for update using (auth.uid() = user_id);
create policy "techniques are owner-deletable" on techniques
  for delete using (auth.uid() = user_id);

create trigger techniques_set_updated_at
  before update on techniques
  for each row execute function set_updated_at();

-- rolls --------------------------------------------------------------

create table rolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Nullable and ON DELETE SET NULL (not cascade): a roll's submission/tap
  -- history is meaningful on its own and shouldn't be wiped out just
  -- because the session log entry it happened during gets deleted.
  session_id uuid references sessions (id) on delete set null,
  partner_name text,
  submissions_landed text[] not null default '{}',
  submissions_received text[] not null default '{}',
  escapes int not null default 0 check (escapes >= 0),
  effort_rating int check (effort_rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rolls_user_id_idx on rolls (user_id);
create index rolls_session_id_idx on rolls (session_id);

alter table rolls enable row level security;

create policy "rolls are owner-readable" on rolls
  for select using (auth.uid() = user_id);
create policy "rolls are owner-insertable" on rolls
  for insert with check (auth.uid() = user_id);
create policy "rolls are owner-updatable" on rolls
  for update using (auth.uid() = user_id);
create policy "rolls are owner-deletable" on rolls
  for delete using (auth.uid() = user_id);

create trigger rolls_set_updated_at
  before update on rolls
  for each row execute function set_updated_at();
