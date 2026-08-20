import type { Express, NextFunction, Request, Response } from "express";
import { renderSiteHtml } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { PACK_IDS, type PackId } from "../../shared/siteContract/types";
import { getWebsiteBySlug } from "../db";

/** Mirror of getCustomerSubdomain() in client/src/App.tsx:109-115 — server-side Host-Erkennung. */
const RESERVED_SUBDOMAINS = ["www", "api", "analytics", "admin", "mail", "ftp"];

/** In-Memory-Cache für gerenderte Kundenseiten. TTL 60s, keine Publish-Invalidierung (kommt in Plan B). */
const CACHE_TTL_MS = 60_000;
interface CacheEntry {
  html: string;
  at: number;
}
const siteHtmlCache = new Map<string, CacheEntry>();

function isKnownPackId(value: string): value is PackId {
  return (PACK_IDS as readonly string[]).includes(value);
}

function isFixtureKind(value: string): value is "full" | "minimal" {
  return value === "full" || value === "minimal";
}

/** Extrahiert den Subdomain-Slug aus dem Host-Header (analog getCustomerSubdomain() im Client). */
function getCustomerSubdomainFromHost(hostname: string): string | null {
  const match = hostname.match(/^([a-z0-9][a-z0-9-]*)\.pageblitz\.de$/i);
  if (!match) return null;
  const sub = match[1].toLowerCase();
  return RESERVED_SUBDOMAINS.includes(sub) ? null : sub;
}

/** Erkennt /site/:slug(/rest) und liefert Slug + verbleibenden Pfad (für Impressum/Datenschutz). */
function matchSitePath(
  pathname: string
): { slug: string; rest: string } | null {
  const match = pathname.match(/^\/site\/([a-z0-9][a-z0-9-]*)(\/.*)?$/i);
  if (!match) return null;
  return {
    slug: match[1],
    rest: match[2] && match[2].length > 0 ? match[2] : "/",
  };
}

/** Bestimmt aus Host + Pfad, ob die Anfrage eine Kundenseite adressiert (Subdomain oder /site/:slug). */
function resolveSiteRequest(
  req: Request
): { slug: string; pathname: string } | null {
  const subdomainSlug = getCustomerSubdomainFromHost(req.hostname ?? "");
  if (subdomainSlug) {
    return { slug: subdomainSlug, pathname: req.path };
  }
  const siteMatch = matchSitePath(req.path);
  if (siteMatch) {
    return { slug: siteMatch.slug, pathname: siteMatch.rest };
  }
  return null;
}

/** GET /dev/site-preview?pack=<id>&fixture=<full|minimal> — nur außerhalb production. */
function handleDevPreview(req: Request, res: Response): void {
  if (process.env.NODE_ENV === "production") {
    res.status(404).send("Not found");
    return;
  }

  const packParam = typeof req.query.pack === "string" ? req.query.pack : "";
  const fixtureParam =
    typeof req.query.fixture === "string" ? req.query.fixture : "full";

  if (!isKnownPackId(packParam)) {
    res.status(400).send(`Unbekanntes Pack: "${packParam}"`);
    return;
  }
  if (!isFixtureKind(fixtureParam)) {
    res
      .status(400)
      .send(`Unbekannte Fixture: "${fixtureParam}" (erwartet: full|minimal)`);
    return;
  }

  try {
    const data = getFixture(packParam, fixtureParam);
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const html = renderSiteHtml(data, { origin });
    res.type("html").send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fixture-Fehler";
    res.status(400).send(message);
  }
}

/**
 * Kundenseiten-SSR hinter Flag: rendert `websiteData` server-seitig, wenn
 * `SSR_SITES !== "off"` UND das geladene Dokument gegen WebsiteDataV2Schema
 * validiert. Andernfalls `next()` — das bestehende SPA-Verhalten bleibt
 * unverändert (Client rendert Legacy-Websites und SSR_SITES=off weiterhin selbst).
 */
async function handleCustomerSiteSsr(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (process.env.SSR_SITES === "off" || req.method !== "GET") {
    next();
    return;
  }

  const siteRequest = resolveSiteRequest(req);
  if (!siteRequest) {
    next();
    return;
  }
  // Asset-/Datei-Requests (Favicon, robots.txt, etc.) nie als Seite rendern.
  if (/\.[a-z0-9]+$/i.test(siteRequest.pathname)) {
    next();
    return;
  }

  const cacheKey = `${siteRequest.slug}${siteRequest.pathname}`;

  try {
    const cached = siteHtmlCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.at < CACHE_TTL_MS) {
      res.type("html").send(cached.html);
      return;
    }

    const website = await getWebsiteBySlug(siteRequest.slug);
    if (!website || !website.websiteData) {
      next();
      return;
    }

    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) {
      next();
      return;
    }

    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const html = renderSiteHtml(parsed.data, {
      origin,
      pathname: siteRequest.pathname,
    });
    siteHtmlCache.set(cacheKey, { html, at: now });
    res.type("html").send(html);
  } catch (err) {
    console.error("[SSR] Kundenseiten-Render fehlgeschlagen:", err);
    next();
  }
}

export function registerSsrRoutes(app: Express): void {
  app.get("/dev/site-preview", handleDevPreview);
  app.use(handleCustomerSiteSsr);
}
