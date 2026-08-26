-- Short-lived numeric codes for the forgot-password flow. A code, not a
-- deep-link token, since the app has no web page to land a reset-link on --
-- the user enters the code (emailed to them) directly in-app.

create table password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index password_reset_codes_user_id_idx on password_reset_codes (user_id, created_at desc);
