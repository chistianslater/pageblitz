import type { Express, NextFunction, Request, Response } from "express";
import { handleKurzlink } from "../postkarten/route";
import { sdk } from "../_core/sdk";
import { findeKarteNachCode, scanErfassen } from "../postkarten/db";
import { renderSiteHtml } from "./renderSite";
import { SYSTEM_MODULES } from "../../client/src/components/site/systems/registry";
import { renderNotFoundHtml } from "./notFoundPage";
import { getFixture } from "../../shared/siteContract/fixtures";
import {
  DESIGN_SYSTEM_IDS,
  getSystem,
  asSystemDoc,
  withDesignSystem,
  withPrimarySystem,
  type DesignSystemDef,
  type DesignSystemId,
} from "../../shared/designSystems";
import {
  findShowcase,
  showcasePrimarySystem,
  systemShowcaseDoc,
  SHOWCASES,
  type Showcase,
} from "../../shared/showcases/blueprintShowcase";
import { WebsiteDataV2Schema } from "../../shared/siteContract/schema";
import {
  PACK_IDS,
  type PackId,
  type WebsiteDataV2,
} from "../../shared/siteContract/types";
import { getWebsiteBySlug, getWebsiteByToken, getWebsiteVersion } from "../db";
import { restoreDoc } from "../onboardingV2/versions";
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

/** Fixture-Schlüssel (historisch Pack-IDs) — nur noch für Fixtures/Seeds. */
function isKnownPackId(value: string): value is PackId {
  return (PACK_IDS as readonly string[]).includes(value);
}

function isFixtureKind(
  value: string
): value is "full" | "minimal" | "features" {
  return value === "full" || value === "minimal" || value === "features";
}

/**
 * `?system=&palette=` für Vorschauen: nur gebaute Systeme (Freischaltung ist
 * für Vorschauen nicht nötig) und deren Paletten. `undefined` = kein System
 * verlangt; `null` = ungültig, 400 ist schon gesendet — der Parameter wird
 * nie in die Antwort gespiegelt.
 */
function readSystemQuery(
  req: Request,
  res: Response
): { system: DesignSystemId; palette?: string } | undefined | null {
  const systemParam = typeof req.query.system === "string" ? req.query.system : "";
  if (!systemParam) return undefined;
  const def = renderableSystem(systemParam);
  if (!def) {
    res.status(400).type("text/plain").send("Unbekanntes System");
    return null;
  }
  const paletteParam =
    typeof req.query.palette === "string" ? req.query.palette : "";
  if (paletteParam && !def.palettes.some(p => p.id === paletteParam)) {
    res.status(400).type("text/plain").send("Unbekannte Palette");
    return null;
  }
  return { system: def.id, palette: paletteParam || undefined };
}

/**
 * Gebautes System: Tokens registriert UND Render-Modul vorhanden. Ein System
 * mit Tokens, aber noch ohne Modul (Nacht ab N1, bis N2), gilt als nicht
 * gebaut — 400/404 statt Absturz im SiteRenderer.
 */
function renderableSystem(id: string): DesignSystemDef | undefined {
  if (!(DESIGN_SYSTEM_IDS as readonly string[]).includes(id)) return undefined;
  const system = id as DesignSystemId;
  return SYSTEM_MODULES[system] ? getSystem(system) : undefined;
}

