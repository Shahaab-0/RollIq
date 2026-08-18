-- Starter catalog of well-known BJJ instructional series, seeded so the
-- library isn't empty on first run. This is a best-effort list from general
-- knowledge, not a verified source -- exact volume counts/titles for
-- multi-part series are generic placeholders ("Volume 1", "Volume 2", ...)
-- and every url is left blank on purpose (no guessed links). Review, fix,
-- and add to this from inside the app.

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Enter the System', 'John Danaher', 'Leg Locks', 'BJJ Fanatics',
    'A systematic breakdown of leg entanglement positions and control, built around the ashi garami family.', 2018)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values
  ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3), ('Volume 4', 4),
  ('Volume 5', 5), ('Volume 6', 6), ('Volume 7', 7), ('Volume 8', 8)
) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Go Further Faster', 'John Danaher', 'No-Gi Fundamentals', 'BJJ Fanatics',
    'A no-gi fundamentals curriculum covering positional control and the core submission chains.', 2019)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values
  ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3), ('Volume 4', 4)
) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('The Guard Retention Formula', 'John Danaher', 'Guard Retention', 'BJJ Fanatics',
    'Principles and mechanics for keeping and recovering guard against a passing opponent.', 2020)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values
  ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3), ('Volume 4', 4)
) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Back Attacks', 'John Danaher', 'Back Attacks', 'BJJ Fanatics',
    'Taking, controlling, and finishing from the back, including seatbelt control and chokes.', 2017)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values
  ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3), ('Volume 4', 4)
) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Systematically Attacking the Guard', 'Gordon Ryan', 'Guard Passing', 'BJJ Fanatics',
    'A guard passing framework built around pressure, hip control, and layered back-up options.', 2020)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values
  ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3), ('Volume 4', 4)
) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Textbook Leg Locks', 'Lachlan Giles', 'Leg Locks', 'BJJ Fanatics',
    'Leg lock entries and finishing mechanics, with an emphasis on detail against resistance.', 2019)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Battle Tested Leg Locks', 'Craig Jones', 'Leg Locks', 'BJJ Fanatics',
    'A leg lock system covering entries, control positions, and finishing sequences.', 2019)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Lapel Guard', 'Keenan Cornelius', 'Lapel Guard', 'BJJ Fanatics',
    'Gi-specific guard system built around lapel grips and sweeps/back-take sequences.', 2016)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('X-Guard Sweeps and Attacks', 'Marcelo Garcia', 'X-Guard', 'BJJ Fanatics',
    'Entries, sweeps, and leg attacks from x-guard and single-leg x.', 2015)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Pressure Passing', 'Bernardo Faria', 'Guard Passing', 'BJJ Fanatics',
    'Gi pressure-passing fundamentals: chest-to-chest control, knee cut, and stack passes.', 2018)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Modern Jiu-Jitsu Takedowns', 'Travis Stevens', 'Takedowns', 'BJJ Fanatics',
    'Judo-based takedowns and entries adapted for jiu-jitsu, gi and no-gi.', 2017)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year)
  values ('Berimbolo Encyclopedia', 'Rafael Mendes', 'Guard Retention', 'BJJ Fanatics',
    'De la Riva and berimbolo entries, back takes, and the surrounding guard-retention details.', 2016)
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);
