ALTER TABLE `generated_websites` ADD `source` enum('admin','external') DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `customerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `captureStatus` enum('email_captured','onboarding_started','onboarding_completed','converted','abandoned') DEFAULT 'email_captured';--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `colorScheme` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnMenu` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnMenuData` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnPricelist` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `addOnPricelistData` json;