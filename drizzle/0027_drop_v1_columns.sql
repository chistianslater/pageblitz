-- B4c: v1-Spalten/Tabellen entfernen (Plan 2026-08-23-onboarding-v2-b4c-polish.md Task 4)
-- Referenz-Check (Task-4-Report) bestaetigt: alle unten gedroppten Spalten
-- haben ausserhalb dieser Migration und der (bereits entfernten) v1-Schreib-
-- /Lesestellen keine Referenzen mehr in server/client/shared.
ALTER TABLE `generated_websites`
  DROP COLUMN `colorScheme`, DROP COLUMN `heroImageUrl`, DROP COLUMN `aboutImageUrl`,
  DROP COLUMN `layoutStyle`, DROP COLUMN `layoutVersion`,
  DROP COLUMN `contactFormFields`, DROP COLUMN `addOnTeamData`;
ALTER TABLE `onboarding_responses`
  DROP COLUMN `tagline`, DROP COLUMN `description`, DROP COLUMN `foundedYear`, DROP COLUMN `teamSize`,
  DROP COLUMN `usp`, DROP COLUMN `topServices`, DROP COLUMN `targetAudience`, DROP COLUMN `faqItems`,
  DROP COLUMN `logoUrl`, DROP COLUMN `heroPhotoUrl`, DROP COLUMN `aboutPhotoUrl`,
  DROP COLUMN `brandColor`, DROP COLUMN `brandSecondaryColor`, DROP COLUMN `sectionOrder`, DROP COLUMN `hiddenSections`,
  DROP COLUMN `colorScheme`, DROP COLUMN `contactFormFields`;
DROP TABLE IF EXISTS `template_uploads`;

-- Bewusst NICHT gedroppt (Behalten-Liste, Plan Global Constraints):
-- onboarding_responses.addOnTeamData (Team-Panel deferred nach B5),
-- alle addOn*-/legal*-/chat*-/photoUrls-/openingHours-/headlineFont-Felder,
-- onboarding_responses.businessName/businessCategory/studioProgress.
