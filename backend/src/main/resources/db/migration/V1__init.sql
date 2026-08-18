-- RollIQ schema: users, profiles, training_sessions, techniques,
-- session_techniques, rolls, belt_promotions, refresh_tokens.
-- Ownership is enforced in the service layer (JWT principal), not via
-- Postgres RLS -- every owned table still carries user_id for that.

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- users -----------------------------------------------------------------

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- refresh_tokens ----------------------------------------------------------

create table refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index refresh_tokens_user_id_idx on refresh_tokens (user_id);

-- profiles ------------------------------------------------------------

create table profiles (
  id uuid primary key references users (id) on delete cascade,
  display_name text,
  current_belt text not null default 'white'
    check (current_belt in ('white', 'blue', 'purple', 'brown', 'black')),
  current_stripes int not null default 0 check (current_stripes between 0 and 4),
  home_gym text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- training_sessions -------------------------------------------------------

create table training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  date date not null,
  gi boolean not null,
  duration_minutes int check (duration_minutes > 0),
  session_type text not null check (session_type in (
    'fundamentals', 'advanced', 'open_mat', 'private', 'competition_class'
  )),
  instructor text,
  notes text,
  rounds_count int check (rounds_count >= 0),
  round_minutes int check (round_minutes > 0),
  productivity_rating int check (productivity_rating between 1 and 5),
  submissions_landed_count int check (submissions_landed_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index training_sessions_user_id_date_idx on training_sessions (user_id, date desc);

create trigger training_sessions_set_updated_at
  before update on training_sessions
  for each row execute function set_updated_at();

-- techniques --------------------------------------------------------------

create table techniques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  position text not null,
  notes text,
  resource_url text,
  drill_count int not null default 0 check (drill_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index techniques_user_id_idx on techniques (user_id);

create trigger techniques_set_updated_at
  before update on techniques
  for each row execute function set_updated_at();

-- session_techniques --------------------------------------------------------

create table session_techniques (
  session_id uuid not null references training_sessions (id) on delete cascade,
  technique_id uuid not null references techniques (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, technique_id)
);

create index session_techniques_technique_id_idx on session_techniques (technique_id);

-- rolls --------------------------------------------------------------

create table rolls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  session_id uuid references training_sessions (id) on delete set null,
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

create trigger rolls_set_updated_at
  before update on rolls
  for each row execute function set_updated_at();

-- belt_promotions --------------------------------------------------------

create table belt_promotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  belt text not null check (belt in ('white', 'blue', 'purple', 'brown', 'black')),
  promoted_on date not null,
  notes text,
  stripes int not null default 0 check (stripes between 0 and 4),
  created_at timestamptz not null default now()
);

create index belt_promotions_user_id_idx on belt_promotions (user_id, promoted_on);
