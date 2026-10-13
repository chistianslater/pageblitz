/**
 * Öffentliche Kontaktadresse von Pageblitz (Impressum, AGB, Fußzeilen,
 * JSON-LD, Support-Hinweise). Einzige Quelle — server/contactEmail.test.ts
 * schlägt bei abweichenden Adressen an. Absender-Adressen von Mails
 * (christian@, noreply@, kontakt@) sind davon getrennt.
 */
export const CONTACT_EMAIL = "hello@pageblitz.de";
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
