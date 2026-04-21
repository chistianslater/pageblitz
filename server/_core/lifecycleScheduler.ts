import crypto from "crypto";
import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { getDb, deleteWebsite } from "../db";
import {
  generatedWebsites,
  lifecycleEmails,
  reactivationSeeds,
  users,
  onboardingResponses,
  businesses,
  type LifecycleEmail,
  type GeneratedWebsite,
} from "../../drizzle/schema";
import { ENV } from "./env";
import {
  sendLifecycleEmail,
  renderWelcomeLinkEmail,
  type LifecycleEmailType,
  type LifecycleEmailData,
  FIXED_OFFSETS,
  FINAL_WARNING_LEAD_MS,
  FRESH_START_DELAY_MS,
  INITIAL_RESERVATION_HOURS,
  EXTENSION_HOURS,
  MAX_EXTENSIONS,
} from "./lifecycleEmails";
import { sendEmail } from "./email";

const APP_BASE_URL = process.env.APP_BASE_URL || "https://pageblitz.de";

// ── HMAC-Token für 1-Klick-Links (Extend, Unsubscribe) ─────────────────────
// Der Token kodiert Action + websiteId + email und wird mit JWT_SECRET signiert.
// Format: base64url(action:websiteId:email:expiresAt).hmacHex

function signToken(payload: string): string {
  const secret = ENV.cookieSecret || "pageblitz-lifecycle-fallback-secret";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createLifecycleToken(
  action: "extend" | "unsubscribe",
  websiteId: number,
  email: string,
  validForMs = 30 * 24 * 60 * 60 * 1000, // 30 Tage
): string {
  const expiresAt = Date.now() + validForMs;
  const payload = `${action}:${websiteId}:${email}:${expiresAt}`;
  const sig = signToken(payload);
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sig}`;
}

export function verifyLifecycleToken(
  token: string,
): { action: "extend" | "unsubscribe"; websiteId: number; email: string } | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const payload = Buffer.from(encoded, "base64url").toString("utf8");
    const expected = signToken(payload);
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
    const [action, websiteIdStr, email, expiresAtStr] = payload.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);
    if (!isFinite(expiresAt) || Date.now() > expiresAt) return null;
    if (action !== "extend" && action !== "unsubscribe") return null;
    return { action, websiteId: parseInt(websiteIdStr, 10), email };
  } catch {
    return null;
  }
}

// ── URL-Builder ────────────────────────────────────────────────────────────
export function buildResumeLink(previewToken: string): string {
  return `${APP_BASE_URL}/preview/${previewToken}/onboarding`;
}

export function buildExtendLink(websiteId: number, email: string): string {
  const token = createLifecycleToken("extend", websiteId, email);
  return `${APP_BASE_URL}/api/lifecycle/extend?token=${encodeURIComponent(token)}`;
}

export function buildUnsubscribeLink(websiteId: number, email: string): string {
  const token = createLifecycleToken("unsubscribe", websiteId, email);
  return `${APP_BASE_URL}/api/lifecycle/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function buildWelcomeBackLink(seedToken: string): string {
  return `${APP_BASE_URL}/welcome-back?token=${encodeURIComponent(seedToken)}`;
}

// ── Sofortige Welcome-Link-Mail (transactional, nicht scheduled) ────────────
/**
 * Sendet unmittelbar nach Email-Capture eine kurze transactional Mail mit dem
 * persönlichen Link. Fire-and-forget – kein DB-Eintrag in lifecycle_emails.
 */
export async function sendImmediateWelcomeEmail(
  websiteId: number,
  email: string,
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const rows = await db
      .select()
      .from(generatedWebsites)
      .where(eq(generatedWebsites.id, websiteId))
      .limit(1);
    const website = rows[0];
    if (!website) return;

    // businessName aus onboarding oder businesses holen
    let businessName = "deine Website";
    const onboardingRows = await db
      .select()
      .from(onboardingResponses)
      .where(eq(onboardingResponses.websiteId, websiteId))
      .limit(1);
    if (onboardingRows[0]?.businessName) {
      businessName = onboardingRows[0].businessName;
    } else {
      const bizRows = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, website.businessId))
        .limit(1);
      // "Lead (E-Mail erfasst)" Platzhalter ausblenden
      if (bizRows[0]?.name && !bizRows[0].name.startsWith("Lead ")) {
        businessName = bizRows[0].name;
      }
    }

    let firstName: string | null = null;
    if (onboardingRows[0]?.legalOwner) {
      firstName = onboardingRows[0].legalOwner.trim().split(/\s+/)[0] || null;
    } else {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (userRows[0]?.name) {
        firstName = userRows[0].name.trim().split(/\s+/)[0] || null;
      }
    }

    const resumeLink = website.previewToken
      ? buildResumeLink(website.previewToken)
      : `${APP_BASE_URL}/preview/${website.id}/onboarding`;

    const data: LifecycleEmailData = {
      firstName,
      businessName,
      resumeLink,
      unsubscribeLink: buildUnsubscribeLink(websiteId, email),
    };

    const { subject, html, text } = renderWelcomeLinkEmail(data);
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
      from: "Christian von Pageblitz <christian@pageblitz.de>",
      replyTo: "christian@pageblitz.de",
    });
    if (result.success) {
      console.log(`[Lifecycle] Welcome-link email sent to ${email} (website ${websiteId})`);
    } else {
      console.warn(`[Lifecycle] Welcome-link send failed for website ${websiteId}: ${result.error}`);
    }
  } catch (err) {
    console.error(`[Lifecycle] sendImmediateWelcomeEmail error for website ${websiteId}:`, err);
  }
}

