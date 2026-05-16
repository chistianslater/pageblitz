-- Schema-Fix: captureStatus-Default entfernen
--
-- Vorher: MySQL setzte automatisch 'email_captured' wenn der Code captureStatus
-- nicht explizit lieferte. Dadurch wurden Leads ohne customerEmail im Dashboard
-- fälschlich als "E-Mail erfasst" angezeigt.
--
-- Nachher: Default entfällt, Code MUSS den passenden Status setzen.
-- Backfill der einzelnen falsch markierten Row gleich mit erledigt.

ALTER TABLE `generated_websites`
  MODIFY COLUMN `captureStatus` enum('email_captured','onboarding_started','onboarding_completed','converted','abandoned');

-- Backfill: alle external Websites ohne customerEmail, die fälschlich als email_captured markiert wurden,
-- auf onboarding_started zurücksetzen (semantisch korrekt für "Lead hat Preview gestartet, aber keine Mail").
UPDATE `generated_websites`
SET `captureStatus` = 'onboarding_started'
WHERE `source` = 'external'
  AND `customerEmail` IS NULL
  AND `captureStatus` = 'email_captured';
