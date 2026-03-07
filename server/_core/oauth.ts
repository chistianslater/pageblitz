import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Build OAuth authorization URL
 */
function buildOAuthUrl(provider: string, redirectPath: string): string {
  const state = Buffer.from(redirectPath).toString("base64");
  
  const url = new URL("/authorize", ENV.oAuthServerUrl);
  url.searchParams.set("client_id", ENV.appId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${ENV.isProduction ? "https://pageblitz.de" : "http://localhost:3000"}/api/oauth/callback`);
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("state", state);
  url.searchParams.set("provider", provider);
  
  return url.toString();
}

export function registerOAuthRoutes(app: Express) {
  /**
   * GET /api/auth/login-url
   * Returns OAuth URL for the requested provider
   */
  app.get("/api/auth/login-url", (req: Request, res: Response) => {
    const provider = getQueryParam(req, "provider") || "google";
    const redirect = getQueryParam(req, "redirect") || "/my-website";
    
    // Validate provider
    const validProviders = ["google", "microsoft", "apple", "github", "email"];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }
    
    try {
      const url = buildOAuthUrl(provider, redirect);
      res.json({ url, provider });
    } catch (error) {
      console.error("[OAuth] Failed to build login URL:", error);
      res.status(500).json({ error: "Failed to generate login URL" });
    }
  });

  /**
   * POST /api/auth/logout
   * Clears session cookie and logs user out
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });

  /**
   * GET /api/oauth/callback
   * OAuth callback handler
   */
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Decode state to get redirect path
      let redirectPath = "/my-website";
      try {
        redirectPath = Buffer.from(state, "base64").toString("utf-8");
        // Ensure path starts with /
        if (!redirectPath.startsWith("/")) {
          redirectPath = "/my-website";
        }
      } catch {
        console.warn("[OAuth] Failed to decode state, using default redirect");
      }

      res.redirect(302, redirectPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