// ── Initial Scheduling bei Email-Capture ────────────────────────────────────
/**
 * Plant die initialen Lifecycle-Mails (reminder_2h, reminder_24h, reminder_final)
 * und setzt reservedUntil auf +48h. Idempotent – doppelte Aufrufe überschreiben nicht.
 */
export async function scheduleInitialLifecycleEmails(websiteId: number, email: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Lifecycle] DB unavailable, skipping scheduleInitialLifecycleEmails");
    return;
  }

  const existing = await db
    .select()
    .from(lifecycleEmails)
    .where(eq(lifecycleEmails.websiteId, websiteId));
  if (existing.length > 0) {
    console.log(`[Lifecycle] Website ${websiteId} already has scheduled emails, skipping`);
    return;
  }

  const now = Date.now();
  const reservedUntil = new Date(now + INITIAL_RESERVATION_HOURS * 60 * 60 * 1000);

  // Reservierung setzen
  await db
    .update(generatedWebsites)
    .set({ reservedUntil, extensionsUsed: 0 })
    .where(eq(generatedWebsites.id, websiteId));

  // Mails einplanen
  const toInsert = [
    { type: "reminder_2h" as LifecycleEmailType, scheduledFor: new Date(now + FIXED_OFFSETS.reminder_2h!) },
    { type: "reminder_24h" as LifecycleEmailType, scheduledFor: new Date(now + FIXED_OFFSETS.reminder_24h!) },
    { type: "reminder_final" as LifecycleEmailType, scheduledFor: new Date(reservedUntil.getTime() - FINAL_WARNING_LEAD_MS) },
  ];

  for (const row of toInsert) {
    try {
      await db.insert(lifecycleEmails).values({
        websiteId,
        recipientEmail: email,
        type: row.type,
        scheduledFor: row.scheduledFor,
        status: "scheduled",
      });
    } catch (err: any) {
      // Unique-Constraint-Kollision ignorieren (idempotent)
      if (!String(err?.message || "").includes("Duplicate")) {
        console.error(`[Lifecycle] Failed to schedule ${row.type} for website ${websiteId}:`, err);
      }
    }
  }

  console.log(`[Lifecycle] Scheduled initial emails for website ${websiteId} (${email})`);
}

/**
 * Cancelt alle noch scheduled Lifecycle-Mails einer Website.
 * Wird aufgerufen bei Stripe-Conversion, Unsubscribe oder Website-Löschung.
 */
