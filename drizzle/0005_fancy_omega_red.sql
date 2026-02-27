CREATE TABLE `layout_counters` (
	`industryKey` varchar(100) NOT NULL,
	`counter` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `layout_counters_industryKey` PRIMARY KEY(`industryKey`)
);
--> statement-breakpoint
ALTER TABLE `template_uploads` MODIFY COLUMN `industries` text;