/**
 * Studio-Live-Preview: rendert das gespeicherte v2-Dokument per previewToken
 * (Zugangsgeheimnis, nanoid 32) — ungecacht (jeder Patch soll sofort sichtbar
 * sein), noindex, optional mit System-Override (?system=&palette=) für die
 * Designwahl. Der Override verändert NIE das gespeicherte Dokument. Seit Plan B6 (Task 3)
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
  const systemQuery = readSystemQuery(req, res);
  if (systemQuery === null) return;
  // Verlauf (2026-09-03): ?version=<id> rendert einen gespeicherten Stand
  // aus website_versions statt des aktuellen Dokuments — nur lesen, nie
  // schreiben, und nur Stände derselben Website (getWebsiteVersion prüft
  // die websiteId). Ungültige Werte → 400 ohne Reflektion (s. o.).
  const versionParam =
    typeof req.query.version === "string" ? req.query.version : "";
  if (versionParam && !/^\d{1,10}$/.test(versionParam)) {
    res.status(400).type("text/plain").send("Ungültiger Stand");
    return;
  }
  try {
    const website = await getWebsiteByToken(token);
    if (!website || !website.websiteData) {
      res.status(404).send("Vorschau nicht gefunden");
      return;
    }
    const parsedCurrent = WebsiteDataV2Schema.safeParse(website.websiteData);
    let parsed = parsedCurrent;
    if (versionParam) {
      const version = await getWebsiteVersion(website.id, Number(versionParam));
      if (!version) {
        res.status(404).send("Stand nicht gefunden");
        return;
      }
      // Stand-Vorschau = genau das, was „Wiederherstellen“ schreiben würde:
      // Inhalte des Stands, System/Palette laut restoreDoc (E1).
      const parsedVersion = WebsiteDataV2Schema.safeParse(version.doc);
      parsed =
        parsedVersion.success && parsedCurrent.success
          ? {
              success: true,
              data: restoreDoc(
                asSystemDoc(parsedCurrent.data),
                parsedVersion.data
              ),
            }
          : parsedVersion;
    }
    if (!parsed.success) {
      res.status(404).send("Noch keine Website im neuen Format");
      return;
    }
    if (!isKnownSitePathname(parsed.data, pathname)) {
      res.status(404).send("Vorschau-Seite nicht gefunden");
      return;
    }
    // ?system=&palette= zeigt eine Alternative der Designwahl; nur Vorschau,
    // nichts wird gespeichert. Pack-Parameter (?pack=&variant=&font=) gibt
    // es seit dem Entfernen der Packs nicht mehr — sie werden ignoriert.
    const data = systemQuery
      ? withDesignSystem(parsed.data, systemQuery.system, systemQuery.palette)
      : parsed.data;
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const basePath = `/preview-ssr/${token}`;
    const { html, status } = renderSiteHtml(data, {
      origin,
      pathname,
      basePath,
      slug: website.slug,
      site: {
        chatWelcomeMessage: website.chatWelcomeMessage,
        showBranding: website.showBranding !== false,
      },
      // Postkarten-Funnel (2026-09-05): Der QR-Code führt auf die fertige
      // Seite, die Leiste ist der Weg ins Studio. Im Studio-iframe blendet
      // sie sich selbst aus (previewCta.ts).
      previewCta: {
        businessName: data.businessName,
        studioHref: `/onboarding/${token}`,
      },
      // Zeitmaschine (Plan B7 Task 4): Der GenerationScreen hängt ?reveal=1
      // an, damit die Sektionen des frisch geschriebenen (Zwischen-)Stands
      // sichtbar einfaden. Nur diese Preview-Route kennt den Parameter —
      // Kundenseiten-SSR bleibt ohne Einblendungs-CSS.
      sectionReveal: req.query.reveal === "1",
      // Gestrichelte Platzhalter („Nur in deiner Vorschau") nur im
      // Studio-iframe (buildPreviewSrc hängt ?studio=1 an). „In neuem Tab
      // öffnen", geteilte Links und Postkarten zeigen die Seite wie live.
      previewPlaceholders: req.query.studio === "1",
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

/** Dev-Text kurz genug, sonst ignoriert (React escapt den Text). */
const devText = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() && v.trim().length <= max
    ? v.trim()
    : undefined;

/**
 * Dev-only (Bildvergleich Umbruch): `?headline=` große Zeile des Einstiegs,
 * `?kapitel=` Titel der Leistungen, `?leistung=` Name der ersten Leistung,
 * `?stimme=` Text aller Bewertungen, `?ohnefoto=1` Einstieg ohne Foto.
 */
export function withDevTexts(
  doc: WebsiteDataV2,
  query: Request["query"]
): WebsiteDataV2 {
  const headline = devText(query.headline, 90);
  const kapitel = devText(query.kapitel, 60);
  const noPhoto = query.ohnefoto === "1";
  const leistung = devText(query.leistung, 60);
  const stimme = devText(query.stimme, 200);
  if (!headline && !kapitel && !noPhoto && !leistung && !stimme) return doc;
  return {
    ...doc,
    sections: doc.sections.map(s => {
      if (s.type === "hero")
        return {
          ...s,
          ...(headline ? { headline } : {}),
          ...(noPhoto ? { imageUrl: undefined } : {}),
        };
      if (s.type === "services" && (kapitel || leistung))
        return {
          ...s,
          ...(kapitel ? { headline: kapitel } : {}),
          ...(leistung
            ? {
                items: s.items.map((item, i) =>
                  i === 0 ? { ...item, title: leistung } : item
                ),
              }
            : {}),
        };
      if (s.type === "testimonials" && stimme)
        return { ...s, items: s.items.map(item => ({ ...item, text: stimme })) };
      return s;
    }),
  };
}

