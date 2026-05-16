-- Felder aus dem Landing-Redesign-Branch (fix-google-ads-conversions-3xGNK):
-- Layout-Versionierung, GDPR-Marketing-Consent, step-level Onboarding-Events.

-- 1) Layout-Versionierung auf generated_websites
ALTER TABLE `generated_websites` ADD `layoutVersion` int NOT NULL DEFAULT 1;

-- 2) GDPR Marketing-Consent auf generated_websites
ALTER TABLE `generated_websites` ADD `marketingConsent` boolean DEFAULT false;
ALTER TABLE `generated_websites` ADD `marketingConsentAt` bigint;

-- 3) onboarding_events: step-level Funnel-Tracking
CREATE TABLE `onboarding_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `websiteId` int NOT NULL,
  `step` varchar(50) NOT NULL,
  `stepIndex` int NOT NULL,
  `event` enum('reached','completed','skipped') NOT NULL DEFAULT 'reached',
  `createdAt` timestamp DEFAULT (now()) NOT NULL,
  CONSTRAINT `onboarding_events_id` PRIMARY KEY(`id`)
);
CREATE INDEX `onboarding_events_website` ON `onboarding_events` (`websiteId`);
