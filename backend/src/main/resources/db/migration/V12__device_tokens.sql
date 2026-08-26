-- Firebase Cloud Messaging device tokens, one row per device a user has
-- signed in on. A token is unique across the whole table (not per-user) --
-- if it turns up under a different user_id (e.g. someone signed out and a
-- different account signed in on the same device), registering it again
-- should just move the existing row rather than violate a per-user unique
-- constraint.

create table device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index device_tokens_user_id_idx on device_tokens (user_id);

create trigger device_tokens_set_updated_at
  before update on device_tokens
  for each row execute function set_updated_at();
