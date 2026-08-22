-- Onboarding v2 (Studio): Bestätigungs-Flags, die sich nicht aus dem Dokument
-- ableiten lassen — { styleConfirmed?, textsReviewed?, addonsReviewed? }.
-- Alles andere (Fotos/Angebot/Rechtliches) wird aus websiteData bzw. den
-- legal*-Spalten abgeleitet (shared/onboardingV2/checklist.ts).

ALTER TABLE `onboarding_responses` ADD `studioProgress` json;