/**
 * GET /dev/site-preview?system=<id>&palette=<id>&pack=<fixture>&fixture=<full|minimal|features>&seite=<page-slug>
 * — nur außerhalb production. `?pack=` wählt nur noch die Fixture (Schlüssel
 * = Textstimme, Standard `salon-noir`); ohne `?system=` rendert das
 * Hauptsystem der Fixture. `?seite=` rendert eine Unterseite der Fixture
 * (nur bekannte, sonst 404). Parameter werden nie in die Antwort gespiegelt
 * (Ausnahme Dev-Texte `name`, `headline`, `kapitel`, `leistung`, `stimme` —
 * escapt, Länge begrenzt).
 */
function handleDevPreview(req: Request, res: Response): void {
  if (process.env.NODE_ENV === "production") {
    res.status(404).send("Not found");
    return;
  }

  const systemQuery = readSystemQuery(req, res);
  if (systemQuery === null) return;
  const packParam = typeof req.query.pack === "string" ? req.query.pack : "";
  const fixtureParam =
    typeof req.query.fixture === "string" ? req.query.fixture : "full";
  if (packParam && !isKnownPackId(packParam)) {
    res.status(400).type("text/plain").send("Unbekannte Fixture");
    return;
  }
  if (!isFixtureKind(fixtureParam)) {
    res
      .status(400)
      .type("text/plain")
      .send("Unbekannte Fixture (erwartet: full|minimal|features)");
    return;
  }

  try {
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const fixture = getFixture(
      isKnownPackId(packParam) ? packParam : "salon-noir",
      fixtureParam
    );
    // Dev-only: anderer Betriebsname (lange Namen im Bildvergleich, z. B.
    // Fuß-Wortmarke). React escapt den Text; Länge begrenzt.
    const nameParam =
      typeof req.query.name === "string" ? req.query.name.trim() : "";
    const named =
      nameParam && nameParam.length <= 80
        ? { ...fixture, businessName: nameParam }
        : fixture;
    const base = withDevTexts(named, req.query);
    // Fixtures sind keine Betriebe: ohne `?palette` immer die erste
    // Farbstimmung des Systems (stabile Bildvergleiche), nicht die
    // Standard-Regel neuer Seiten [E3].
    const system = systemQuery?.system ?? withPrimarySystem(base).system!;
    const data = withDesignSystem(
      base,
      system,
      systemQuery?.palette ?? getSystem(system)!.palettes[0].id
    );
    const seite = typeof req.query.seite === "string" ? req.query.seite : "";
    const page = seite ? pageForPathname(data, `/${seite}`) : null;
    if (seite && !page) {
      res.status(404).type("text/plain").send("Unbekannte Seite");
      return;
    }
    // fixes Datum für deterministische Visual-Baselines (nur Dev-Preview,
    // Kundenseiten-SSR bleibt bei Echtzeit).
    const { html, status } = renderSiteHtml(data, {
      origin,
      ...(page ? { pathname: `/${page.slug}` } : {}),
      now: new Date("2026-08-19T10:00:00"),
      slug: "demo",
      site: { chatWelcomeMessage: "Willkommen in der Demo!" },
    });
    res.status(status).type("html").send(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fixture-Fehler";
    res.status(400).type("text/plain").send(message);
  }
}

/** Cache-Dauer für die öffentlichen Demos (statisches HTML, ändert sich zur Laufzeit nie). */
const DEMO_CACHE_CONTROL = "public, max-age=3600";

/** Beispiel für `/demo/raster` — keine Fixture `raster` unter den Beispielen. */
const LEGACY_DEMO_FALLBACK_SHOWCASE = "steuerberater";

const systemDemoPathCache = new Map<string, string>();

/**
 * Adresse eines Beispielbetriebs in seinem Hauptsystem
 * (`/demo/system/<Hauptsystem>/<Beispiel>`), einmal berechnet je Beispiel.
 */
export function systemDemoPath(showcase: Showcase): string {
  const cached = systemDemoPathCache.get(showcase.id);
  if (cached) return cached;
  const primary = showcasePrimarySystem(showcase);
  const path = `/demo/system/${primary}/${showcase.id}`;
  systemDemoPathCache.set(showcase.id, path);
  return path;
}

/**
 * Ziel der alten Pack-Demo `/demo/<pack>` [E9]: erstes Beispiel mit dieser
 * Fixture in seinem Hauptsystem; `raster` → Steuerberater. Unbekannt →
 * `undefined` (404 ohne Reflektieren).
 */
export function legacyDemoTarget(pack: string): string | undefined {
  if (!isKnownPackId(pack)) return undefined;
  const showcase =
    SHOWCASES.find(s => s.fixture === pack) ??
    findShowcase(LEGACY_DEMO_FALLBACK_SHOWCASE);
  return showcase ? systemDemoPath(showcase) : undefined;
}

/**
 * Alte Pack-Demos (`/demo/:pack`, Unter- und Rechtsseiten): 301 auf die
 * System-Demo [E9]. Die Route-Regex `:pack([a-z0-9-]+)` matcht nur
 * Pack-ID-artige Segmente — statische Dateien unter `client/public/demo/`
 * (z. B. `/demo/werkbank-hero.webp`) fallen auf die Static-Middleware
 * durch. Unbekannt → 404, der Parameter wird nie gespiegelt.
 */
function handleLegacyDemoRedirect(req: Request, res: Response): void {
  const target = legacyDemoTarget(String(req.params.pack ?? ""));
  if (!target) {
    res.status(404).type("text/plain").send("Unbekannte Demo");
    return;
  }
  res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
  res.redirect(301, target);
}

/** Alte Bauplan-Übersicht (`/demo/bauplan/:id/:entry`): 301 auf die System-Demo. */
function handleBauplanDemoRedirect(req: Request, res: Response): void {
  const showcase = findShowcase(String(req.params.id ?? ""));
  if (!showcase) {
    res.status(404).type("text/plain").send("Unbekannte Demo");
    return;
  }
  res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
  res.redirect(301, systemDemoPath(showcase));
}

/**
 * System-Übersicht (`/demo/system/:system/:id`): Beispielbetrieb im
 * Designsystem, `?palette=`; Standard = Vorschau, `?live=1` fertige Seite.
 * Nur gebaute Systeme (Freischaltung nicht nötig), sonst 404.
 */
function handleSystemDemoRoute(req: Request, res: Response): void {
  const systemParam = String(req.params.system ?? "");
  const def = renderableSystem(systemParam);
  const showcase = findShowcase(String(req.params.id ?? ""));
  if (!def || !showcase) {
    res.status(404).type("text/plain").send("Unbekannte Vorschau");
    return;
  }
  const paletteParam =
    typeof req.query.palette === "string" ? req.query.palette : "";
  const palette = def.palettes.some(p => p.id === paletteParam)
    ? paletteParam
    : undefined;
  try {
    const data = systemShowcaseDoc(showcase, def.id, palette);
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const live = req.query.live === "1";
    const { html, status } = renderSiteHtml(data, {
      origin,
      basePath: `/demo/system/${def.id}/${showcase.id}`,
      slug: "demo",
      site: {},
      ...(live ? {} : { islandsMode: "preview" as const }),
      now: new Date("2026-08-19T10:00:00"),
    });
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", DEMO_CACHE_CONTROL);
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] System-Demo-Render fehlgeschlagen:", err);
    res.status(500).send("Demo konnte nicht gerendert werden");
  }
}

