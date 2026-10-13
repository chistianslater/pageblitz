-- AGB (Fassung 2026-10-13): das Pflicht-Häkchen im Studio bestätigt jetzt
-- B2B (§ 14 BGB) UND die AGB. Gespeichert wird die akzeptierte Fassung
-- (shared/agb.ts AGB_VERSION, Stripe-Metadatum `agb_version`); der Zeitpunkt
-- der Zustimmung steht bereits in `b2bConfirmedAt` (Migration 0040).
--
-- Bestandszeilen bleiben NULL (vor den AGB abgeschlossen).
ALTER TABLE `subscriptions`
  ADD COLUMN `agbVersion` varchar(32) NULL AFTER `b2bConfirmedAt`;
