-- Basic per-session progress metrics: a subjective productivity rating and
-- a quick submissions-landed tally (kept as a plain count, consistent with
-- rounds_count/round_minutes, rather than requiring detailed Roll Tracker entries).

alter table sessions
  add column productivity_rating int check (productivity_rating between 1 and 5),
  add column submissions_landed_count int check (submissions_landed_count >= 0);
