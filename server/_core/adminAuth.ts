import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const ADMIN_OPEN_ID = "local-admin";

export function registerAdminAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { password } = req.body ?? {};

    if (!ENV.adminPassword) {
      res.status(503).json({ error: "ADMIN_PASSWORD ist nicht konfiguriert." });
      return;
    }

    if (!password || password !== ENV.adminPassword) {
      res.status(401).json({ error: "Falsches Passwort." });
      return;
    }

    try {
      await db.upsertUser({
        openId: ADMIN_OPEN_ID,
        name: "Admin",
        email: null,
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(ADMIN_OPEN_ID, {
        name: "Admin",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ ok: true });
    } catch (error) {
      console.error("[AdminAuth] Login failed", error);
      res.status(500).json({ error: "Login fehlgeschlagen." });
    }
  });
}
