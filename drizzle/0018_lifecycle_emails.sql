-- Lifecycle Emails: Drip-Sequenz für unfertige Onboardings
-- + Reservation-Tracking auf generated_websites
-- + Reactivation Seeds für Fresh-Start-Flow nach Löschung

-- 1) Reservation-Spalten auf generated_websites
ALTER TABLE `generated_websites` ADD `reservedUntil` timestamp;
ALTER TABLE `generated_websites` ADD `extensionsUsed` int NOT NULL DEFAULT 0;

-- 2) lifecycle_emails: geplante und versendete Drip-Mails
CREATE TABLE `lifecycle_emails` (
  `id` int AUTO_INCREMENT NOT NULL,
  `websiteId` int NOT NULL,
  `recipientEmail` varchar(320) NOT NULL,
  `type` enum('reminder_2h','reminder_24h','reminder_final','fresh_start_7d') NOT NULL,
  `scheduledFor` timestamp NOT NULL,
  `sentAt` timestamp,
  `status` enum('scheduled','sent','cancelled','skipped','bounced') NOT NULL DEFAULT 'scheduled',
  `resendEmailId` varchar(255),
  `cancelReason` varchar(255),
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `lifecycle_emails_id` PRIMARY KEY(`id`),
  CONSTRAINT `lifecycle_emails_website_type_unique` UNIQUE(`websiteId`,`type`)
);
CREATE INDEX `lifecycle_emails_scheduled_lookup` ON `lifecycle_emails` (`status`,`scheduledFor`);

-- 3) reactivation_seeds: Minimal-Daten-Backup nach Website-Löschung
CREATE TABLE `reactivation_seeds` (
  `id` int AUTO_INCREMENT NOT NULL,
  `token` varchar(64) NOT NULL,
  `recipientEmail` varchar(320) NOT NULL,
  `businessName` varchar(500),
  `businessCategory` varchar(255),
  `googlePlaceId` varchar(255),
  `originalWebsiteId` int,
  `originalBusinessId` int,
  `usedAt` timestamp,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `reactivation_seeds_id` PRIMARY KEY(`id`),
  CONSTRAINT `reactivation_seeds_token_unique` UNIQUE(`token`)
);
