-- Attendance for a class recap -- trainer/owner marks which gym members
-- were actually there. Ties to gym_class_entries (a specific dated
-- occurrence), not gym_schedule_entries (a recurring weekly template with
-- no specific date to attach attendance to).

create table gym_class_attendance (
  id uuid primary key default gen_random_uuid(),
  gym_class_entry_id uuid not null references gym_class_entries (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  marked_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (gym_class_entry_id, user_id)
);

create index gym_class_attendance_entry_id_idx on gym_class_attendance (gym_class_entry_id);
