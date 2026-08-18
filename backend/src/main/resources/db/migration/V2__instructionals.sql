-- The app's first shared (non-user-owned) data: a catalog of BJJ
-- instructionals that every signed-in user browses and searches, plus a
-- per-user progress record against each individual video. RollIQ never
-- stores or streams the videos themselves -- instructional_videos.url just
-- points at wherever the video actually lives (the platform's own player).

create table instructionals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructor text not null,
  category text not null,
  platform text,
  url text,
  description text,
  release_year int,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index instructionals_instructor_idx on instructionals (instructor);
create index instructionals_category_idx on instructionals (category);

-- One row per video/volume within a series.
create table instructional_videos (
  id uuid primary key default gen_random_uuid(),
  instructional_id uuid not null references instructionals (id) on delete cascade,
  title text not null,
  sequence_number int not null,
  url text,
  duration_minutes int check (duration_minutes > 0),
  created_at timestamptz not null default now()
);

create index instructional_videos_instructional_id_idx
  on instructional_videos (instructional_id, sequence_number);

-- Owned by user_id, same shape as every other per-user table in this app --
-- tracked per video (not per series), and marked manually (there's no
-- playback signal to auto-detect completion from a video RollIQ doesn't host).
create table instructional_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  video_id uuid not null references instructional_videos (id) on delete cascade,
  status text not null check (status in ('want_to_watch', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, video_id)
);

create index instructional_progress_user_id_idx on instructional_progress (user_id);

create trigger instructional_progress_set_updated_at
  before update on instructional_progress
  for each row execute function set_updated_at();
