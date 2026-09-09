-- Postkarten-Nachverfolgung (Betreiber-Wunsch 2026-09-09): Welche Karte
-- ging wann raus, wurde sie gescannt, und welche Textvariante zieht?
--
-- Der `code` ist das Bindeglied: Er steht auf der Karte (QR + Kurz-Link)
-- und zeigt auf den BETRIEB, nicht auf einen Vorschau-Token. Dadurch
-- bleibt gedrucktes Papier gueltig, auch wenn die Vorschau neu erzeugt
-- wird — was am selben Tag zweimal passiert ist.
CREATE TABLE `postcards` (
  `id` int AUTO_INCREMENT NOT NULL,
  `code` varchar(12) NOT NULL,
  `businessId` int NOT NULL,
  `websiteId` int,
  `city` varchar(120),
  `textVariant` varchar(60),
  `heymailId` varchar(120),
  `status` enum('entwurf','versendet') NOT NULL DEFAULT 'entwurf',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `sentAt` timestamp NULL,
  CONSTRAINT `postcards_id` PRIMARY KEY(`id`),
  CONSTRAINT `postcards_code_unique` UNIQUE(`code`)
);

-- Bewusst ohne IP, Cookie oder User-Agent: nur Zeitpunkt, Karte, Kanal.
-- Damit bleibt die Erfassung ohne Personenbezug.
CREATE TABLE `postcard_scans` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postcardId` int NOT NULL,
  `channel` enum('qr','typed') NOT NULL,
  `at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postcard_scans_id` PRIMARY KEY(`id`)
);

CREATE INDEX `postcard_scans_card_at_idx` ON `postcard_scans` (`postcardId`, `at`);
