import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { SignJWT } from "jose";
import { sendMagicLinkEmail } from "./email";

const APP_URL = process.env.APP_URL || "https://pageblitz.de";

/**
 * Create JWT session token – same pattern as googleAuth.ts
 */
async function createSessionToken(openId: string, name: string, email: string): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);

  return new SignJWT({
    openId,
    appId: ENV.appId || "pageblitz",
    name,
    email,
    provider: "magic",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export function registerMagicLinkAuthRoutes(app: Express) {
  /**
   * POST /api/auth/magic-link
   * Erzeugt einen Token und sendet die Login-E-Mail.
   * Antwortet immer mit { success: true } (kein User-Enumeration).
   */
  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    const { email, redirect } = req.body as { email?: string; redirect?: string };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "Ungültige E-Mail-Adresse" });
      return;
    }

    const redirectUrl = (typeof redirect === "string" && redirect.startsWith("/"))
      ? redirect
      : "/my-website";

    try {
      // Rate-Limit: max 3 Tokens pro E-Mail in 15 Minuten
      const recent = await db.countRecentMagicLinksByEmail(email.toLowerCase().trim());
      if (recent >= 3) {
        // Trotzdem 200 zurückgeben – kein Hinweis auf Rate-Limit nach außen
        res.json({ success: true });
        return;
      }

      // Token erstellen + E-Mail senden
      const token = await db.createMagicLinkToken(email.toLowerCase().trim(), redirectUrl);
      const magicUrl = `${APP_URL}/api/auth/magic-link/verify?token=${token}`;

      await sendMagicLinkEmail(email.trim(), magicUrl);

      res.json({ success: true });
    } catch (err) {
      console.error("[MagicLink] Fehler beim Erstellen des Links:", err);
      // Immer success:true – Frontend zeigt "E-Mail gesendet"
      res.json({ success: true });
    }
  });

  /**
   * GET /api/auth/magic-link/verify?token=xxx
   * Verifiziert den Token, erstellt eine Session und leitet weiter.
   */
  app.get("/api/auth/magic-link/verify", async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
      res.redirect("/login?error=invalid_link");
      return;
    }

    try {
      // Token nachschlagen
      const tokenRow = await db.getMagicLinkToken(token);

      if (!tokenRow) {
        res.redirect("/login?error=invalid_link");
        return;
      }

      // Bereits verwendet?
      if (tokenRow.usedAt !== null) {
        res.redirect("/login?error=link_used");
        return;
      }

      // Abgelaufen?
      if (new Date() > tokenRow.expiresAt) {
        res.redirect("/login?error=link_expired");
        return;
      }

      // Token verbrauchen (single-use)
      await db.consumeMagicLinkToken(tokenRow.id);

      const email = tokenRow.email;

      // User suchen oder anlegen
      let user = await db.getUserByEmail(email);

      if (!user) {
        // Neuer User – Magic-Link-Login
        const openId = `magic:${email}`;
        await db.createUser({
          openId,
          name: email.split("@")[0], // Vorläufiger Name aus E-Mail-Präfix
          email,
          loginMethod: "magic",
          role: "user",
          lastSignedIn: new Date(),
        });
        user = await db.getUserByEmail(email);
      } else {
        // Bestehender User – lastSignedIn aktualisieren
        await db.updateUser(user.id, { lastSignedIn: new Date() });
      }

      if (!user) {
        throw new Error("User konnte nicht erstellt/gefunden werden");
      }

      // Session-Cookie setzen
      const sessionToken = await createSessionToken(user.openId, user.name ?? email, email);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Weiterleiten
      res.redirect(302, tokenRow.redirectUrl || "/my-website");
    } catch (err) {
      console.error("[MagicLink] Verify-Fehler:", err);
      res.redirect("/login?error=auth_failed");
    }
  });
}
