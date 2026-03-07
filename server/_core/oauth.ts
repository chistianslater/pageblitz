import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { randomBytes } from "crypto";
import { notifyOwner } from "./notification";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Send magic link email
 */
async function sendMagicLinkEmail(email: string, token: string, redirectPath: string): Promise<void> {
  const baseUrl = ENV.isProduction ? "https://pageblitz.de" : "http://localhost:3000";
  const magicLink = `${baseUrl}/api/auth/magic?token=${token}&redirect=${encodeURIComponent(redirectPath)}`;
  
  // For now, just log it (in production, send via email service)
  console.log(`
========================================
MAGIC LINK for ${email}:
${magicLink}
========================================
  `);
  
  // TODO: Send actual email via Resend or other service
  // await sendEmail({ to: email, subject: "Login zu Pageblitz", body: magicLink });
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
    const validProviders = ["google", "microsoft", "apple", "github", "magic_link"];
    if (!validProviders.includes(provider)) {
      res.status(400).json({ error: "Invalid provider" });
      return;
    }
    
    // Magic link uses internal flow, not OAuth
    if (provider === "magic_link") {
      res.json({ provider: "magic_link", redirect });
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
   * POST /api/auth/magic-link
   * Send magic link to user's email
   */
  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    const { email, redirect } = req.body;
    
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    
    try {
      // Generate token
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
      
      // Save to database
      await db.createMagicLink({
        token,
        email: email.toLowerCase().trim(),
        expiresAt,
        used: false,
      });
      
      // Send email
      await sendMagicLinkEmail(email, token, redirect || "/my-website");
      
      res.json({ success: true, message: "Magic link sent" });
    } catch (error) {
      console.error("[Magic Link] Failed to send:", error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  /**
   * GET /api/auth/magic
   * Verify magic link token and log user in
   */
  app.get("/api/auth/magic", async (req: Request, res: Response) => {
    const token = getQueryParam(req, "token");
    const redirect = getQueryParam(req, "redirect") || "/my-website";
    
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }
    
    try {
      // Get magic link from database
      const magicLink = await db.getMagicLinkByToken(token);
      
      if (!magicLink) {
        res.status(400).json({ error: "Invalid token" });
        return;
      }
      
      if (magicLink.used) {
        res.status(400).json({ error: "Link already used" });
        return;
      }
      
      if (new Date() > new Date(magicLink.expiresAt)) {
        res.status(400).json({ error: "Link expired" });
        return;
      }
      
      // Mark as used
      await db.markMagicLinkUsed(magicLink.id);
      
      // Create or get user
      const openId = `email:${magicLink.email}`;
      let user = await db.getUserByOpenId(openId);
      
      if (!user) {
        // Create new user
        await db.createUser({
          openId,
          email: magicLink.email,
          name: null,
          loginMethod: "magic_link",
          lastSignedIn: new Date(),
        });
        user = await db.getUserByOpenId(openId);
      } else {
        // Update last signed in
        await db.updateUser(user.id, { lastSignedIn: new Date() });
      }
      
      if (!user) {
        res.status(500).json({ error: "Failed to create/get user" });
        return;
      }
      
      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });
      
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      res.redirect(302, redirect);
    } catch (error) {
      console.error("[Magic Link] Verification failed:", error);
      res.status(500).json({ error: "Magic link verification failed" });
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
