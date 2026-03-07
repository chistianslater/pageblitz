import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { SignJWT } from "jose";

/**
 * Google OAuth Routes for Customer Authentication
 * Separate from the Manus OAuth server - this is self-hosted
 */

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string; // Google user ID
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

/**
 * Build Google OAuth authorization URL
 */
function buildGoogleAuthUrl(redirectPath: string): string {
  const state = Buffer.from(JSON.stringify({ redirect: redirectPath, nonce: Date.now() })).toString("base64url");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", ENV.googleClientId);
  url.searchParams.set("redirect_uri", ENV.googleRedirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

/**
 * Exchange code for tokens
 */
async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: ENV.googleRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Get user info from Google
 */
async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return response.json();
}

/**
 * Create session token (JWT)
 */
async function createSessionToken(openId: string, name: string, email: string): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const issuedAt = Date.now();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

  return new SignJWT({
    openId,
    appId: ENV.appId || "pageblitz",
    name,
    email,
    provider: "google",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Decode state parameter
 */
function decodeState(state: string): { redirect: string; nonce: number } {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return { redirect: "/my-website", nonce: 0 };
  }
}

/**
 * Register Google OAuth routes
 */
export function registerGoogleAuthRoutes(app: Express) {
  /**
   * GET /api/auth/google/login-url
   * Returns Google OAuth URL
   */
  app.get("/api/auth/google/login-url", (req: Request, res: Response) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      res.status(500).json({ error: "Google OAuth not configured" });
      return;
    }

    const redirect = (req.query.redirect as string) || "/my-website";
    const url = buildGoogleAuthUrl(redirect);

    res.json({ url, provider: "google" });
  });

  /**
   * GET /api/auth/google/callback
   * Google OAuth callback handler
   */
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const error = req.query.error as string;

    if (error) {
      console.error("[Google OAuth] Error:", error);
      res.redirect(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      res.redirect("/login?error=missing_params");
      return;
    }

    try {
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);

      // Get user info
      const userInfo = await getGoogleUserInfo(tokens.access_token);

      if (!userInfo.email_verified) {
        res.redirect("/login?error=email_not_verified");
        return;
      }

      // Create openId from Google sub
      const openId = `google:${userInfo.sub}`;

      // Check if user exists or create new one
      let user = await db.getUserByOpenId(openId);

      if (!user) {
        // Check if user exists with same email
        const existingByEmail = await db.getUserByEmail(userInfo.email);
        if (existingByEmail) {
          // Link Google to existing account
          await db.updateUser(existingByEmail.id, {
            openId,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(openId);
        } else {
          // Create new user
          await db.createUser({
            openId,
            name: userInfo.name,
            email: userInfo.email,
            loginMethod: "google",
            lastSignedIn: new Date(),
            role: "user",
          });
          user = await db.getUserByOpenId(openId);
        }
      } else {
        // Update last signed in
        await db.updateUser(user.id, { lastSignedIn: new Date() });
      }

      if (!user) {
        throw new Error("Failed to create/get user");
      }

      // Create session
      const sessionToken = await createSessionToken(openId, userInfo.name, userInfo.email);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Decode redirect from state
      const { redirect } = decodeState(state);
      res.redirect(302, redirect);
    } catch (err) {
      console.error("[Google OAuth] Callback failed:", err);
      res.redirect("/login?error=auth_failed");
    }
  });
}