export async function cancelLifecycleEmails(websiteId: number, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(lifecycleEmails)
    .set({ status: "cancelled", cancelReason: reason })
    .where(and(eq(lifecycleEmails.websiteId, websiteId), eq(lifecycleEmails.status, "scheduled")));
  console.log(`[Lifecycle] Cancelled scheduled emails for website ${websiteId} (reason: ${reason})`);
}

/**
 * Verlängert die Reservierung um EXTENSION_HOURS. Prüft MAX_EXTENSIONS.
 * Reschedules reminder_final auf 2h vor der neuen Deadline (wenn scheduled).
 * Returns: { success, newReservedUntil?, remainingExtensions?, error? }
 */
export async function extendReservation(websiteId: number): Promise<{
  success: boolean;
  newReservedUntil?: Date;
  remainingExtensions?: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { success: false, error: "DB nicht verfügbar" };

  const rows = await db
    .select()
    .from(generatedWebsites)
    .where(eq(generatedWebsites.id, websiteId))
    .limit(1);
  const website = rows[0];
  if (!website) return { success: false, error: "Website nicht gefunden" };
  if (website.captureStatus === "converted") {
    return { success: false, error: "Website wurde bereits freigeschaltet" };
  }
  if ((website.extensionsUsed ?? 0) >= MAX_EXTENSIONS) {
    return { success: false, error: "Maximale Anzahl Verlängerungen erreicht" };
  }

  const currentReservedUntil = website.reservedUntil
    ? website.reservedUntil.getTime()
    : Date.now() + INITIAL_RESERVATION_HOURS * 60 * 60 * 1000;
  // Wenn bereits abgelaufen: ab jetzt verlängern
  const base = Math.max(currentReservedUntil, Date.now());
  const newReservedUntil = new Date(base + EXTENSION_HOURS * 60 * 60 * 1000);
  const newExtensionsUsed = (website.extensionsUsed ?? 0) + 1;

  await db
    .update(generatedWebsites)
    .set({ reservedUntil: newReservedUntil, extensionsUsed: newExtensionsUsed })
    .where(eq(generatedWebsites.id, websiteId));

  // reminder_final neu planen (wenn noch scheduled) oder neu erstellen (wenn bereits sent)
  const finalRows = await db
    .select()
    .from(lifecycleEmails)
    .where(and(eq(lifecycleEmails.websiteId, websiteId), eq(lifecycleEmails.type, "reminder_final")));
  const finalRow = finalRows[0];
  const newFinalAt = new Date(newReservedUntil.getTime() - FINAL_WARNING_LEAD_MS);
  if (finalRow) {
    if (finalRow.status === "scheduled") {
      await db
        .update(lifecycleEmails)
        .set({ scheduledFor: newFinalAt })
        .where(eq(lifecycleEmails.id, finalRow.id));
    } else if (finalRow.status === "sent" || finalRow.status === "skipped") {
      // Bereits gesendet – reminder_final wird nicht nochmal verschickt.
      // Alternative: wir könnten eine zweite Warnung als "reminder_final_extended" bauen – für jetzt weggelassen.
    }
  }

  return { success: true, newReservedUntil, remainingExtensions: MAX_EXTENSIONS - newExtensionsUsed };
}

// ── Cron-Worker-Logik ──────────────────────────────────────────────────────

/**
 * Versendet alle fälligen Lifecycle-Mails. Vor dem Versand prüft er, ob die
 * Website bereits konvertiert/gelöscht wurde → dann skippen.
 */
