-- Plan B6 Task 2: Unterseiten-Add-on. `generated_websites.addOnSubpages`
-- spiegelt websiteData.features.subpages (server/onboardingV2/
-- applyFeatures.ts applyFeatureFlags), analog addOnAiChat/addOnBooking/
-- addOnTeam — schneller Live-Check ohne Dokument-Parse (server/ssr/routes.ts,
-- Task 3). Additiv, kein Backup/Rollback-Ritual nötig (anders als die
-- destruktiven Migrationen 0027/0028).

ALTER TABLE `generated_websites` ADD COLUMN `addOnSubpages` boolean DEFAULT false;
