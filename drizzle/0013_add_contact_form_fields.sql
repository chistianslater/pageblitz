-- Add contact form fields configuration to onboarding_responses and generated_websites

ALTER TABLE `onboarding_responses` ADD COLUMN `contactFormFields` json DEFAULT NULL;
ALTER TABLE `generated_websites` ADD COLUMN `contactFormFields` json DEFAULT NULL;
