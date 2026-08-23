import type { Express, NextFunction, Request, Response } from "express";
import { renderSiteHtml } from "./renderSite";
import { renderNotFoundHtml } from "./notFoundPage";
import { getFixture } from "../../shared/siteContract/fixtures";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import {
  PACK_IDS,
  type PackId,
  type WebsiteDataV2,
} from "../../shared/siteContract/types";
import { getWebsiteBySlug, getWebsiteByToken } from "../db";
import {
  pageForPathname,
  visiblePages,
} from "../../client/src/components/site/engine";

/** Mirror of getCustomerSubdomain() in client/src/App.tsx:109-115 — server-side Host-Erkennung. */
const RESERVED_SUBDOMAINS = ["www", "api", "analytics", "admin", "mail", "ftp"];

/** In-Memory-Cache für gerenderte Kundenseiten. TTL 60s, keine Publish-Invalidierung (kommt in Plan B). */
const CACHE_TTL_MS = 60_000;
interface CacheEntry {
  html: string;
  status: number;
  at: number;
  /** true für die SSR-404-Seite unbekannter Unterpfade — Header muss auch bei Cache-Treffern gesetzt werden. */
  robotsNoindex?: boolean;
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
/**
 * Bekannte Unterseiten-Slugs je Website-Slug (Key = slug lowercase), gesetzt
 * bei jedem erfolgreichen Dokument-Load. Dient NUR dazu, den geteilten
 * 404-Cache-Eintrag (NOT_FOUND_CACHE_PATH) für dynamische Pfade gefahrlos zu
 * nutzen: Ein nicht gecachter, aber existierender Unterseiten-Pfad darf nie
 * das 404-HTML eines anderen Pfads bekommen (Final-Review B6 Task 3).
 */
const sitePagesCache = new Map<
  string,
  { pageSlugs: Set<string>; at: number }
>();

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

/**
 * Diese Pfade sind IMMER bekannt, unabhängig vom geladenen Dokument
 * (Startseite, Rechtsseiten). Seit Plan B6 (Task 3) kommen dynamisch die
 * Slugs aus `data.pages[]` dazu — siehe `isKnownSitePathname` — deshalb kann
 * "bekannt" nicht mehr rein aus dem Pfad ohne geladenes Dokument entschieden
 * werden. Andere Unterpfade unter einer bekannten v2-Site bekommen ein
 * eigenes SSR-404 (siehe `handleCustomerSiteSsr`) statt next() — nur
 * Asset-artige Pfade (Dateiendung) und unbekannte Slugs gehen weiterhin an
 * next(), damit Static-Middleware/SPA-Fallback greifen kann.
 */
const STATIC_SITE_PATHNAMES = new Set(["/", "/impressum", "/datenschutz"]);

/**
 * Ist `pathname` für dieses Dokument bekannt — entweder statisch (Startseite,
 * Rechtsseiten) oder eine gebuchte Unterseite aus `data.pages[]` (Plan B6,
 * Task 3; Gating über `addOns.subpages` seit Task 6, siehe `pageForPathname`).
 */
function isKnownSitePathname(data: WebsiteDataV2, pathname: string): boolean {
  return (
    STATIC_SITE_PATHNAMES.has(pathname) ||
    pageForPathname(data, pathname) !== null
  );
}

/** Pfade mit Dateiendung (Favicons, Bilder, robots.txt, ...) sind nie SSR-Sache. */
const ASSET_PATHNAME_RE = /\.[a-z0-9]+$/i;

/**
 * Pseudo-Pfad für den 404-Cache-Eintrag einer v2-Site: EIN Eintrag je Slug
 * (statt je unbekanntem Pfad), damit invalidateSsrCache() ihn mitlöscht und
 * beliebige Fantasiepfade den Cache nicht fluten können. Der Wert enthält
 * ein NUL-Zeichen und kann daher nie mit einem echten Request-Pfad kollidieren.
 */
const NOT_FOUND_CACHE_PATH = "\u0000404";

/**
 * Löscht alle SSR-Cache-Einträge für einen Slug per Prefix-Scan — beide
 * Pfadformen ("sub:" für kunde.pageblitz.de/..., "path:" für
 * pageblitz.de/site/<slug>/...), jede gecachte Unterseite UND den
 * NOT_FOUND_CACHE_PATH-Eintrag. Seit Plan B6 (Task 3) sind Unterseiten
 * dynamisch (`data.pages[]`) — eine feste Pfad-Liste (wie vorher
 * SSR_ALLOWED_PATHNAMES) reicht daher nicht mehr; ein Scan über die
 * tatsächlichen Cache-Keys trifft immer alle Einträge des Slugs, egal welche
 * Pfade gerade gecacht sind. `matchesSlugPrefix` prüft eine echte
 * Segmentgrenze ("/" oder das NUL-Zeichen) direkt nach dem Slug, damit der
 * Slug "foo" nicht versehentlich Einträge von "foobar" mitlöscht. Wird nach
 * jeder (Re-)Generierung aufgerufen, damit Kunden ihre neue Website sofort
 * sehen statt bis zu 60s (CACHE_TTL_MS) auf den TTL-Ablauf zu warten.
 */
function matchesSlugPrefix(
  cacheKey: string,
  cacheKeyPrefix: string,
  slug: string
): boolean {
  const base = `${cacheKeyPrefix}${slug}`;
  return (
    cacheKey.startsWith(`${base}/`) ||
    cacheKey.startsWith(`${base}${NOT_FOUND_CACHE_PATH}`)
  );
}

export function invalidateSsrCache(slug: string): void {
  const key = slug.toLowerCase();
  siteMissCache.delete(key);
  sitePagesCache.delete(key);
  for (const cacheKey of Array.from(siteHtmlCache.keys())) {
    if (
      matchesSlugPrefix(cacheKey, "sub:", key) ||
      matchesSlugPrefix(cacheKey, "path:", key)
    ) {
      siteHtmlCache.delete(cacheKey);
    }
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

/**
 * Studio-Live-Preview: rendert das gespeicherte v2-Dokument per previewToken
 * (Zugangsgeheimnis, nanoid 32) — ungecacht (jeder Patch soll sofort sichtbar
 * sein), noindex, optional mit Pack-Override (?pack=) für Stil-Kandidaten.
 * Der Override verändert NIE das gespeicherte Dokument. Seit Plan B6 (Task 3)
 * ist die Pfad-Gültigkeit vom Dokument abhängig (`data.pages[]`), deshalb
 * wird erst geladen und geparst, dann der Pfad gegen `isKnownSitePathname`
 * geprüft — anders als vorher (statische `PREVIEW_PATHNAMES`, vor dem
 * Token-Lookup geprüft) reicht ein rein statischer Pfad-Check nicht mehr.
 */
async function handlePreviewSsr(req: Request, res: Response): Promise<void> {
  // Express-Regex-Route (siehe registerSsrRoutes): params[0] = Token, params[1] = Restpfad
  const token = typeof req.params[0] === "string" ? req.params[0] : "";
  const pathname =
    typeof req.params[1] === "string" && req.params[1].length > 0
      ? req.params[1]
      : "/";
  const packParam = typeof req.query.pack === "string" ? req.query.pack : "";
  if (packParam && !isKnownPackId(packParam)) {
    // Bewusst OHNE den Parameter im Body zu reflektieren — ein Query-Wert wie
    // `<script>...` würde sonst unescaped in einer text/html-Antwort landen
    // (reflected XSS), siehe handleDemoRoute weiter unten.
    res.status(400).type("text/plain").send("Unbekanntes Pack");
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
    if (!isKnownSitePathname(parsed.data, pathname)) {
      res.status(404).send("Vorschau-Seite nicht gefunden");
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
      slug: website.slug,
      site: { chatWelcomeMessage: website.chatWelcomeMessage },
      // Zeitmaschine (Plan B7 Task 4): Der GenerationScreen hängt ?reveal=1
      // an, damit die Sektionen des frisch geschriebenen (Zwischen-)Stands
      // sichtbar einfaden. Nur diese Preview-Route kennt den Parameter —
      // Kundenseiten-SSR bleibt ohne Einblendungs-CSS.
      sectionReveal: req.query.reveal === "1",
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
    // Bewusst OHNE den Parameter im Body zu reflektieren — siehe
    // handleDemoRoute weiter unten (reflected XSS via Query-Parameter).
    res.status(400).type("text/plain").send("Unbekanntes Pack");
    return;
  }
  if (!isFixtureKind(fixtureParam)) {
    // Bewusst OHNE den Parameter im Body zu reflektieren (siehe oben).
    res
      .status(400)
      .type("text/plain")
      .send("Unbekannte Fixture (erwartet: full|minimal|features)");
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
      slug: "demo",
      site: { chatWelcomeMessage: "Willkommen in der Demo!" },
    });
    res.status(status).type("html").send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fixture-Fehler";
    res.status(400).send(message);
  }
}

/** Cache-Dauer für die öffentliche Style-Pack-Demo (statisches Fixture-HTML, ändert sich zur Laufzeit nie). */
const DEMO_CACHE_CONTROL = "public, max-age=3600";

/**
 * Öffentliche Style-Pack-Demo für die Landingpage-Showcase (`PackShowcase`):
 * rendert `getFixture(pack, "full")` als eigenständige, cachebare Seite —
 * ungebunden an eine echte Website/Kunde, daher `noindex` und ohne DB-Query.
 * Inseln laufen im Preview-Modus (`islandsMode: "preview"`), damit ein
 * eventuell aktives Kontaktformular/Chat/Buchung aus der Demo heraus nichts
 * absenden kann — aktuell ein No-op, weil Fixture "full" keine Features
 * aktiviert hat (siehe `shared/siteContract/fixtures.ts`), schützt aber,
 * falls sich das ändert.
 *
 * Route-Regex `:pack([a-z0-9-]+)` matcht NUR Pack-ID-artige Segmente — ein
 * Segment mit Punkt/Großbuchstaben/Sonderzeichen (z. B. eine statische Datei
 * wie `/demo/werkbank-hero.webp` unter `client/public/demo/`) matcht diese
 * Route gar nicht erst und fällt automatisch auf die nachfolgende Static-/
 * SPA-Middleware durch (Regressionsfund: die Fixture-Bilder der Demo-Seiten
 * selbst liegen unter genau diesem Pfadpräfix). Rechtsseiten
 * (`/demo/:pack/impressum|datenschutz`) haben eine eigene Route
 * (`handleDemoLegalRoute` weiter unten), weil sie ein zweites Pfadsegment
 * brauchen und dieses Regex nur ein Segment matcht.
 */
function handleDemoRoute(req: Request, res: Response): void {
  const packParam = typeof req.params.pack === "string" ? req.params.pack : "";
  if (!isKnownPackId(packParam)) {
    // Bewusst OHNE den Parameter im Body zu reflektieren (öffentliche,
    // ungegatete Route) — ein Query-/Pfad-Wert wie `<script>...` würde sonst
    // unescaped in einer text/html-Antwort landen (reflected XSS).
    res.status(404).type("text/plain").send("Unbekanntes Pack");
    return;
  }
  try {
    const data = getFixture(packParam, "full");
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/demo/${packParam}`;
    const { html, status } = renderSiteHtml(data, {
      origin,
      basePath,
      slug: "demo",
      site: {},
      islandsMode: "preview",
      // Festes Datum (wie /dev/site-preview) statt Echtzeit: mindestens ein
      // Pack-Modul (morgenlicht) zeigt datumsabhängige "Heute geöffnet"-
      // Badges (now.getDay()) — ohne fixes Datum würde die Landingpage-
      // Showcase (PackShowcase, tests/visual/landing.spec.ts) an
      // unterschiedlichen Wochentagen unterschiedliches HTML/Pixel-Diffs
      // liefern.
      now: new Date("2026-08-19T10:00:00"),
    });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Pack-Demo-Render fehlgeschlagen:", err);
    res.status(500).send("Demo konnte nicht gerendert werden");
  }
}

/**
 * Platzhalter-Rechtstext für die Pack-Demo: Fixtures haben absichtlich kein
 * `legal`-Feld (keine echte Firma dahinter, siehe `shared/siteContract/fixtures.ts`)
 * — dieser Hinweistext ersetzt die echten Rechtstexte NUR für die
 * Demo-Route, damit die Footer-Links in der Demo funktionieren statt 404 zu
 * liefern.
 */
const DEMO_LEGAL_NOTICE =
  "<p>Dies ist eine Demo-Seite ohne echtes Unternehmen. Echte Rechtstexte (Impressum, Datenschutz) werden automatisch erzeugt, sobald für ein Unternehmen eine Website erstellt wird.</p>";

/**
 * Demo-Rechtsseiten (`/demo/:pack/impressum` und `/demo/:pack/datenschutz`):
 * rendert die Fixture wie `handleDemoRoute`, überschreibt aber `legal` mit
 * `DEMO_LEGAL_NOTICE`, damit die Footer-Links der Demo-Seite (Impressum/
 * Datenschutz) auf echten Inhalt statt 404 treffen. Gleiches
 * Caching/Robots-Verhalten wie `/demo/:pack` (öffentlich, cachebar, noindex).
 */
function handleDemoLegalRoute(req: Request, res: Response): void {
  const packParam = typeof req.params.pack === "string" ? req.params.pack : "";
  const pageParam = typeof req.params.page === "string" ? req.params.page : "";
  if (!isKnownPackId(packParam)) {
    // Bewusst OHNE den Parameter im Body zu reflektieren (siehe handleDemoRoute).
    res.status(404).type("text/plain").send("Unbekanntes Pack");
    return;
  }
  try {
    const fixture = getFixture(packParam, "full");
    const data = {
      ...fixture,
      legal: {
        impressumHtml: DEMO_LEGAL_NOTICE,
        datenschutzHtml: DEMO_LEGAL_NOTICE,
      },
    };
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/demo/${packParam}`;
    const pathname =
      pageParam === "datenschutz" ? "/datenschutz" : "/impressum";
    const { html, status } = renderSiteHtml(data, {
      origin,
      basePath,
      pathname,
      slug: "demo",
      site: {},
    });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Demo-Rechtsseite-Render fehlgeschlagen:", err);
    res.status(500).send("Demo konnte nicht gerendert werden");
  }
}

/**
 * Demo-Unterseiten (`/demo/:pack/:page`, Plan B6 Task 3): rendert eine Page
 * aus der "full"-Fixture des Packs (jede "full"-Fixture hat seit Task 2 die
 * Demo-Page `leistungen-im-detail`). Muss NACH `handleDemoLegalRoute`
 * registriert werden — deren Pfad-Segment ist auf die Literale
 * "impressum"/"datenschutz" beschränkt, matcht also nie hierher, aber ohne
 * diese Reihenfolge würde ein generisches `:page([a-z0-9-]+)` VOR der
 * spezifischeren Route auch "impressum"/"datenschutz" abfangen und die
 * Legal-Sonderbehandlung (DEMO_LEGAL_NOTICE) übergehen. Unbekannte Pages
 * (Pack ohne diese Page, oder Tippfehler) → 404, Parameter nicht reflektiert
 * (wie die übrigen Demo-Routen).
 */
function handleDemoPageRoute(req: Request, res: Response): void {
  const packParam = typeof req.params.pack === "string" ? req.params.pack : "";
  const pageParam = typeof req.params.page === "string" ? req.params.page : "";
  if (!isKnownPackId(packParam)) {
    // Bewusst OHNE den Parameter im Body zu reflektieren (siehe handleDemoRoute).
    res.status(404).type("text/plain").send("Unbekanntes Pack");
    return;
  }
  try {
    const data = getFixture(packParam, "full");
    const page = pageForPathname(data, `/${pageParam}`);
    if (!page) {
      res.status(404).type("text/plain").send("Unbekannte Seite");
      return;
    }
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/demo/${packParam}`;
    const { html, status } = renderSiteHtml(data, {
      origin,
      basePath,
      pathname: `/${page.slug}`,
      slug: "demo",
      site: {},
      islandsMode: "preview",
      // Gleiches feste Datum wie handleDemoRoute — siehe Kommentar dort.
      now: new Date("2026-08-19T10:00:00"),
    });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Demo-Unterseite-Render fehlgeschlagen:", err);
    res.status(500).send("Demo konnte nicht gerendert werden");
  }
}

/**
 * Kundenseiten-SSR hinter Flag: rendert `websiteData` server-seitig, wenn
 * `SSR_SITES !== "off"` UND das geladene Dokument gegen WebsiteDataV2Schema
 * validiert. Andernfalls `next()` — das bestehende SPA-Verhalten bleibt
 * unverändert (Client rendert Legacy-Websites und SSR_SITES=off weiterhin selbst).
 *
 * Reihenfolge seit Plan B6 (Task 3): Slug auflösen → Website laden (mit
 * Cache-Kurzschluss davor) → Pfad gegen `/`, Legal UND `data.pages[]` prüfen
 * → sonst 404. Vorher konnte "bekannter Pfad" rein aus der URL entschieden
 * werden (statische Liste); seit Unterseiten dynamisch sind, braucht die
 * Entscheidung das geladene Dokument. Der Cache-Lookup vor dem DB-Call prüft
 * trotzdem weiterhin ZUERST den exakten Pfad-Cache-Eintrag und — nur für
 * nicht-statische Pfade — zusätzlich den geteilten `notFoundCacheKey`
 * (EIN 404-Eintrag je Slug, siehe `invalidateSsrCache`): das hält das
 * bestehende Verhalten "beliebige Fantasiepfade auf einem bekannten Slug
 * kosten nach dem ersten Mal keinen weiteren DB-Call" bei, ohne einer
 * echten (aber noch nicht gecachten) Unterseite fälschlich zu antworten —
 * für `/` und Legal-Pfade wird der geteilte 404-Eintrag nie geprüft, die
 * sind immer bekannt.
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

  if (ASSET_PATHNAME_RE.test(siteRequest.pathname)) {
    // Asset-artige Pfade (Favicon, Bilder, robots.txt, ...) sind nie SSR-Sache
    // — next() lässt Static-Middleware/SPA-Fallback ran. Unabhängig von
    // "bekannt", weil weder die statischen Pfade noch gültige Page-Slugs
    // (siehe PageSchema-Regex) je einen Punkt enthalten.
    next();
    return;
  }

  const now = Date.now();
  const missUntil = siteMissCache.get(siteRequest.slug);
  if (missUntil !== undefined && now < missUntil) {
    next();
    return;
  }

  const isStaticPathname = STATIC_SITE_PATHNAMES.has(siteRequest.pathname);
  const cacheKey = `${siteRequest.cacheKeyPrefix}${siteRequest.slug}${siteRequest.pathname}`;
  const notFoundCacheKey = `${siteRequest.cacheKeyPrefix}${siteRequest.slug}${NOT_FOUND_CACHE_PATH}`;

  try {
    // Geteilter 404-Eintrag nur, wenn wir sicher wissen, dass der Pfad KEINE
    // existierende Unterseite ist (Pages-Liste des Dokuments bekannt und
    // Pfad nicht enthalten). Unbekannte Pages-Liste → Dokument laden.
    const knownPages = sitePagesCache.get(siteRequest.slug);
    const maySkipViaNotFound =
      !isStaticPathname &&
      knownPages !== undefined &&
      now - knownPages.at < CACHE_TTL_MS &&
      !knownPages.pageSlugs.has(siteRequest.pathname.replace(/^\//, ""));
    const cached =
      siteHtmlCache.get(cacheKey) ??
      (maySkipViaNotFound ? siteHtmlCache.get(notFoundCacheKey) : undefined);
    if (cached && now - cached.at < CACHE_TTL_MS) {
      if (cached.robotsNoindex) {
        res.setHeader("X-Robots-Tag", "noindex");
      }
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

    // Nur gebuchte Unterseiten zählen als bekannt (visiblePages gatet über
    // addOns.subpages — dieselbe Quelle wie pageForPathname/buildNavItems,
    // Plan B6 Task 6); ohne Add-on ist jede Page-URL ein 404.
    sitePagesCache.set(siteRequest.slug, {
      pageSlugs: new Set(visiblePages(parsed.data).map(p => p.slug)),
      at: now,
    });
    capCacheSize(sitePagesCache, MAX_CACHE_ENTRIES);

    if (
      !isStaticPathname &&
      pageForPathname(parsed.data, siteRequest.pathname) === null
    ) {
      // Bekannte v2-Site, aber unbekannter Unterpfad (z. B. Tippfehler in
      // einem geteilten Link oder eine nicht (mehr) existierende Unterseite)
      // → eigenes SSR-404 statt SPA-Fallback. Website wird dafür geladen
      // (gleiche Cache-Nutzung wie beim Seitenrender oben, negativer Cache
      // für unbekannte Slugs bleibt unverändert).
      const html = renderNotFoundHtml({
        businessName: parsed.data.businessName,
        homeHref: siteRequest.basePath || "/",
      });
      siteHtmlCache.set(notFoundCacheKey, {
        html,
        status: 404,
        at: now,
        robotsNoindex: true,
      });
      capCacheSize(siteHtmlCache, MAX_CACHE_ENTRIES);
      res.setHeader("X-Robots-Tag", "noindex");
      res.status(404).type("html").send(html);
      return;
    }

    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const { html, status } = renderSiteHtml(parsed.data, {
      origin,
      pathname: siteRequest.pathname,
      basePath: siteRequest.basePath,
      slug: website.slug,
      site: { chatWelcomeMessage: website.chatWelcomeMessage },
      // Cookieloses Umami-Tracking nur für aktive Sites mit registrierter
      // ID (Plan B6 Task 7; ID kommt aus server/umamiProvisioning.ts, die
      // nach dem Write den Cache hier invalidiert).
      umamiWebsiteId:
        website.status === "active" ? website.umamiWebsiteId : null,
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
  app.get(
    "/demo/:pack([a-z0-9-]+)/:page(impressum|datenschutz)",
    handleDemoLegalRoute
  );
  // Muss NACH der Legal-Route stehen — siehe Kommentar bei handleDemoPageRoute.
  app.get("/demo/:pack([a-z0-9-]+)/:page([a-z0-9-]+)", handleDemoPageRoute);
  app.get("/demo/:pack([a-z0-9-]+)", handleDemoRoute);
  app.get(/^\/preview-ssr\/([A-Za-z0-9_-]{16,64})(\/.*)?$/, (req, res) => {
    void handlePreviewSsr(req, res);
  });
  // Legacy-Route der alten Preview-Page (Task 3, Cutover-Redirects): die
  // SPA rendert /preview/:token nicht mehr. Ziel ist NICHT /preview-ssr/:token
  // (die reine SSR-Vorschau hat keinen CTA), sondern das Studio — dort sieht
  // der Outreach-Empfänger dieselbe Vorschau UND (je nach Status) die
  // CheckoutBar bzw. bei einem v1-Dokument die LegacyCard „Website neu
  // erstellen", so bleibt der Funnel intakt. Absichtlich NICHT
  // `/preview/:token/onboarding` (endet mit $) — diese Route bleibt
  // SPA-seitig (Redirect auf /onboarding/:token, siehe App.tsx).
  app.get(/^\/preview\/([A-Za-z0-9_-]{16,64})$/, (req, res) => {
    res.redirect(302, `/onboarding/${req.params[0]}`);
  });
  app.use(handleCustomerSiteSsr);
}
