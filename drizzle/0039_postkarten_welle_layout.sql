-- Postkarten Welle 2 (2026-10-13): vier Batches à 5 Karten, je eine
-- Variable (Branche, Kartendesign, Wortlaut, Nachfass).
--
--   welle   Kampagne, z. B. 'welle-2'. Die 32 Karten der ersten Welle
--           bleiben NULL und erscheinen in der Auswertung als 'welle-1'.
--   batch   Versuchsarm innerhalb der Welle ('A'..'D'). Eigene Spalte statt
--           in `layout` versteckt: A und C teilen dasselbe Layout und
--           unterscheiden sich nur im Text — der Arm ist eine Frage der
--           Auswertung, das Layout eine der Technik (welche HeyMail-Vorlage,
--           welches Motiv).
--   layout  Kartenlayout: NULL/'standard' = Vorlage der ersten Welle
--           (HEYMAIL_TEMPLATE_ID), 'screenshot' = Vorderseite mit dem
--           nackten Screenshot der Seite (HEYMAIL_TEMPLATE_ID_SCREENSHOT).
--
-- Nachfass-Karten (Batch D) sind eigene Zeilen mit neuem Code zum selben
-- Betrieb; die Karte der ersten Welle bleibt unverändert stehen.
ALTER TABLE `postcards`
  ADD COLUMN `welle` varchar(20) NULL AFTER `testkarte`,
  ADD COLUMN `batch` varchar(20) NULL AFTER `welle`,
  ADD COLUMN `layout` varchar(40) NULL AFTER `batch`,
  ADD INDEX `postcards_welle_idx` (`welle`),
  ADD INDEX `postcards_business_idx` (`businessId`);
