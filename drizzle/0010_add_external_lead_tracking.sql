-- Add external lead tracking columns to generated_websites
ALTER TABLE `generated_websites` ADD `source` enum('admin','external') DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `customerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `captureStatus` enum('email_captured','onboarding_started','onboarding_completed','converted','abandoned') DEFAULT 'email_captured';