export async function processPendingLifecycleEmails(): Promise<{
  processed: number;
  sent: number;
  skipped: number;
}> {
  const db = await getDb();
  if (!db) return { processed: 0, sent: 0, skipped: 0 };

  const now = new Date();
  const pending = await db
    .select()
    .from(lifecycleEmails)
    .where(and(eq(lifecycleEmails.status, "scheduled"), lte(lifecycleEmails.scheduledFor, now)))
    .limit(50);

  let sent = 0;
  let skipped = 0;

  for (const row of pending) {
    try {
      const websiteRows = await db
        .select()
        .from(generatedWebsites)
        .where(eq(generatedWebsites.id, row.websiteId))
        .limit(1);
      const website = websiteRows[0];

      // Website existiert nicht mehr (außer fresh_start_7d – die ist seed-basiert)
      if (!website && row.type !== "fresh_start_7d") {
        await db
          .update(lifecycleEmails)
          .set({ status: "skipped", cancelReason: "website_deleted" })
          .where(eq(lifecycleEmails.id, row.id));
        skipped++;
        continue;
      }

      // Konvertiert → skippen
      if (website?.captureStatus === "converted") {
        await db
          .update(lifecycleEmails)
          .set({ status: "skipped", cancelReason: "converted" })
          .where(eq(lifecycleEmails.id, row.id));
        skipped++;
        continue;
      }

      // Onboarding abgeschlossen + bezahlt → auch skippen
      if (website?.onboardingStatus === "completed" && website?.paidAt) {
        await db
          .update(lifecycleEmails)
          .set({ status: "skipped", cancelReason: "already_paid" })
          .where(eq(lifecycleEmails.id, row.id));
        skipped++;
        continue;
      }

      // Email rendern + versenden
      const data = await buildEmailData(row, website);
      if (!data) {
        await db
          .update(lifecycleEmails)
          .set({ status: "skipped", cancelReason: "no_data" })
          .where(eq(lifecycleEmails.id, row.id));
        skipped++;
        continue;
      }

      const result = await sendLifecycleEmail(row.type, row.recipientEmail, data);
      if (result.success) {
        await db
          .update(lifecycleEmails)
          .set({ status: "sent", sentAt: new Date(), resendEmailId: result.id })
          .where(eq(lifecycleEmails.id, row.id));
        sent++;
      } else {
        // Bei Fehler: scheduled lassen, aber cancelReason logs den Fehler (retry beim nächsten Tick)
        console.error(`[Lifecycle] Send failed for email ${row.id}: ${result.error}`);
      }
    } catch (err) {
      console.error(`[Lifecycle] Processing error for email ${row.id}:`, err);
    }
  }

  return { processed: pending.length, sent, skipped };
}

/**
 * Baut die LifecycleEmailData für eine zu versendende Mail.
 * Zieht firstName aus users/onboardingResponses wenn möglich.
 */
async function buildEmailData(
  row: LifecycleEmail,
  website: GeneratedWebsite | undefined,
): Promise<LifecycleEmailData | null> {
  const db = await getDb();
  if (!db) return null;

  // Für fresh_start_7d: Daten aus reactivation_seeds ziehen
  if (row.type === "fresh_start_7d") {
    const seedRows = await db
      .select()
      .from(reactivationSeeds)
      .where(eq(reactivationSeeds.recipientEmail, row.recipientEmail))
      .orderBy(sql`${reactivationSeeds.createdAt} DESC`)
      .limit(1);
    const seed = seedRows[0];
    if (!seed) return null;
    return {
      businessName: seed.businessName || "deine Website",
      resumeLink: buildWelcomeBackLink(seed.token),
      welcomeBackLink: buildWelcomeBackLink(seed.token),
      unsubscribeLink: buildUnsubscribeLink(seed.originalWebsiteId || 0, row.recipientEmail),
    };
  }

  if (!website) return null;

  // Business-Name: onboarding oder business (Platzhalter "Lead (E-Mail erfasst)" ausblenden)
  let businessName = "deine Website";
  const onboardingRows = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.websiteId, website.id))
    .limit(1);
  if (onboardingRows[0]?.businessName) {
    businessName = onboardingRows[0].businessName;
  } else {
    const bizRows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, website.businessId))
      .limit(1);
    if (bizRows[0]?.name && !bizRows[0].name.startsWith("Lead ")) {
      businessName = bizRows[0].name;
    }
  }

  // firstName: erster Vorname aus legalOwner oder user.name
  let firstName: string | null = null;
  const legalOwner = onboardingRows[0]?.legalOwner;
  if (legalOwner) {
    firstName = legalOwner.trim().split(/\s+/)[0] || null;
  } else if (website.customerEmail) {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, website.customerEmail))
      .limit(1);
    if (userRows[0]?.name) {
      firstName = userRows[0].name.trim().split(/\s+/)[0] || null;
    }
  }

  const resumeLink = website.previewToken
    ? buildResumeLink(website.previewToken)
    : `${APP_BASE_URL}/preview/${website.id}/onboarding`;

  // Extend-Link nur zeigen, wenn noch Extensions verfügbar
  const canExtend = (website.extensionsUsed ?? 0) < MAX_EXTENSIONS;
  const extendLink = canExtend ? buildExtendLink(website.id, row.recipientEmail) : undefined;

  return {
    firstName,
    businessName,
    resumeLink,
    extendLink,
    unsubscribeLink: buildUnsubscribeLink(website.id, row.recipientEmail),
    wasExtended: row.type === "reminder_final" && (website.extensionsUsed ?? 0) > 0,
  };
}

