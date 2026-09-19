-- Eigene Testkarten aus der Auswertung nehmen (2026-09-19): 7N38 ging am
-- 09.09. an SCHAU & HORCH. Der Kurz-Link bleibt gültig, Übersicht und
-- Trichter zählen die Karte nicht mehr.
ALTER TABLE `postcards`
  ADD COLUMN `testkarte` boolean NOT NULL DEFAULT false AFTER `druckstatus`;

UPDATE `postcards` SET `testkarte` = true WHERE `code` = '7N38';
