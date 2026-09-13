-- Postkarten im Backend erzeugen und beauftragen (Betreiber-Wunsch
-- 2026-09-13). Bisher entstanden Motiv und HeyMail-Vorschau nur ueber zwei
-- Skripte auf dem Server; im Dashboard war danach nicht zu sehen, ob eine
-- Karte ueberhaupt ein Motiv hat und von wann es ist.
--
-- `bildAt` ist dabei der eigentliche Punkt: Ist es aelter als
-- `generated_websites.updatedAt`, wurde die Seite nach der Aufnahme neu
-- erzeugt — die Karte wuerde mit einem Stand werben, den es nicht mehr
-- gibt. Genau dieser Fall soll im Backend sichtbar sein, solange die Karte
-- noch nicht raus ist.
ALTER TABLE `postcards`
  ADD COLUMN `bildUrl` varchar(500) NULL AFTER `status`,
  ADD COLUMN `bildAt` timestamp NULL AFTER `bildUrl`,
  ADD COLUMN `pdfUrl` varchar(500) NULL AFTER `bildAt`,
  ADD COLUMN `pdfAt` timestamp NULL AFTER `pdfUrl`;
