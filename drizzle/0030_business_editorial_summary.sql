-- Plan B7 Task 1: GMB-Tiefenabruf — Editorial Summary des Place persistieren.
-- Additiv, kein Datenverlust möglich.
ALTER TABLE businesses ADD COLUMN editorialSummary text;
