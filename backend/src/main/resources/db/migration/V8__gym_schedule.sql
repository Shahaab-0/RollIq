-- A recurring weekly slot ("every Wednesday at 6pm, No-Gi") -- forward
-- looking, unlike gym_class_entries which is a retrospective recap of what
-- already happened. day_of_week follows java.time.DayOfWeek's ISO
-- numbering (1=Monday..7=Sunday) so the backend never has to translate.

create table gym_schedule_entries (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms (id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  topic text,
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index gym_schedule_entries_gym_id_idx on gym_schedule_entries (gym_id, day_of_week, start_time);
