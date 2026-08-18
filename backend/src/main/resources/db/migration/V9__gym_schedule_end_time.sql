-- A schedule slot needs a "from" and "to" time, not just when it starts.
-- Backfill existing rows to a 1-hour default before enforcing not-null,
-- same pattern as V4's difficulty backfill.

alter table gym_schedule_entries add column end_time time;

update gym_schedule_entries set end_time = start_time + interval '1 hour' where end_time is null;

alter table gym_schedule_entries alter column end_time set not null;
alter table gym_schedule_entries
  add constraint gym_schedule_entries_end_after_start check (end_time > start_time);
