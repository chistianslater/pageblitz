-- Druckstatus je Postkarte (2026-09-19): Stand im HeyMail-Konto, von Hand
-- gepflegt, weil HeyMail per API-Schluessel keine Status-Abfrage bietet.
-- Die 32 am 17.09. beauftragten Karten sind laut Betreiber geplant (nicht
-- storniert); die Testkarte ohne HeyMail-ID (7N38, 09.09.) ist zugestellt.
ALTER TABLE `postcards`
  ADD COLUMN `druckstatus` enum('geplant','verschickt','storniert') NULL AFTER `notiz`;

UPDATE `postcards` SET `druckstatus` = 'geplant'
  WHERE `status` = 'versendet' AND `heymailId` IS NOT NULL;
UPDATE `postcards` SET `druckstatus` = 'verschickt'
  WHERE `status` = 'versendet' AND `heymailId` IS NULL;
