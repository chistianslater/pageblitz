-- Terminbuchungs-Add-on

ALTER TABLE `generated_websites`
  ADD COLUMN `addOnBooking` boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS `appointment_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `websiteId` int NOT NULL UNIQUE,
  `weeklySchedule` json NOT NULL,
  `durationMinutes` int NOT NULL DEFAULT 30,
  `bufferMinutes` int NOT NULL DEFAULT 0,
  `advanceDays` int NOT NULL DEFAULT 30,
  `title` varchar(255) DEFAULT 'Terminbuchung',
  `description` text,
  `notificationEmail` varchar(320),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_settings_websiteId_idx` (`websiteId`)
);

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `websiteId` int NOT NULL,
  `visitorName` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50),
  `message` text,
  `appointmentDate` varchar(10) NOT NULL,
  `appointmentTime` varchar(5) NOT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `cancelToken` varchar(32) NOT NULL UNIQUE,
  `notifiedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointments_websiteId_date_idx` (`websiteId`, `appointmentDate`)
);
