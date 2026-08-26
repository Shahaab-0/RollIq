-- Tracks failed guesses against the currently-outstanding reset code so it
-- can be locked out after too many wrong attempts -- a 6-digit code with no
-- attempt limit is brute-forceable well within its 15-minute TTL.
alter table password_reset_codes add column attempts integer not null default 0;
