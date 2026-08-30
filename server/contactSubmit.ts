import type { Express, Request, Response } from "express";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getWebsiteBySlug,
  getBusinessById,
  createContactSubmission,
  countRecentSubmissionsByIp,
  getOnboardingByWebsiteId,
} from "./db";
import { WebsiteDataV2Schema } from "../shared/siteContract/schema";
import {
  emailFooter,
  emailInfoPanel,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./_core/emailDesign";

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

/** HTML-Escaping für alle Nutzer-/Business-Eingaben, die in die Mail eingebettet werden. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOwnerNotificationHtml(input: {
  businessName: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  customFields?: Record<string, string>;
}): string {
  const businessName = esc(input.businessName);
  const name = esc(input.name);
  const email = esc(input.email);
  const phone = input.phone ? esc(input.phone) : undefined;
  const message = esc(input.message);
  const customRows = Object.entries(input.customFields ?? {})
    .filter(([, value]) => value.trim().length > 0)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#6d6c66;font-size:13px;">${esc(label)}</td><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#1d1a17;font-size:14px;">${esc(value)}</td></tr>`
    )
    .join("");
  const rows = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
      <tr><td style="width:30%;padding:10px 0;border-bottom:1px solid #e4e3de;color:#6d6c66;font-size:13px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#1d1a17;font-size:14px;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#6d6c66;font-size:13px;">E-Mail</td><td style="padding:10px 0;border-bottom:1px solid #e4e3de;"><a href="mailto:${email}" style="color:#4a6b00;font-size:14px;text-decoration:none;">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#6d6c66;font-size:13px;">Telefon</td><td style="padding:10px 0;border-bottom:1px solid #e4e3de;color:#1d1a17;font-size:14px;">${phone}</td></tr>` : ""}
      ${customRows}
    </table>`;
  return wrapPageblitzEmail({
    eyebrow: "Neue Kontaktanfrage",
    content: `
      <h1 style="color:#1d1a17;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 20px;">${businessName}</h1>
      ${rows}
      ${emailInfoPanel(
        "Nachricht",
        `<p style="margin:0;white-space:pre-wrap;">${message}</p>`
      )}
      ${emailPrimaryButton(
        "Direkt antworten",
        `mailto:${email}?subject=Re: Kontaktanfrage`
      )}
    `,
    footer: emailFooter({
      note: "Gesendet über das Pageblitz Kontaktformular",
    }),
  });
}

/**
 * Prüft, ob das Kontaktformular für diese Website aktiv ist. v2-Dokumente:
 * `features.contactForm === true` (vom Zahlungs-Webhook bzw. Studio
 * gespiegelt, siehe applyFeatures/routerCommerce.ts). v1-Websites haben kein
 * `features`-Feld im Dokument — dort ist `onboarding_responses.
 * addOnContactForm` die Quelle der Wahrheit (dieselbe, die die v1-Layouts
 * client-seitig für die Formular-Sperre lesen (v2: ContactFormIsland)
 * `websiteData?.addOnContactForm` bzw. CustomerDashboard.tsx).
 */
async function isContactFormEnabled(website: {
  id: number;
  websiteData: unknown;
}): Promise<boolean> {
  const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
  if (parsed.success) {
    return parsed.data.features?.contactForm === true;
  }
  const onboarding = await getOnboardingByWebsiteId(website.id);
  return onboarding?.addOnContactForm === true;
}

/**
 * Verarbeitet eine Kontaktformular-Einreichung: Honeypot-Check, Website-Lookup,
 * Add-on-Gate (Finding I3), IP-Rate-Limit (5/h), Speichern + Owner-
 * Benachrichtigung per Mail (nicht im Preview-Status, siehe unten).
 *
 * Wirft `TRPCError` mit `NOT_FOUND` (unbekannter Slug ODER Kontaktformular
 * nicht aktiv — bewusst derselbe Code, damit ein Angreifer per Response
 * nicht unterscheiden kann, ob der Slug existiert, aber das Add-on fehlt)
 * oder `TOO_MANY_REQUESTS` (Rate-Limit) — beide Aufrufer (tRPC-Prozedur,
 * Express-Route) mappen den Code auf ihr jeweiliges Fehlerformat.
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

  if (!(await isContactFormEnabled(website))) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Kontaktformular nicht aktiv",
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

  // Finding I3: im Preview-Status (noch nicht verkauft/aktiv, z. B. Studio-
  // Live-Vorschau oder Dev-Seed) wird die Einreichung zwar gespeichert, aber
  // KEINE Owner-Mail verschickt — es gibt noch keinen zahlenden Kunden, der
  // benachrichtigt werden sollte.
  const isPreview = (website as any).status === "preview";

  if (recipientEmail && !isPreview) {
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
        customFields: input.customFields,
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
  customFields: z.record(z.string(), z.string()).optional(),
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
      // Same-origin UND ein "echter" Pfad: `refUrl.pathname` beginnt bei einer
      // gültigen URL zwar immer mit "/", aber ein Referer wie
      // "https://<host>//evil.com/x" parst zu einem Pfad, der mit "//"
      // beginnt — das ist protokollrelativ und würde im redirect() als
      // Ziel auf einem FREMDEN Host interpretiert (Browser lesen
      // "//evil.com/x" als "https://evil.com/x"). Solche Pfade explizit
      // ablehnen, sonst Open-Redirect über einen gefälschten Referer.
      const isRealPath =
        refUrl.pathname.startsWith("/") && !refUrl.pathname.startsWith("//");
      if (refUrl.hostname === req.hostname && isRealPath) {
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
    const body = (req.body ?? {}) as Record<string, unknown>;
    const customFromNames = Object.fromEntries(
      Object.entries(body)
        .filter(
          ([key, value]) =>
            key.startsWith("custom-") && typeof value === "string"
        )
        .map(([key, value]) => [key.slice("custom-".length), String(value)])
    );
    const parsed = contactRouteSchema.safeParse({
      ...body,
      customFields:
        (body.customFields as Record<string, string> | undefined) ??
        (Object.keys(customFromNames).length > 0 ? customFromNames : undefined),
    });
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
