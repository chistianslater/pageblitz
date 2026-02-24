CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placeId` varchar(255),
	`name` varchar(500) NOT NULL,
	`slug` varchar(255),
	`address` text,
	`phone` varchar(50),
	`email` varchar(320),
	`website` varchar(500),
	`category` varchar(255),
	`rating` decimal(2,1),
	`reviewCount` int DEFAULT 0,
	`openingHours` json,
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`socialMedia` json,
	`searchQuery` varchar(500),
	`searchRegion` varchar(255),
	`hasWebsite` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_placeId_unique` UNIQUE(`placeId`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `generated_websites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`slug` varchar(255) NOT NULL,
	`status` enum('preview','sold','active','inactive') NOT NULL DEFAULT 'preview',
	`websiteData` json,
	`colorScheme` json,
	`industry` varchar(255),
	`previewToken` varchar(100),
	`stripeSessionId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`paidAt` timestamp,
	`addons` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_websites_id` PRIMARY KEY(`id`),
	CONSTRAINT `generated_websites_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `generated_websites_previewToken_unique` UNIQUE(`previewToken`)
);
--> statement-breakpoint
CREATE TABLE `outreach_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`websiteId` int,
	`recipientEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text,
	`status` enum('draft','sent','opened','replied','bounced') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreach_emails_id` PRIMARY KEY(`id`)
);