/** Hinweis auf den Demo-Rechtsseiten: der Beispielbetrieb ist erfunden. */
const DEMO_LEGAL_NOTICE =
  "<p>Beispielseite – dieser Betrieb ist erfunden. Echte Rechtstexte (Impressum, Datenschutz) werden automatisch erzeugt, sobald für ein Unternehmen eine Website erstellt wird.</p>";

/**
 * Demo-Rechtsseiten (`/demo/system/:system/:id/impressum|datenschutz`): wie
 * die Demo-Seite, aber `legal` trägt den Beispiel-Hinweis, damit die
 * Footer-Links der Demo auf Inhalt statt 404 treffen. Unbekanntes
 * System/Beispiel → 404 ohne Spiegeln der Parameter.
 */
function handleSystemDemoLegalRoute(req: Request, res: Response): void {
  const def = renderableSystem(String(req.params.system ?? ""));
  const showcase = findShowcase(String(req.params.id ?? ""));
  if (!def || !showcase) {
    res.status(404).type("text/plain").send("Unbekannte Vorschau");
    return;
  }
  const paletteParam =
    typeof req.query.palette === "string" ? req.query.palette : "";
  const palette = def.palettes.some(p => p.id === paletteParam)
    ? paletteParam
    : undefined;
  try {
    const data = {
      ...systemShowcaseDoc(showcase, def.id, palette),
      legal: {
        impressumHtml: DEMO_LEGAL_NOTICE,
        datenschutzHtml: DEMO_LEGAL_NOTICE,
      },
    };
    const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
    const { html, status } = renderSiteHtml(data, {
      origin,
      basePath: `/demo/system/${def.id}/${showcase.id}`,
      pathname:
        req.params.page === "datenschutz" ? "/datenschutz" : "/impressum",
      slug: "demo",
      site: {},
      islandsMode: "preview",
      now: new Date("2026-08-19T10:00:00"),
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
  const isAdminDemo = siteRequest.slug.startsWith("admin-demo-");
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
      site: {
        chatWelcomeMessage: website.chatWelcomeMessage,
        showBranding: website.showBranding !== false,
        requiresAgeGate: website.requiresAgeGate === true,
      },
      // Cookieloses Umami-Tracking nur für aktive Sites mit registrierter
      // ID (Plan B6 Task 7; ID kommt aus server/umamiProvisioning.ts, die
      // nach dem Write den Cache hier invalidiert).
      umamiWebsiteId:
        website.status === "active" && !isAdminDemo
          ? website.umamiWebsiteId
          : null,
    });
    siteHtmlCache.set(cacheKey, {
      html,
      status,
      at: now,
      robotsNoindex: isAdminDemo,
    });
    capCacheSize(siteHtmlCache, MAX_CACHE_ENTRIES);
    if (isAdminDemo) {
      res.setHeader("X-Robots-Tag", "noindex");
    }
    res.status(status).type("html").send(html);
  } catch (err) {
    console.error("[SSR] Kundenseiten-Render fehlgeschlagen:", err);
    next();
  }
}

