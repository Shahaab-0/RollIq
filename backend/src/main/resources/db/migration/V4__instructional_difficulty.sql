-- Adds a difficulty tier to instructionals (beginner/intermediate/advanced),
-- fixed set like belt/progress-status rather than freeform like category --
-- "difficulty" only makes sense as a small taxonomy, not an open one.

alter table instructionals add column difficulty text
  check (difficulty in ('beginner', 'intermediate', 'advanced'));

-- Backfill the series seeded in V3 with a best-effort rating.
update instructionals set difficulty = 'advanced' where title = 'Enter the System';
update instructionals set difficulty = 'beginner' where title = 'Go Further Faster';
update instructionals set difficulty = 'intermediate' where title = 'The Guard Retention Formula';
update instructionals set difficulty = 'intermediate' where title = 'Back Attacks';
update instructionals set difficulty = 'advanced' where title = 'Systematically Attacking the Guard';
update instructionals set difficulty = 'intermediate' where title = 'Textbook Leg Locks';
update instructionals set difficulty = 'intermediate' where title = 'Battle Tested Leg Locks';
update instructionals set difficulty = 'intermediate' where title = 'Lapel Guard';
update instructionals set difficulty = 'intermediate' where title = 'X-Guard Sweeps and Attacks';
update instructionals set difficulty = 'beginner' where title = 'Pressure Passing';
update instructionals set difficulty = 'beginner' where title = 'Modern Jiu-Jitsu Takedowns';
update instructionals set difficulty = 'intermediate' where title = 'Berimbolo Encyclopedia';

alter table instructionals alter column difficulty set not null;
