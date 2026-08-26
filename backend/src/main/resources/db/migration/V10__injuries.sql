-- Personal injury log -- owned by user_id, same shape as rolls/techniques.
-- body_part is free text (not an enum), same reasoning as techniques.position:
-- an injury's location doesn't fit a small fixed taxonomy any better than a
-- technique's position does.

create table injuries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  body_part text not null,
  description text not null,
  injury_date date not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  status text not null check (status in ('active', 'recovering', 'resolved')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index injuries_user_id_idx on injuries (user_id, injury_date desc);

create trigger injuries_set_updated_at
  before update on injuries
  for each row execute function set_updated_at();
