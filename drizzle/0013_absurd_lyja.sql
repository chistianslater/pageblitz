CREATE TABLE `appointment_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`weeklySchedule` json NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`bufferMinutes` int NOT NULL DEFAULT 0,
	`advanceDays` int NOT NULL DEFAULT 30,
	`title` varchar(255) DEFAULT 'Terminbuchung',
	`description` text,
	`notificationEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointment_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointment_settings_websiteId_unique` UNIQUE(`websiteId`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`visitorName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`message` text,
	`appointmentDate` varchar(10) NOT NULL,
	`appointmentTime` varchar(5) NOT NULL,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`cancelToken` varchar(32) NOT NULL,
	`notifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointments_cancelToken_unique` UNIQUE(`cancelToken`)
);
--> statement-breakpoint
CREATE TABLE `chat_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`visitorName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`summary` text,
	`notifiedAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_transcripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`chatLeadId` int,
	`messages` json NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`visitorName` varchar(255),
	`summary` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_transcripts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chat_transcripts_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
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
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`notes` text,
	CONSTRAINT `client_errors_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_errors_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
CREATE TABLE `lifecycle_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`type` enum('reminder_2h','reminder_24h','reminder_final','fresh_start_7d') NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`sentAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`status` enum('scheduled','sent','cancelled','skipped','bounced') NOT NULL DEFAULT 'scheduled',
	`resendEmailId` varchar(255),
	`cancelReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lifecycle_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `lifecycle_emails_website_type_unique` UNIQUE(`websiteId`,`type`)
);
--> statement-breakpoint
CREATE TABLE `magic_link_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`redirectUrl` varchar(512) NOT NULL DEFAULT '/my-website',
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `magic_link_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `magic_link_tokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`step` varchar(50) NOT NULL,
	`stepIndex` int NOT NULL,
	`event` enum('reached','completed','skipped') NOT NULL DEFAULT 'reached',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_experiments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`baselineVariant` varchar(100) NOT NULL,
	`challengerVariant` varchar(100) NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`winner` varchar(100),
	`status` enum('running','completed','aborted') NOT NULL DEFAULT 'running',
	`hypothesis` text,
	`baselineSends` int DEFAULT 0,
	`challengerSends` int DEFAULT 0,
	`baselineOpens` int DEFAULT 0,
	`challengerOpens` int DEFAULT 0,
	`baselineReplies` int DEFAULT 0,
	`challengerReplies` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreach_experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reactivation_seeds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`businessName` varchar(500),
	`businessCategory` varchar(255),
	`googlePlaceId` varchar(255),
	`originalWebsiteId` int,
	`originalBusinessId` int,
	`originalPreviewToken` varchar(100),
	`usedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reactivation_seeds_id` PRIMARY KEY(`id`),
	CONSTRAINT `reactivation_seeds_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `generated_websites` MODIFY COLUMN `captureStatus` enum('email_captured','onboarding_started','onboarding_completed','converted','abandoned');--> statement-breakpoint
ALTER TABLE `generation_jobs` MODIFY COLUMN `createdAt` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `generation_jobs` MODIFY COLUMN `createdAt` bigint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `generation_jobs` MODIFY COLUMN `updatedAt` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `generation_jobs` MODIFY COLUMN `updatedAt` bigint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `outreach_emails` MODIFY COLUMN `status` enum('generating','queued','draft','sent','opened','replied','bounced') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `status` enum('active','canceling','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'incomplete';--> statement-breakpoint
ALTER TABLE `contact_submissions` ADD `archivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `layoutVersion` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `contactEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `formerSlug` varchar(255);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `addOnBooking` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `addOnAiChat` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `addOnTeam` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `addOnTeamData` json;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `addOnCalendly` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `calendlyUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `chatWelcomeMessage` varchar(512);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `chatUsageCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `chatUsageResetAt` timestamp;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `showBranding` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `reservedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `extensionsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `marketingConsent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `marketingConsentAt` bigint;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `requiresAgeGate` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnBooking` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnAiChat` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnTeam` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnTeamData` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnCalendly` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `calendlyUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `chatWelcomeMessage` varchar(512);--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `chatUsageCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `chatUsageResetAt` timestamp;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `studioProgress` json;--> statement-breakpoint
ALTER TABLE `outreach_emails` ADD `previewUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `outreach_emails` ADD `variant` varchar(100) DEFAULT 'baseline';--> statement-breakpoint
ALTER TABLE `outreach_emails` ADD `resendEmailId` varchar(255);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `billingInterval` enum('monthly','yearly') DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
CREATE INDEX `client_errors_resolved_last_seen` ON `client_errors` (`resolvedAt`,`lastSeenAt`);--> statement-breakpoint
CREATE INDEX `lifecycle_emails_scheduled_lookup` ON `lifecycle_emails` (`status`,`scheduledFor`);