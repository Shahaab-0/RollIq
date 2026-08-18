-- More starter catalog entries, same caveats as V3: best-effort from general
-- knowledge, not a verified source. Confidence on these exact titles is
-- lower than the V3 batch -- review before treating as authoritative. Urls
-- left blank on purpose (no guessed links).

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('The Triangle', 'Ryan Hall', 'Submissions', 'BJJ Fanatics',
    'A deep, systematic breakdown of the triangle choke -- entries, finishing mechanics, and troubleshooting common defenses.', 2013, 'intermediate')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('Attack the Back', 'Andre Galvao', 'Back Attacks', 'BJJ Fanatics',
    'A wrestling-influenced approach to taking and controlling the back, built around Galvao''s ATOS system.', 2019, 'intermediate')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('The Musumeci Matrix', 'Mikey Musumeci', 'Leg Locks', 'BJJ Fanatics',
    'A detailed, position-by-position leg lock system built around Musumeci''s matrix-style breakdowns.', 2022, 'advanced')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('Body Lock Passing', 'Xande Ribeiro', 'Guard Passing', 'BJJ Fanatics',
    'Chest-to-chest pressure passing fundamentals built around securing and driving from a body lock.', 2017, 'beginner')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('Fundamentals of Domination', 'Tom DeBlass', 'Submissions', 'BJJ Fanatics',
    'Heavy top-pressure control and submission fundamentals for building a dominant top game.', 2018, 'beginner')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2)) as v(title, seq);

with s as (
  insert into instructionals (title, instructor, category, platform, description, release_year, difficulty)
  values ('Modern Fundamentals', 'Rafael Lovato Jr.', 'No-Gi Fundamentals', 'BJJ Fanatics',
    'Core positional control, escapes, and submissions for building a complete fundamentals base.', 2016, 'beginner')
  returning id
)
insert into instructional_videos (instructional_id, title, sequence_number)
select id, v.title, v.seq from s, (values ('Volume 1', 1), ('Volume 2', 2), ('Volume 3', 3)) as v(title, seq);
