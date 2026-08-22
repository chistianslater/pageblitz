import type { Express, NextFunction, Request, Response } from "express";
import { renderSiteHtml } from "./renderSite";
import { getFixture } from "../../shared/siteContract/fixtures";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import { PACK_IDS, type PackId } from "../../shared/siteContract/types";
import { getWebsiteBySlug, getWebsiteByToken } from "../db";

/** Mirror of getCustomerSubdomain() in client/src/App.tsx:109-115 — server-side Host-Erkennung. */
const RESERVED_SUBDOMAINS = ["www", "api", "analytics", "admin", "mail", "ftp"];

/** In-Memory-Cache für gerenderte Kundenseiten. TTL 60s, keine Publish-Invalidierung (kommt in Plan B). */
const CACHE_TTL_MS = 60_000;
interface CacheEntry {
  html: string;
  status: number;
  at: number;
}
const siteHtmlCache = new Map<string, CacheEntry>();

/**
 * Negative-Cache: hält für 60s fest, dass ein Slug nicht existiert oder kein
 * v2-Dokument ist ("miss"), damit v1-Traffic und Crawler nicht bei jedem
 * Request eine DB-Query auslösen. Slug-scoped statt pfad-scoped, weil "nicht
 * gefunden"/"nicht v2" eine Eigenschaft des Slugs ist, nicht des Pfads.
 */
const NEGATIVE_CACHE_TTL_MS = 60_000;
const siteMissCache = new Map<string, number>();

/** Obergrenze pro Cache — verhindert unbegrenztes Wachstum (kein TTL-Sweep, nur Read-Eviction bisher). */
const MAX_CACHE_ENTRIES = 500;

/** Einfacher Sweep: löscht die ältesten Einträge (Map-Insertion-Order), bis die Größe wieder unter `max` liegt. */
function capCacheSize<V>(cache: Map<string, V>, max: number): void {
  if (cache.size <= max) return;
  const excess = cache.size - max;
  const oldestKeys = Array.from(cache.keys()).slice(0, excess);
  for (const key of oldestKeys) {
    cache.delete(key);
  }
}

/** Nur diese Pfade werden auf v2-Kundenseiten SSR-gerendert; alles andere ist next() (Catch-All entscheidet). */
const SSR_ALLOWED_PATHNAMES = new Set(["/", "/impressum", "/datenschutz"]);

/**
 * Löscht alle SSR-Cache-Einträge für einen Slug — beide Pfadformen ("sub:"
 * für kunde.pageblitz.de/..., "path:" für pageblitz.de/site/<slug>/...) und
 * alle SSR_ALLOWED_PATHNAMES — sowie den Negative-Cache-Eintrag. Wird nach
 * jeder (Re-)Generierung aufgerufen, damit Kunden ihre neue Website sofort
 * sehen statt bis zu 60s (CACHE_TTL_MS) auf den TTL-Ablauf zu warten.
 */
export function invalidateSsrCache(slug: string): void {
  const key = slug.toLowerCase();
  siteMissCache.delete(key);
  for (const pathname of SSR_ALLOWED_PATHNAMES) {
    siteHtmlCache.delete(`sub:${key}${pathname}`);
    siteHtmlCache.delete(`path:${key}${pathname}`);
  }
}

function isKnownPackId(value: string): value is PackId {
  return (PACK_IDS as readonly string[]).includes(value);
}

function isFixtureKind(
  value: string
): value is "full" | "minimal" | "features" {
  return value === "full" || value === "minimal" || value === "features";
}

/** Nur diese Pfade werden in der Studio-Preview SSR-gerendert. */
const PREVIEW_PATHNAMES = new Set(["/", "/impressum", "/datenschutz"]);

/**
 * Studio-Live-Preview: rendert das gespeicherte v2-Dokument per previewToken
 * (Zugangsgeheimnis, nanoid 32) — ungecacht (jeder Patch soll sofort sichtbar
 * sein), noindex, optional mit Pack-Override (?pack=) für Stil-Kandidaten.
 * Der Override verändert NIE das gespeicherte Dokument.
 */
