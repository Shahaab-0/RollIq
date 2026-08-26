-- Competition/tournament tracking -- separate from rolls (regular sparring)
-- since a competition is a named event (weight category, belt division)
-- containing multiple matches against different opponents, each with a
-- win/loss/draw result. A competition is owned directly by user_id; matches
-- hang off the competition (no user_id of their own, same two-level
-- ownership pattern as gym_class_entries -> gym_class_videos).

create table competitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  competition_date date not null,
  weight_category text not null,
  belt_division text,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index competitions_user_id_idx on competitions (user_id, competition_date desc);

create trigger competitions_set_updated_at
  before update on competitions
  for each row execute function set_updated_at();

create table competition_matches (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions (id) on delete cascade,
  opponent_name text not null,
  result text not null check (result in ('win', 'loss', 'draw')),
  method text,
  match_order int not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index competition_matches_competition_id_idx
  on competition_matches (competition_id, match_order);

create trigger competition_matches_set_updated_at
  before update on competition_matches
  for each row execute function set_updated_at();
