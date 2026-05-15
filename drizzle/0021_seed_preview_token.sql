-- reactivation_seeds: previewToken der gelöschten Website speichern.
-- Damit können alte Email-Links (/preview/:token/onboarding) nach der
-- Löschung auf die Welcome-Back-Seite umgeleitet werden.

ALTER TABLE `reactivation_seeds`
  ADD `originalPreviewToken` varchar(100);
