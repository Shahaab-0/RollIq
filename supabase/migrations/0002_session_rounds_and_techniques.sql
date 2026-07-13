-- Adds fixed-length round tracking to sessions, and a many-to-many link
-- between sessions and the techniques covered during them.

alter table sessions
  add column rounds_count int check (rounds_count >= 0),
  add column round_minutes int check (round_minutes > 0);

create table session_techniques (
  session_id uuid not null references sessions (id) on delete cascade,
  technique_id uuid not null references techniques (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, technique_id)
);

create index session_techniques_technique_id_idx
  on session_techniques (technique_id);

alter table session_techniques enable row level security;

create policy "session_techniques are owner-readable" on session_techniques
  for select using (auth.uid() = user_id);
create policy "session_techniques are owner-insertable" on session_techniques
  for insert with check (auth.uid() = user_id);
create policy "session_techniques are owner-deletable" on session_techniques
  for delete using (auth.uid() = user_id);
