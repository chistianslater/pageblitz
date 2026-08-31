-- Branchen-Lücken-Logging (Backlog 16, 2026-08-31): Kategorien ohne
-- direkten Style-Pack-Match werden gezählt, um neue Templates zu
-- priorisieren. Upsert per `normalized` (normalizeCategoryKey).
CREATE TABLE `industry_gaps` (
  `id` int AUTO_INCREMENT NOT NULL,
  `term` varchar(120) NOT NULL,
  `normalized` varchar(160) NOT NULL,
  `websiteId` int,
  `occurrences` int NOT NULL DEFAULT 1,
  `firstSeenAt` timestamp NOT NULL DEFAULT (now()),
  `lastSeenAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `industry_gaps_id` PRIMARY KEY(`id`),
  CONSTRAINT `industry_gaps_normalized_unique` UNIQUE(`normalized`)
);
