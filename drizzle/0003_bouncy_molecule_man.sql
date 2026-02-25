CREATE TABLE `template_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`layoutPool` varchar(50) NOT NULL,
	`imageUrl` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_uploads_id` PRIMARY KEY(`id`)
);
