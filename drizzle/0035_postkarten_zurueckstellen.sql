-- Kampagnen-Buchführung (Betreiber-Wunsch 2026-09-13).
--
-- Die Frage aus dem Betrieb lautet: „Welche habe ich schon gemacht, und
-- welche fallen raus, weil keine Adresse da ist?" Ohne dritten Status
-- verschwand die zweite Gruppe entweder gar nicht (steht ewig als
-- blockiert in der Liste) oder ganz (Seite gelöscht — dann ist auch die
-- Antwort weg, ob der Betrieb je dran war).
--
-- `zurueckgestellt` ist deshalb ein eigener Zustand mit Begründung, kein
-- Löschen.
ALTER TABLE `postcards`
  MODIFY COLUMN `status` enum('entwurf','versendet','zurueckgestellt')
    NOT NULL DEFAULT 'entwurf',
  ADD COLUMN `notiz` varchar(300) NULL AFTER `status`;