/**
 * Löscht abgelaufene Website-Entwürfe (reservedUntil < now, nicht konvertiert, externer Lead).
 * Erstellt reactivation_seed + plant fresh_start_7d ein.
 */
export async function processExpiredReservations(): Promise<{ processed: number; deleted: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, deleted: 0 };

  const now = new Date();
  const expired = await db
    .select()
    .from(generatedWebsites)
    .where(
      and(
        eq(generatedWebsites.source, "external"),
        lte(generatedWebsites.reservedUntil, now),
        sql`${generatedWebsites.captureStatus} != 'converted'`,
        sql`${generatedWebsites.paidAt} IS NULL`,
      ),
    )
    .limit(20);

  let deleted = 0;
  for (const website of expired) {
    try {
      // Seed + Email nur anlegen, wenn wir eine Email haben
      if (website.customerEmail) {
        const seedToken = crypto.randomBytes(24).toString("base64url");
        const onboardingRows = await db
          .select()
          .from(onboardingResponses)
          .where(eq(onboardingResponses.websiteId, website.id))
          .limit(1);
        const onboarding = onboardingRows[0];
        const bizRows = await db
          .select()
          .from(businesses)
          .where(eq(businesses.id, website.businessId))
          .limit(1);
        const business = bizRows[0];

        await db.insert(reactivationSeeds).values({
          token: seedToken,
          recipientEmail: website.customerEmail,
          businessName: onboarding?.businessName || business?.name || null,
          businessCategory: onboarding?.businessCategory || business?.category || null,
          googlePlaceId: business?.placeId || null,
          originalWebsiteId: website.id,
          originalBusinessId: business?.id || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        // fresh_start_7d einplanen (7 Tage nach Löschung)
        await db.insert(lifecycleEmails).values({
          websiteId: website.id,
          recipientEmail: website.customerEmail,
          type: "fresh_start_7d",
          scheduledFor: new Date(Date.now() + FRESH_START_DELAY_MS),
          status: "scheduled",
        });
      }

      // Noch nicht abgelaufene lifecycle_emails canceln (vor Löschung)
      await cancelLifecycleEmails(website.id, "website_expired");

      // captureStatus auf 'abandoned' setzen, dann löschen
      await db
        .update(generatedWebsites)
        .set({ captureStatus: "abandoned" })
        .where(eq(generatedWebsites.id, website.id));

      await deleteWebsite(website.id);
      deleted++;
      console.log(`[Lifecycle] Expired website ${website.id} deleted (${website.customerEmail})`);
    } catch (err) {
      console.error(`[Lifecycle] Failed to expire website ${website.id}:`, err);
    }
  }

  return { processed: expired.length, deleted };
}

// ── Unsubscribe-Handler ─────────────────────────────────────────────────────
/**
 * Cancelt alle scheduled Lifecycle-Mails an eine bestimmte Email-Adresse
 * (nicht nur für eine Website – Unsubscribe gilt global).
 */
export async function unsubscribeEmail(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(lifecycleEmails)
    .set({ status: "cancelled", cancelReason: "unsubscribed" })
    .where(and(eq(lifecycleEmails.recipientEmail, email), eq(lifecycleEmails.status, "scheduled")));
  console.log(`[Lifecycle] Unsubscribed ${email}`);
}
