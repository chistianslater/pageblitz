ALTER TABLE `template_uploads` MODIFY COLUMN `industry` varchar(100) NOT NULL DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `template_uploads` MODIFY COLUMN `layoutPool` varchar(50) NOT NULL DEFAULT 'clean';--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `industries` text DEFAULT ('[]') NOT NULL;--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `aiIndustries` text;--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `aiLayoutPool` varchar(50);--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `aiConfidence` varchar(20);--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `aiReason` text;--> statement-breakpoint
ALTER TABLE `template_uploads` ADD `status` varchar(20) DEFAULT 'pending' NOT NULL;