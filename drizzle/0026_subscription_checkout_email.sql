-- Finding I1: unveränderliche Checkout-E-Mail am Abo (statt am frei
-- schreibbaren generated_websites.customerEmail) für den Orphan-Claim.
-- Vom Webhook (handleCheckoutCompleted) EINMALIG beim Checkout gesetzt.

ALTER TABLE `subscriptions` ADD `checkoutEmail` varchar(320);
