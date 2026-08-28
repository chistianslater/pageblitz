-- Studio-/Signup-Funnel: ein Row pro (sessionKey, step). sessionKey ist
-- sha256(Preview-Token) oder ein anonymes 64-Hex vom Client — kein PII.
-- websiteId ist optional (Landing vor der Website) und hat keinen FK,
-- damit Events die Preview-Löschung überleben.

CREATE TABLE `studio_funnel_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `websiteId` int,
  `sessionKey` varchar(64) NOT NULL,
  `step` varchar(40) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `studio_funnel_events_id` PRIMARY KEY(`id`),
  CONSTRAINT `studio_funnel_session_step` UNIQUE(`sessionKey`,`step`)
);

CREATE INDEX `studio_funnel_website` ON `studio_funnel_events` (`websiteId`);
CREATE INDEX `studio_funnel_step` ON `studio_funnel_events` (`step`);
