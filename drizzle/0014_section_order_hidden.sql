-- Add section order and hidden sections support to onboarding_responses
ALTER TABLE `onboarding_responses` ADD COLUMN `sectionOrder` json DEFAULT NULL;
ALTER TABLE `onboarding_responses` ADD COLUMN `hiddenSections` json DEFAULT NULL;
