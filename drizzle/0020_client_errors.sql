-- Client-Error-Logging: Persistente Tabelle für Browser-Crashes
-- Fingerprint (sha256-Hash von source+message+stack-prefix) gruppiert
-- identische Errors → Counter statt n Rows.

CREATE TABLE `client_errors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `fingerprint` varchar(64) NOT NULL,
  `source` enum('react','window-error','unhandled-rejection','server') NOT NULL,
  `message` text NOT NULL,
  `stack` text,
  `componentStack` text,
  `url` varchar(1024),
  `userAgent` varchar(500),
  `ip` varchar(64),
  `occurrences` int NOT NULL DEFAULT 1,
  `firstSeenAt` timestamp DEFAULT (now()) NOT NULL,
  `lastSeenAt` timestamp DEFAULT (now()) NOT NULL,
  `resolvedAt` timestamp,
  `resolvedBy` int,
  `notes` text,
  CONSTRAINT `client_errors_id` PRIMARY KEY(`id`),
  CONSTRAINT `client_errors_fingerprint_unique` UNIQUE(`fingerprint`)
);
CREATE INDEX `client_errors_resolved_last_seen` ON `client_errors` (`resolvedAt`, `lastSeenAt`);
