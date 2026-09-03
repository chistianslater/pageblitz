-- Verlauf (2026-09-03): Stände des v2-Dokuments je Website. Jeder
-- Studio-Schreibvorgang legt einen Stand ab (max. 50 pro Website, gleiche
-- Auslöser innerhalb von zwei Minuten werden ersetzt). Restore/Undo im
-- Studio-Panel „Verlauf“ lesen daraus.
CREATE TABLE `website_versions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `websiteId` int NOT NULL,
  `trigger` varchar(20) NOT NULL,
  `label` varchar(160) NOT NULL,
  `websiteData` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `website_versions_id` PRIMARY KEY(`id`)
);
CREATE INDEX `website_versions_website_created_idx` ON `website_versions` (`websiteId`, `createdAt`);
