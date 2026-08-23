-- B5 Task 1: Team-Add-on buchbar — Inhalt lebt jetzt als Sektion `team` im
-- v2-Dokument (websiteData.sections, server/onboardingV2/applyPatch.ts
-- applyTeam), nicht mehr in dieser Spalte. Referenz-Check bestaetigt keine
-- verbleibenden Lese-/Schreibstellen in server/client/shared (grep -rn
-- addOnTeamData client server shared → 0). generated_websites.addOnTeamData
-- wurde bereits in 0027 gedroppt; diese Migration erledigt die verbliebene
-- Spalte auf onboarding_responses (siehe 0027-Kommentar "Bewusst NICHT
-- gedroppt … Team-Panel deferred nach B5" — B5 ist jetzt umgesetzt).
ALTER TABLE `onboarding_responses`
  DROP COLUMN `addOnTeamData`;
