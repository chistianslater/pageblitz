import type { Express, Request, Response } from "express";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getWebsiteBySlug,
  getBusinessById,
  createContactSubmission,
  countRecentSubmissionsByIp,
} from "./db";

// ── Gemeinsame Logik: tRPC (`contact.submit`) + REST (`/api/site/:slug/contact`) ──
//
// Extrahiert aus `contact.submit` (server/routers.ts), damit No-JS-Kunden das
// Formular auch ohne den tRPC-Client absenden können (Plan B3, Task 7).

export interface ContactSubmitInput {
  slug: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  customFields?: Record<string, string>;
  /** Honeypot: von Bots ausgefüllt, bei echten Nutzer:innen immer leer. */
  website_url?: string;
  ip: string;
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_PER_HOUR = 5;

function buildOwnerNotificationHtml(input: {
  businessName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}): string {
  const { businessName, name, email, phone, message } = input;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #18181b; padding: 28px 32px;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.08em;">Neue Kontaktanfrage</p>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0;">${businessName}</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px; width: 30%;">Name</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #18181b; font-size: 14px; font-weight: 500;">${name}</td></tr>
        <tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px;">E-Mail</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}" style="color: #6366f1; font-size: 14px; text-decoration: none;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #71717a; font-size: 13px;">Telefon</td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #18181b; font-size: 14px;">${phone}</td></tr>` : ""}
      </table>
      <div style="margin-top: 24px; background: #f9f9f9; border-radius: 8px; padding: 20px;">
        <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.06em;">Nachricht</p>
        <p style="color: #18181b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </div>
      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${email}?subject=Re: Kontaktanfrage" style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 8px;">Direkt antworten</a>
      </div>
    </div>
    <div style="padding: 20px 32px; border-top: 1px solid #f0f0f0; text-align: center;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">Gesendet via <a href="https://pageblitz.de" style="color: #6366f1; text-decoration: none;">pageblitz.de</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Verarbeitet eine Kontaktformular-Einreichung: Honeypot-Check, Website-Lookup,
 * IP-Rate-Limit (5/h), Speichern + Owner-Benachrichtigung per Mail.
 *
 * Wirft `TRPCError` mit `NOT_FOUND` (unbekannter Slug) oder
 * `TOO_MANY_REQUESTS` (Rate-Limit) — beide Aufrufer (tRPC-Prozedur, Express-
 * Route) mappen den Code auf ihr jeweiliges Fehlerformat.
 */
export async function submitContactRequest(
  input: ContactSubmitInput
): Promise<{ ok: true }> {
  // Honeypot-Feld — Bots füllen es aus, echte Nutzer:innen nie. Kein Fehler
  // an den Absender, um Bots nicht auf die Prüfung hinzuweisen.
  if (input.website_url && input.website_url.length > 0) {
    return { ok: true };
  }

  const website = await getWebsiteBySlug(input.slug);
  if (!website) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Website nicht gefunden",
    });
  }

  const recentCount = await countRecentSubmissionsByIp(
    input.ip,
    RATE_LIMIT_WINDOW_MS
  );
  if (recentCount >= RATE_LIMIT_MAX_PER_HOUR) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Zu viele Anfragen. Bitte versuche es später erneut.",
    });
  }

  await createContactSubmission({
    websiteId: website.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    customFields: input.customFields ?? {},
    ipAddress: input.ip,
  });

  const business = website.businessId
    ? await getBusinessById(website.businessId)
    : null;
  // contactEmail auf der Website überschreibt business.email
  const recipientEmail = (website as any).contactEmail || business?.email;

  if (recipientEmail) {
    const { sendEmail } = await import("./_core/email");
    const businessName = business?.name ?? website.slug;
    await sendEmail({
      to: recipientEmail,
      from: `Pageblitz Kontaktformular <kontakt@pageblitz.de>`,
      replyTo: input.email, // Business owner hits "Reply" → antwort geht direkt an Besucher
      subject: `Neue Kontaktanfrage – ${businessName}`,
      html: buildOwnerNotificationHtml({
        businessName,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
      }),
    }).catch(() => {
      /* non-critical */
    });
  }

  return { ok: true };
}

// ── Express-Endpunkt: POST /api/site/:slug/contact ─────────────────────────
//
// No-JS-Fallback für `ContactFormIsland`: akzeptiert JSON (fetch-Hydration)
// UND `application/x-www-form-urlencoded` (echter Formular-POST ohne JS).
// `express.json()`/`express.urlencoded()` sind bereits global registriert
// (server/_core/index.ts), daher genügt hier reines Body-Auslesen.

const contactRouteSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional(),
  message: z.string().min(1).max(5000),
  website_url: z.string().max(0).optional(),
});

const INVALID_INPUT_MESSAGE =
  "Eingaben ungültig. Bitte prüfe deine Angaben und versuche es erneut.";
const UNKNOWN_ERROR_MESSAGE =
  "Etwas ist schiefgelaufen. Bitte versuche es später erneut.";

/** True, wenn der Client eine JSON-Antwort erwartet (Insel-Fetch statt echtem Formular-POST). */
function wantsJsonResponse(req: Request): boolean {
  const contentType = String(req.headers["content-type"] ?? "");
  if (contentType.includes("application/x-www-form-urlencoded")) return false;
  if (contentType.includes("application/json")) return true;
  const accept = String(req.headers.accept ?? "");
  return accept.includes("application/json");
}

/** Client-IP aus Express (trust proxy ist gesetzt) mit Fallback auf X-Forwarded-For. */
function readClientIp(req: Request): string {
  return (
    req.ip ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Ziel-URL für den No-JS-Redirect: der `Referer`-Pfad (nur same-origin, sonst
 * Fallback "/"), plus `?kontakt=<status>` und dem `#kontakt`-Hash, damit die
 * Seite direkt bei der Formular-Sektion landet.
 */
function buildFormRedirectLocation(
  req: Request,
  status: "gesendet" | "fehler"
): string {
  let pathname = "/";
  const referer = req.headers.referer;
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.hostname === req.hostname) {
        pathname = refUrl.pathname || "/";
      }
    } catch {
      // Ungültiger Referer → Fallback "/"
    }
  }
  return `${pathname}?kontakt=${status}#kontakt`;
}

function respondSuccess(req: Request, res: Response): void {
  if (wantsJsonResponse(req)) {
    res.json({ ok: true });
    return;
  }
  res.redirect(303, buildFormRedirectLocation(req, "gesendet"));
}

function respondError(
  req: Request,
  res: Response,
  status: number,
  message: string
): void {
  if (wantsJsonResponse(req)) {
    res.status(status).json({ ok: false, error: message });
    return;
  }
  res.redirect(303, buildFormRedirectLocation(req, "fehler"));
}

function statusForTrpcCode(code: string): number {
  if (code === "NOT_FOUND") return 404;
  if (code === "TOO_MANY_REQUESTS") return 429;
  return 500;
}

export function registerContactRoutes(app: Express): void {
  app.post("/api/site/:slug/contact", async (req: Request, res: Response) => {
    const parsed = contactRouteSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      respondError(req, res, 400, INVALID_INPUT_MESSAGE);
      return;
    }

    try {
      await submitContactRequest({
        slug: req.params.slug,
        ...parsed.data,
        ip: readClientIp(req),
      });
      respondSuccess(req, res);
    } catch (err) {
      if (err instanceof TRPCError) {
        respondError(req, res, statusForTrpcCode(err.code), err.message);
        return;
      }
      console.error("[contactRoutes] Fehler:", err);
      respondError(req, res, 500, UNKNOWN_ERROR_MESSAGE);
    }
  });
}
