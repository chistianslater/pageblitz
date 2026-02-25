ALTER TABLE `businesses` ADD `leadType` enum('no_website','outdated_website','poor_website','unknown') DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE `businesses` ADD `websiteAge` int;--> statement-breakpoint
ALTER TABLE `businesses` ADD `websiteScore` int;--> statement-breakpoint
ALTER TABLE `businesses` ADD `websiteAnalysis` json;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `heroImageUrl` text;--> statement-breakpoint
ALTER TABLE `generated_websites` ADD `layoutStyle` varchar(50) DEFAULT 'classic';