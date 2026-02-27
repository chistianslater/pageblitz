CREATE TABLE `onboarding_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`stepCurrent` int NOT NULL DEFAULT 0,
	`businessName` varchar(255),
	`tagline` varchar(255),
	`description` text,
	`foundedYear` int,
	`teamSize` varchar(50),
	`usp` text,
	`topServices` json,
	`targetAudience` text,
	`faqItems` json,
	`logoUrl` varchar(1024),
	`photoUrls` json,
	`legalOwner` varchar(255),
	`legalStreet` varchar(255),
	`legalZip` varchar(20),
	`legalCity` varchar(255),
	`legalCountry` varchar(100) DEFAULT 'Deutschland',
	`legalEmail` varchar(255),
	`legalPhone` varchar(100),
	`legalVatId` varchar(100),
	`legalRegister` varchar(255),
	`legalRegisterCourt` varchar(255),
	`legalResponsible` varchar(255),
	`addOnContactForm` boolean DEFAULT false,
	`addOnGallery` boolean DEFAULT false,
	`addOnSubpages` json,
	`completedAt` bigint,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `onboarding_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_responses_websiteId_unique` UNIQUE(`websiteId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`websiteId` int NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`status` enum('active','canceled','past_due','trialing','incomplete') NOT NULL DEFAULT 'incomplete',
	`plan` varchar(50) NOT NULL DEFAULT 'base',
	`addOns` json,
	`currentPeriodEnd` bigint,
	`createdAt` bigint NOT NULL,
	`updatedAt` bigint NOT NULL,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `businesses` ADD `googleReviews` json;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `onboardingStatus` enum('pending','in_progress','completed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `hasLegalPages` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `subscriptionStatus` enum('none','active','canceled','past_due') DEFAULT 'none';