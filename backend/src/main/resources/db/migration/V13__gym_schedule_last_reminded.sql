-- Dedupe marker for the upcoming-class-reminder push job -- without this,
-- a schedule slot whose start_time falls in the job's polling window on
-- multiple runs (it runs every 15 minutes) would push the same reminder
-- more than once.

alter table gym_schedule_entries add column last_reminded_on date;
