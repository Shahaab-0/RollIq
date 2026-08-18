-- Gyms: the app's first role-gated shared entity. A gym has an owner (its
-- creator), trainers (promoted by the owner), and members (who join via an
-- invite code). Only owner/trainer can post class recap entries; any member
-- can read them. Authorization lives in GymAccessService, off
-- gym_memberships -- not row ownership like every other table so far.

create table gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table gym_memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  role text not null check (role in ('owner', 'trainer', 'member')),
  joined_at timestamptz not null default now(),
  unique (gym_id, user_id)
);

create index gym_memberships_user_id_idx on gym_memberships (user_id);
create index gym_memberships_gym_id_idx on gym_memberships (gym_id);

-- "class recap" -- what a session covered. Append-only from the UI's
-- perspective (create/delete, no update), same shape as belt_promotions.
create table gym_class_entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms (id) on delete cascade,
  title text not null,
  description text,
  class_date date not null,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index gym_class_entries_gym_id_idx on gym_class_entries (gym_id, class_date desc);

-- techniques is a text[], not a child join table -- same array-column
-- pattern already used by rolls.submissions_landed/submissions_received.
create table gym_class_videos (
  id uuid primary key default gen_random_uuid(),
  gym_class_entry_id uuid not null references gym_class_entries (id) on delete cascade,
  url text,
  techniques text[] not null default '{}',
  sequence_number int not null,
  created_at timestamptz not null default now()
);

create index gym_class_videos_entry_id_idx on gym_class_videos (gym_class_entry_id);