async function handlePreviewSsr(req: Request, res: Response): Promise<void> {
  // Express-Regex-Route (siehe registerSsrRoutes): params[0] = Token, params[1] = Restpfad
  const token = typeof req.params[0] === "string" ? req.params[0] : "";
  const pathname =
    typeof req.params[1] === "string" && req.params[1].length > 0
      ? req.params[1]
      : "/";
  if (!PREVIEW_PATHNAMES.has(pathname)) {
    res.status(404).send("Vorschau-Seite nicht gefunden");
    return;
  }
  const packParam = typeof req.query.pack === "string" ? req.query.pack : "";
  if (packParam && !isKnownPackId(packParam)) {
    res.status(400).send(`Unbekanntes Pack: "${packParam}"`);
    return;
  }
  try {
    const website = await getWebsiteByToken(token);
    if (!website || !website.websiteData) {
      res.status(404).send("Vorschau nicht gefunden");
      return;
    }
    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) {
      res.status(404).send("Noch keine Website im neuen Format");
      return;
    }
    const data = packParam
      ? { ...parsed.data, stylePackId: packParam as PackId }
      : parsed.data;
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/preview-ssr/${token}`;
    const { html, status } = renderSiteHtml(data, {
      origin,
      pathname,
      basePath,
    });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "no-store");
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Preview-Render fehlgeschlagen:", err);
    res.status(500).send("Vorschau konnte nicht gerendert werden");
  }
}

/** Extrahiert den Subdomain-Slug aus dem Host-Header (analog getCustomerSubdomain() im Client). */
function getCustomerSubdomainFromHost(hostname: string): string | null {
  const match = hostname.match(/^([a-z0-9][a-z0-9-]*)\.pageblitz\.de$/i);
  if (!match) return null;
  const sub = match[1].toLowerCase();
  return RESERVED_SUBDOMAINS.includes(sub) ? null : sub;
}

/**
 * Erkennt /site/:slug(/rest) und liefert Slug + verbleibenden Pfad (für
 * Impressum/Datenschutz). Der Slug wird auf lowercase normalisiert — sonst
 * erzeugen /site/FOO und /site/foo getrennte Cache-Einträge/DB-Queries und
 * zählen als Duplicate Content.
 */
function matchSitePath(
  pathname: string
): { slug: string; rest: string } | null {
  const match = pathname.match(/^\/site\/([a-z0-9][a-z0-9-]*)(\/.*)?$/i);
  if (!match) return null;
  return {
    slug: match[1].toLowerCase(),
    rest: match[2] && match[2].length > 0 ? match[2] : "/",
  };
}

/**
 * Bestimmt aus Host + Pfad, ob die Anfrage eine Kundenseite adressiert
 * (Subdomain oder /site/:slug). `basePath` ist "" für die Subdomain-Form
 * (kunde.pageblitz.de/...) und "/site/<slug>" für die Pfadform
 * (pageblitz.de/site/<slug>/...) — Pack-Links (Impressum/Datenschutz)
 * brauchen dieses Präfix, sonst führen sie auf pageblitz.de in die SPA statt
 * zur Kundenseite. `cacheKeyPrefix` unterscheidet die beiden Formen im
 * Render-Cache, weil das erzeugte HTML sich jetzt je nach Pfadform
 * unterscheidet (unterschiedliche Footer-/Zurück-Links).
 */
function resolveSiteRequest(req: Request): {
  slug: string;
  pathname: string;
  basePath: string;
  cacheKeyPrefix: string;
} | null {
  const subdomainSlug = getCustomerSubdomainFromHost(req.hostname ?? "");
  if (subdomainSlug) {
    return {
      slug: subdomainSlug,
      pathname: req.path,
      basePath: "",
      cacheKeyPrefix: "sub:",
    };
  }
  const siteMatch = matchSitePath(req.path);
  if (siteMatch) {
    return {
      slug: siteMatch.slug,
      pathname: siteMatch.rest,
      basePath: `/site/${siteMatch.slug}`,
      cacheKeyPrefix: "path:",
    };
  }
  return null;
}

/** GET /dev/site-preview?pack=<id>&fixture=<full|minimal|features> — nur außerhalb production. */
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
      .send(
        `Unbekannte Fixture: "${fixtureParam}" (erwartet: full|minimal|features)`
      );
    return;
  }

  try {
    const data = getFixture(packParam, fixtureParam);
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    // fixes Datum für deterministische Visual-Baselines (nur Dev-Preview,
    // Kundenseiten-SSR unten bleibt bei Echtzeit).
    const { html, status } = renderSiteHtml(data, {
      origin,
      now: new Date("2026-08-19T10:00:00"),
    });
    res.status(status).type("html").send(html);
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
  // Nur Startseite + Rechtsseiten werden SSR-gerendert. Alles andere (unbekannte
  // Pfade, Assets, Favicon, robots.txt, ...) geht an next() — sonst würde jeder
  // unbekannte Pfad 200 + die Startseite mit selbstreferenzierendem Canonical
  // bekommen.
  if (!SSR_ALLOWED_PATHNAMES.has(siteRequest.pathname)) {
    next();
    return;
  }

  const now = Date.now();
  const missUntil = siteMissCache.get(siteRequest.slug);
  if (missUntil !== undefined && now < missUntil) {
    next();
    return;
  }

  const cacheKey = `${siteRequest.cacheKeyPrefix}${siteRequest.slug}${siteRequest.pathname}`;

  try {
    const cached = siteHtmlCache.get(cacheKey);
    if (cached && now - cached.at < CACHE_TTL_MS) {
      res.status(cached.status).type("html").send(cached.html);
      return;
    }

    const website = await getWebsiteBySlug(siteRequest.slug);
    if (!website || !website.websiteData) {
      siteMissCache.set(siteRequest.slug, now + NEGATIVE_CACHE_TTL_MS);
      capCacheSize(siteMissCache, MAX_CACHE_ENTRIES);
      next();
      return;
    }

    const parsed = WebsiteDataV2Schema.safeParse(website.websiteData);
    if (!parsed.success) {
      siteMissCache.set(siteRequest.slug, now + NEGATIVE_CACHE_TTL_MS);
      capCacheSize(siteMissCache, MAX_CACHE_ENTRIES);
      next();
      return;
    }

    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const { html, status } = renderSiteHtml(parsed.data, {
      origin,
      pathname: siteRequest.pathname,
      basePath: siteRequest.basePath,
    });
    siteHtmlCache.set(cacheKey, { html, status, at: now });
    capCacheSize(siteHtmlCache, MAX_CACHE_ENTRIES);
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Kundenseiten-Render fehlgeschlagen:", err);
    next();
  }
}

export function registerSsrRoutes(app: Express): void {
  app.get("/dev/site-preview", handleDevPreview);
  app.get(/^\/preview-ssr\/([A-Za-z0-9_-]{16,64})(\/.*)?$/, (req, res) => {
    void handlePreviewSsr(req, res);
  });
  app.use(handleCustomerSiteSsr);
}
