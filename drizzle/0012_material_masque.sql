CREATE TABLE `contact_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`message` text NOT NULL,
	`customFields` json,
	`ipAddress` varchar(45),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `contactFormFields` json;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `umamiWebsiteId` varchar(100);--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `openingHours` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `contactFormFields` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `sectionOrder` json;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD `hiddenSections` json;