-- Preismodell 2026-10-13: Jahrestarif mit 12 Monaten Mindestlaufzeit.
-- Alle Spalten in Unix-SEKUNDEN (wie currentPeriodEnd / Stripe), Logik in
-- shared/pricingTerm.ts, Pflege durch server/subscriptionTerm.ts.
--
--   termStartedAt      erste Zahlung nach den Testtagen = Anker der
--                      12-Monats-Laufzeiten (NULL = noch nicht begonnen,
--                      Monatstarif oder Testphase)
--   currentTermEnd     Ende der laufenden 12 Monate (invoice.paid rollt es)
--   cancelRequestedAt  Zeitpunkt der Kündigung (Konto oder Stripe-Portal)
--   cancelEffectiveAt  Zeitpunkt, zu dem das Abo endet (= Stripe cancel_at)
--   billingAnchorAt    Stripe billing_cycle_anchor; Laufzeitenden zählen von
--                      hier, damit cancel_at auf einer Periodengrenze liegt
--   b2bConfirmedAt     Checkout-Bestätigung „bestelle als Unternehmer
--                      (§ 14 BGB)" (Stripe-Metadatum b2b_bestaetigt_at)
--
-- Bestandszeilen: es gibt keine zahlenden Kunden. Alle neuen Spalten bleiben
-- NULL — ein laufendes Jahres-Abo bekommt seinen Laufzeitbeginn mit der
-- nächsten bezahlten Rechnung (Webhook invoice.paid). `billingInterval`
-- bleibt die Tarif-Spalte (monthly/yearly).
ALTER TABLE `subscriptions`
  ADD COLUMN `termStartedAt` bigint NULL AFTER `currentPeriodEnd`,
  ADD COLUMN `currentTermEnd` bigint NULL AFTER `termStartedAt`,
  ADD COLUMN `cancelRequestedAt` bigint NULL AFTER `currentTermEnd`,
  ADD COLUMN `cancelEffectiveAt` bigint NULL AFTER `cancelRequestedAt`,
  ADD COLUMN `billingAnchorAt` bigint NULL AFTER `cancelEffectiveAt`,
  ADD COLUMN `b2bConfirmedAt` bigint NULL AFTER `billingAnchorAt`;
