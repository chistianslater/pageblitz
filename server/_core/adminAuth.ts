import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const ADMIN_OPEN_ID = "local-admin";

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    console.log("[AdminAuth] Login attempt, ADMIN_PASSWORD configured:", !!ENV.adminPassword);
    console.log("[AdminAuth] Email provided:", !!email, "Password provided:", !!password);

    if (!ENV.adminPassword) {
      console.log("[AdminAuth] Rejected: ADMIN_PASSWORD not configured");
      res.status(503).json({ error: "ADMIN_PASSWORD ist nicht konfiguriert." });
      return;
    }

    // If ADMIN_EMAIL is configured, require it to match
    if (ENV.adminEmail && (!email || email.toLowerCase().trim() !== ENV.adminEmail.toLowerCase().trim())) {
      console.log("[AdminAuth] Rejected: Wrong email");
      res.status(401).json({ error: "E-Mail oder Passwort falsch." });
      return;
    }

    if (!password || password !== ENV.adminPassword) {
      console.log("[AdminAuth] Rejected: Wrong password");
      res.status(401).json({ error: "E-Mail oder Passwort falsch." });
      return;
    }

    console.log("[AdminAuth] Password correct, creating session...");

    try {
      await db.upsertUser({
        openId: ADMIN_OPEN_ID,
        name: "Admin",
        email: ENV.adminEmail || null,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });
      console.log("[AdminAuth] User upserted");

      const sessionToken = await sdk.createSessionToken(ADMIN_OPEN_ID, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log("[AdminAuth] Session token created");

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[AdminAuth] Cookie options:", cookieOptions);

      // Explicitly clear old cookie first to ensure it gets replaced
      res.clearCookie(COOKIE_NAME, { path: "/" });
      res.clearCookie(COOKIE_NAME, { path: "/", domain: req.hostname });
      console.log("[AdminAuth] Old cookies cleared");

      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log("[AdminAuth] New cookie set");

      res.json({ ok: true });
      console.log("[AdminAuth] Response sent");
    } catch (error) {
      console.error("[AdminAuth] Login failed", error);
      res.status(500).json({ error: "Login fehlgeschlagen." });
    }
  });
}
