-- Belt promotion history, so the Dashboard can show a timeline of how
-- long each belt took. profiles.current_belt/current_stripes stays the
-- editable "current state" shown everywhere else in the app; this table
-- is the append-only log that timeline duration math is derived from.

create table belt_promotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  belt belt_enum not null,
  promoted_on date not null,
  notes text,
  created_at timestamptz not null default now()
);

create index belt_promotions_user_id_idx on belt_promotions (user_id, promoted_on);

alter table belt_promotions enable row level security;

create policy "belt_promotions are owner-readable" on belt_promotions
  for select using (auth.uid() = user_id);
create policy "belt_promotions are owner-insertable" on belt_promotions
  for insert with check (auth.uid() = user_id);
create policy "belt_promotions are owner-updatable" on belt_promotions
  for update using (auth.uid() = user_id);
create policy "belt_promotions are owner-deletable" on belt_promotions
  for delete using (auth.uid() = user_id);
