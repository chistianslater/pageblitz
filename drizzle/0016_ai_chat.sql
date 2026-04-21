-- AI Chat Add-on: neue Felder in generated_websites + chat_leads Tabelle

ALTER TABLE `generated_websites`
  ADD COLUMN `addOnAiChat` boolean NOT NULL DEFAULT false,
  ADD COLUMN `addOnCalendly` boolean NOT NULL DEFAULT false,
  ADD COLUMN `calendlyUrl` varchar(512),
  ADD COLUMN `chatWelcomeMessage` varchar(512),
  ADD COLUMN `chatUsageCount` int NOT NULL DEFAULT 0,
  ADD COLUMN `chatUsageResetAt` timestamp;

CREATE TABLE IF NOT EXISTS `chat_leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `websiteId` int NOT NULL,
  `sessionId` varchar(128) NOT NULL,
  `visitorName` varchar(255),
  `email` varchar(320),
  `phone` varchar(50),
  `summary` text,
  `notifiedAt` timestamp,
  `readAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `chat_leads_websiteId_idx` (`websiteId`)
);