export function registerSsrRoutes(app: Express): void {
  // Kurz-Link der Postkarte (2026-09-09): zaehlt den Aufruf und leitet in
  // die Design-Auswahl des Studios weiter (seit 2026-09-18, vorher direkt
  // auf die Vorschau). Vor den Token-Routen, damit /k/ nie als Token
  // missverstanden wird.
  app.get("/k/:code([A-Za-z0-9]{3,12})", (req, res) =>
    handleKurzlink(req, res, {
      findeKarte: findeKarteNachCode,
      erfasseScan: scanErfassen,
      istAdmin: async r => (await sdk.authenticateRequest(r))?.role === "admin",
    })
  );
  app.get("/dev/site-preview", handleDevPreview);
  // Vor den alten Pack-Demos: sonst fängt /demo/:pack/:page „bauplan/…" ab.
  app.get(
    "/demo/bauplan/:id([a-z0-9-]+)/:entry(stage|colorfield)",
    handleBauplanDemoRedirect
  );
  app.get(
    "/demo/system/:system([a-z]+)/:id([a-z0-9-]+)/:page(impressum|datenschutz)",
    handleSystemDemoLegalRoute
  );
  app.get(
    "/demo/system/:system([a-z]+)/:id([a-z0-9-]+)",
    handleSystemDemoRoute
  );
  // Alte Pack-Demos samt Unter-/Rechtsseiten → 301 auf die System-Demo [E9].
  app.get("/demo/:pack([a-z0-9-]+)/:page([a-z0-9-]+)", handleLegacyDemoRedirect);
  app.get("/demo/:pack([a-z0-9-]+)", handleLegacyDemoRedirect);
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
