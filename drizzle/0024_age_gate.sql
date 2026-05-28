-- FSK-18 / Age-Gate: Flag auf generated_websites.
-- Wird automatisch gesetzt, wenn die Branche Adult/Alkohol/Glücksspiel ist,
-- kann im Admin manuell überschrieben werden.

ALTER TABLE `generated_websites` ADD `requiresAgeGate` boolean DEFAULT false;
