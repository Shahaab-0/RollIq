-- Positions were a fixed enum (guard/mount/side_control/...), but users
-- want to add their own (e.g. "50/50", "leg drag", "de la Riva") — switch
-- to free text. Existing values convert over as-is since the enum labels
-- were already the display strings.

alter table techniques
  alter column position type text using position::text;

drop type position_enum;
