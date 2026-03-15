-- Add opening hours support to manual onboarding
ALTER TABLE `onboarding_responses` ADD `openingHours` json;
