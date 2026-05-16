import type { Express, Request, Response } from "express";
import { getDb } from "../db";
import {
  generatedWebsites,
  appointmentSettings,
  appointments,
  businesses,
  users,
  subscriptions,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "./email";

// ── Types ────────────────────────────────────────────────────────────────────
interface DaySchedule {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

interface WeeklySchedule {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
}

const DAY_KEYS: (keyof WeeklySchedule)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const DEFAULT_SCHEDULE: WeeklySchedule = {
  mon: { enabled: true,  start: "09:00", end: "17:00" },
  tue: { enabled: true,  start: "09:00", end: "17:00" },
  wed: { enabled: true,  start: "09:00", end: "17:00" },
  thu: { enabled: true,  start: "09:00", end: "17:00" },
  fri: { enabled: true,  start: "09:00", end: "17:00" },
  sat: { enabled: false, start: "09:00", end: "12:00" },
  sun: { enabled: false, start: "09:00", end: "12:00" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function generateSlots(
  start: string,
  end: string,
  durationMinutes: number,
  bufferMinutes: number
): string[] {
  const slots: string[] = [];
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const step = durationMinutes + bufferMinutes;
  for (let cur = startMin; cur + durationMinutes <= endMin; cur += step) {
    slots.push(minutesToTime(cur));
  }
  return slots;
}

function dateToYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nanoid16(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 16; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function getOwnerEmail(websiteId: number): Promise<{ email: string | null; businessName: string }> {
  const db = await getDb();
  if (!db) return { email: null, businessName: "" };
  try {
    const [row] = await db
      .select({ email: users.email, businessName: businesses.name })
      .from(generatedWebsites)
      .innerJoin(subscriptions, eq(subscriptions.id, generatedWebsites.subscriptionId as any))
      .innerJoin(users, eq(users.id, subscriptions.userId as any))
      .innerJoin(businesses, eq(businesses.id, generatedWebsites.businessId as any))
      .where(eq(generatedWebsites.id, websiteId))
      .limit(1);
    return { email: row?.email ?? null, businessName: row?.businessName ?? "" };
  } catch {
    return { email: null, businessName: "" };
  }
}

function formatDateDE(dateStr: string): string {
  // dateStr = "2026-04-14" → "Dienstag, 14. April 2026"
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Route Registration ───────────────────────────────────────────────────────
export function registerBookingRoutes(app: Express) {
  // GET /api/booking/:slug/settings  – public: returns title, duration, advance days
  app.get("/api/booking/:slug/settings", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "db_unavailable" });

      const [website] = await db
        .select()
        .from(generatedWebsites)
        .where(eq(generatedWebsites.slug, req.params.slug))
        .limit(1);

      if (!website?.addOnBooking) return res.status(404).json({ error: "not_available" });

      const [settings] = await db
        .select()
        .from(appointmentSettings)
        .where(eq(appointmentSettings.websiteId, website.id))
        .limit(1);

      const schedule = (settings?.weeklySchedule as WeeklySchedule) ?? DEFAULT_SCHEDULE;

      return res.json({
        title: settings?.title ?? "Terminbuchung",
        description: settings?.description ?? null,
        durationMinutes: settings?.durationMinutes ?? 30,
        advanceDays: settings?.advanceDays ?? 30,
        schedule,
      });
    } catch (err) {
      console.error("[booking/settings]", err);
      return res.status(500).json({ error: "internal" });
    }
  });

  // GET /api/booking/:slug/slots?date=YYYY-MM-DD  – public: returns available slots
  app.get("/api/booking/:slug/slots", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "db_unavailable" });

      const dateStr = req.query.date as string;
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return res.status(400).json({ error: "invalid_date" });
      }

      const [website] = await db
        .select()
        .from(generatedWebsites)
        .where(eq(generatedWebsites.slug, req.params.slug))
        .limit(1);

      if (!website?.addOnBooking) return res.status(404).json({ error: "not_available" });

      const [settings] = await db
        .select()
        .from(appointmentSettings)
        .where(eq(appointmentSettings.websiteId, website.id))
        .limit(1);

      const schedule = (settings?.weeklySchedule as WeeklySchedule) ?? DEFAULT_SCHEDULE;
      const duration = settings?.durationMinutes ?? 30;
      const buffer = settings?.bufferMinutes ?? 0;
      const advance = settings?.advanceDays ?? 30;

      // Check date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const requestedDate = new Date(dateStr + "T00:00:00");
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + advance);

      if (requestedDate < today || requestedDate > maxDate) {
        return res.json({ slots: [] });
      }

      // Check if this day of week is enabled
      const dayKey = DAY_KEYS[requestedDate.getDay()];
      const daySchedule = schedule[dayKey];
      if (!daySchedule?.enabled) {
        return res.json({ slots: [] });
      }

      // Generate all slots
      const allSlots = generateSlots(daySchedule.start, daySchedule.end, duration, buffer);

      // Load already booked slots for this date
      const bookedRows = await db
        .select({ appointmentTime: appointments.appointmentTime })
        .from(appointments)
        .where(
          and(
            eq(appointments.websiteId, website.id),
            eq(appointments.appointmentDate, dateStr),
            // Only count pending/confirmed, not cancelled
          )
        );

      const bookedTimes = new Set(
        bookedRows
          .filter((r) => r.appointmentTime)
          .map((r) => r.appointmentTime)
      );

      // Filter booked + past slots (if today, filter slots in the past)
      const now = new Date();
      const isToday = dateToYMD(now) === dateStr;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const availableSlots = allSlots.filter((slot) => {
        if (bookedTimes.has(slot)) return false;
        if (isToday && timeToMinutes(slot) <= currentMinutes + 30) return false; // 30min buffer
        return true;
      });

      return res.json({ slots: availableSlots });
    } catch (err) {
      console.error("[booking/slots]", err);
      return res.status(500).json({ error: "internal" });
    }
  });

  // POST /api/booking/:slug/book  – public: create appointment
  app.post("/api/booking/:slug/book", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "db_unavailable" });

      const { name, email, phone, message, date, time } = req.body as {
        name: string;
        email: string;
        phone?: string;
        message?: string;
        date: string;
        time: string;
      };

      if (!name || !email || !date || !time) {
        return res.status(400).json({ error: "missing_fields" });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: "invalid_format" });
      }

      const [website] = await db
        .select()
        .from(generatedWebsites)
        .where(eq(generatedWebsites.slug, req.params.slug))
        .limit(1);

      if (!website?.addOnBooking) return res.status(404).json({ error: "not_available" });

      // Check slot is still free (race condition guard)
      const [existing] = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.websiteId, website.id),
            eq(appointments.appointmentDate, date),
            eq(appointments.appointmentTime, time)
          )
        )
        .limit(1);

      if (existing) {
        return res.status(409).json({ error: "slot_taken", message: "Dieser Termin ist leider bereits vergeben." });
      }

      const cancelToken = nanoid16();

      const [inserted] = await db.insert(appointments).values({
        websiteId: website.id,
        visitorName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        appointmentDate: date,
        appointmentTime: time,
        status: "pending",
        cancelToken,
      }).$returningId();

      if (!inserted) return res.status(500).json({ error: "insert_failed" });

      // Get settings for notification
      const [settings] = await db
        .select({ title: appointmentSettings.title, notificationEmail: appointmentSettings.notificationEmail })
        .from(appointmentSettings)
        .where(eq(appointmentSettings.websiteId, website.id))
        .limit(1);

      const appointmentTitle = settings?.title ?? "Terminbuchung";
      const formattedDate = formatDateDE(date);
      const cancelUrl = `${process.env.BASE_URL || "https://pageblitz.de"}/api/booking/${req.params.slug}/cancel/${cancelToken}`;

      // Send confirmation to visitor (non-blocking)
      sendEmail({
        to: email.trim().toLowerCase(),
        subject: `✅ Terminbestätigung: ${appointmentTitle} am ${formattedDate}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#1e293b;margin-bottom:4px">Dein Termin ist bestätigt!</h2>
            <p style="color:#64748b;margin-top:0">Hallo ${name}, dein Termin wurde erfolgreich gebucht.</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
              <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1e293b">${appointmentTitle}</p>
              <p style="margin:0 0 4px;color:#475569">📅 ${formattedDate}</p>
              <p style="margin:0;color:#475569">🕐 ${time} Uhr</p>
            </div>
            <p style="color:#64748b;font-size:14px">Falls du den Termin nicht wahrnehmen kannst, kannst du ihn <a href="${cancelUrl}" style="color:#ef4444">hier absagen</a>.</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:32px">Diese Bestätigung wurde automatisch gesendet.</p>
          </div>`,
      }).catch(() => {});

      // Notify owner (non-blocking)
      getOwnerEmail(website.id).then(({ email: ownerEmail, businessName }) => {
        const notifyTo = settings?.notificationEmail || ownerEmail;
        if (!notifyTo) return;
        sendEmail({
          to: notifyTo,
          subject: `📅 Neuer Termin: ${name} – ${formattedDate} ${time} Uhr`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <h2 style="color:#1e293b;margin-bottom:4px">Neuer Termin gebucht!</h2>
              <p style="color:#64748b;margin-top:0">Auf deiner Website "${businessName}" wurde ein neuer Termin gebucht.</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
                <p style="margin:0 0 8px"><strong>Leistung:</strong> ${appointmentTitle}</p>
                <p style="margin:0 0 8px"><strong>Datum:</strong> ${formattedDate}, ${time} Uhr</p>
                <p style="margin:0 0 8px"><strong>Name:</strong> ${name}</p>
                <p style="margin:0 0 8px"><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
                ${phone ? `<p style="margin:0 0 8px"><strong>Telefon:</strong> ${phone}</p>` : ""}
                ${message ? `<p style="margin:0"><strong>Nachricht:</strong> ${message}</p>` : ""}
              </div>
              <p style="color:#94a3b8;font-size:12px;margin-top:32px">Gesendet von Pageblitz · <a href="https://pageblitz.de/my-website" style="color:#6366f1">Alle Termine ansehen</a></p>
            </div>`,
        }).catch(() => {});

        // Mark as notified
        db.update(appointments).set({ notifiedAt: new Date() }).where(eq(appointments.id, inserted.id)).catch(() => {});
      }).catch(() => {});

      return res.json({ success: true, cancelToken });
    } catch (err) {
      console.error("[booking/book]", err);
      return res.status(500).json({ error: "internal" });
    }
  });

  // GET /api/booking/:slug/cancel/:token  – public: cancel appointment (link from email)
  app.get("/api/booking/:slug/cancel/:token", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) return res.status(503).send("Datenbankfehler.");

      const [appt] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.cancelToken, req.params.token))
        .limit(1);

      if (!appt) {
        return res.send(`<html><body style="font-family:system-ui;text-align:center;padding:60px">
          <h2>Termin nicht gefunden</h2><p>Dieser Link ist ungültig oder bereits verwendet.</p>
        </body></html>`);
      }

      if (appt.status === "cancelled") {
        return res.send(`<html><body style="font-family:system-ui;text-align:center;padding:60px">
          <h2>Termin bereits abgesagt</h2><p>Dieser Termin wurde bereits storniert.</p>
        </body></html>`);
      }

      await db
        .update(appointments)
        .set({ status: "cancelled" })
        .where(eq(appointments.cancelToken, req.params.token));

      return res.send(`<html><body style="font-family:system-ui;text-align:center;padding:60px;color:#1e293b">
        <div style="max-width:400px;margin:0 auto">
          <div style="font-size:48px;margin-bottom:16px">✅</div>
          <h2 style="margin-bottom:8px">Termin abgesagt</h2>
          <p style="color:#64748b">Dein Termin am ${formatDateDE(appt.appointmentDate)} um ${appt.appointmentTime} Uhr wurde erfolgreich storniert.</p>
          <p style="color:#64748b;font-size:14px;margin-top:24px">Möchtest du einen neuen Termin buchen? Besuche einfach die Website.</p>
        </div>
      </body></html>`);
    } catch (err) {
      console.error("[booking/cancel]", err);
      return res.status(500).send("Fehler beim Stornieren.");
    }
  });
}
