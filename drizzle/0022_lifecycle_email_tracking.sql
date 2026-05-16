-- Lifecycle-Mails: Engagement-Tracking (Open + Click via Resend-Webhook)

ALTER TABLE `lifecycle_emails` ADD `openedAt` timestamp;
ALTER TABLE `lifecycle_emails` ADD `clickedAt` timestamp;

-- Index für Webhook-Lookup (Resend liefert nur die email_id)
CREATE INDEX `lifecycle_emails_resend_id` ON `lifecycle_emails` (`resendEmailId`);
