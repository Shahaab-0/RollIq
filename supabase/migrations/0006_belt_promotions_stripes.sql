-- Track stripes alongside belt in the promotion log, so a stripe earned
-- via the main Profile save (not just the dedicated "Log Promotion" form)
-- also gets a dated history entry.

alter table belt_promotions
  add column stripes int not null default 0 check (stripes between 0 and 4);
