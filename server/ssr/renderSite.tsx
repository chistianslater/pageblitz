import { asSystemDoc } from "../../shared/designSystems/apply";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { openExternalLinksInNewTab } from "./externalLinks";
import { previewCtaTag, type PreviewCta } from "./previewCta";
import { SiteRenderer } from "../../client/src/components/site/SiteRenderer";
import type {
  Page,
  SectionOf,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import { hasActiveFeatures } from "../../client/src/components/site/islands/SiteIslands";
import { SITE_ENHANCER_JS } from "../../client/src/components/site/siteEnhancer";
import { getIslandsBundlePath, getMotionBundlePath } from "./islandsBundle";
import { pageForPathname } from "../../client/src/components/site/engine";
import { umamiScriptTag } from "../umami";
import {
  getSystem,
  systemHasMotion,
} from "../../shared/designSystems/registry";
import type { DesignSystemDef } from "../../shared/designSystems/types";
import { getPalette } from "../../shared/designSystems/palette";

export interface RenderSiteOptions {
  origin: string;
  /**
   * Vorschau-Leiste am unteren Rand (2026-09-05): nur die Preview-Route
   * setzt sie, Kundenseiten bleiben unberührt. Siehe previewCta.ts.
   */
  previewCta?: PreviewCta | null;
  pathname?: string;
  /**
   * Präfix für interne Links der Seite (Impressum/Datenschutz, Navigation).
   * "" für Subdomain-Sites (kunde.pageblitz.de/...), "/site/<slug>" für die
   * Pfadform (pageblitz.de/site/<slug>/...) — sonst führen die Links dort in
   * die Pageblitz-SPA statt zur Kundenseite.
   */
  basePath?: string;
  /**
   * Fester Zeitpunkt für datumsabhängige Elemente (z. B. "Heute
   * geöffnet"-Karten). Nur die Dev-Preview-Route übergibt hier ein fixes
   * Datum für deterministische Visual-Baselines — Kundenseiten-SSR bleibt
   * bei Echtzeit (Default `new Date()` in SiteRenderer).
   */
  now?: Date;
  /**
   * Slug der Kundenseite — geht an `SiteIslands` weiter (Formular-Action,
   * Hydration-Ziel). Preview-/Dev-Routen übergeben den Slug der jeweiligen
   * Website (Preview-Route) bzw. `"demo"` (Dev-Preview ohne echte Website).
   */
  slug?: string;
  /**
   * DB-Felder außerhalb des v2-Dokuments, die Inseln trotzdem brauchen —
   * aktuell nur `chatWelcomeMessage` (Spalte auf `generatedWebsites`, siehe
   * `server/routers.ts`, NICHT Teil von `WebsiteDataV2`/`features`). Geht
   * über `SiteRenderer` an `SiteIslands` → `ChatIsland` weiter.
   */
  site?: {
    chatWelcomeMessage?: string | null;
    showBranding?: boolean;
    /** FSK-18-Overlay (nur Live-Kundenseiten, nie Studio-Vorschau). */
    requiresAgeGate?: boolean;
  };
  /**
   * Reicht den Vorschau-Modus 1:1 an `SiteRenderer`/`SiteIslands` durch.
   * `undefined` (Default) lässt Inseln im Live-Modus rendern — so bleibt das
   * bisherige Verhalten von Kundenseiten-SSR und `/preview-ssr/:token`
   * unverändert. Nur die öffentliche System-Demo (`/demo/system/…`) übergibt
   * "preview", damit ein eventuell aktives Kontaktformular/Chat/Buchung dort
   * nichts absenden kann (siehe `SiteIslands` für die Preview-Semantik).
   */
  islandsMode?: "live" | "preview";
  /**
   * Vorschau-Platzhalter für fehlende Extras („Deine Preise", „Euer Team",
   * gestrichelte Kästen „Nur in deiner Vorschau"). Ohne Angabe wie bisher:
   * an bei Vorschau-Leiste oder islandsMode "preview". Die Preview-Route
   * setzt es ausdrücklich — an nur im Studio-iframe (`?studio=1`), aus im
   * neuen Tab (Betreiber 2026-10-13: „da sollten sie raus").
   */
  previewPlaceholders?: boolean;
  /**
   * Zeitmaschinen-Warte-UX (Plan B7 Task 4): true → die Sektionen der Seite
   * faden per CSS nacheinander ein (kompositor-freundlich: nur opacity/
   * transform; `prefers-reduced-motion` → statisch). NUR die Studio-
   * Vorschau (`/preview-ssr/:token?reveal=1`, gesetzt vom
   * GenerationScreen) übergibt das — die Live-Site bleibt ohne
   * Einblendungs-CSS.
   */
  sectionReveal?: boolean;
  /**
   * Umami-Website-ID (Plan B6 Task 7): gesetzt → cookieloses Tracking-Script
   * (`<script defer src=… data-website-id=…>`) im <head> jeder Seite
   * (Start, Unterseiten, Impressum/Datenschutz). Der Aufrufer übergibt sie
   * NUR für aktive Kundenseiten mit registrierter ID
   * (server/ssr/routes.ts) — Demo, Preview und nicht aktive Sites bleiben
   * ohne Script.
   */
  umamiWebsiteId?: string | null;
}

export interface RenderSiteResult {
  html: string;
  status: number;
}

function showPreviewPlaceholders(opts: RenderSiteOptions): boolean {
  return (
    opts.previewPlaceholders ??
    (Boolean(opts.previewCta) || opts.islandsMode === "preview")
  );
}

/** Schützt interpolierte Strings vor HTML-Injection (&, <, >, "). */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Vorlade-Links der selbst gehosteten Systemschriften (rev 3). Die
 * @font-face-Regeln bringt das Modul-CSS mit (siehe systems/journal/css.ts).
 */
export function systemFontHead(def: DesignSystemDef): string {
  return def.preload
    .map(
      f =>
        `<link rel="preload" href="/fonts/systems/${esc(f)}" as="font" type="font/woff2" crossorigin />`
    )
    .join("\n");
}

/**
 * Farbschema-Kopfzeilen für Systeme mit `scheme` (Nacht: dunkles Papier):
 * Browser-UI und Formularelemente dunkel, Adressleiste in Papierfarbe der
 * Palette. Systeme ohne `scheme` bekommen nichts (Ausgabe byte-gleich).
 */
export function systemSchemeHead(
  def: DesignSystemDef,
  paletteId: string | undefined
): string[] {
  if (!def.scheme) return [];
  const paper = getPalette(def, paletteId).paper;
  return [
    `<meta name="color-scheme" content="${esc(def.scheme)}" />`,
    `<meta name="theme-color" content="${esc(paper)}" />`,
  ];
}

/**
 * Systemdefinition eines Dokuments. Nach `asSystemDoc` trägt jedes Dokument
 * rev 3 und ein System; ein nicht registriertes System wirft (wie das
 * fehlende Modul in SiteRenderer).
 */
function systemOf(data: WebsiteDataV2): DesignSystemDef {
  const def = data.system ? getSystem(data.system) : undefined;
  if (!def) throw new Error(`Designsystem nicht registriert: ${data.system}`);
  return def;
}

/** Nur Designsysteme mit eigener Bewegung (`SYSTEMS_WITH_MOTION`) laden das Motion-Bundle. */
function usesMotionBundle(data: WebsiteDataV2): boolean {
  return systemHasMotion(systemOf(data).id);
}

/** Schrift-Kopfzeilen: selbst gehostete Systemschriften plus Farbschema. */
function fontHeadTags(data: WebsiteDataV2): string[] {
  const def = systemOf(data);
  return [systemFontHead(def), ...systemSchemeHead(def, data.palette)];
}

function findContact(data: WebsiteDataV2): SectionOf<"contact"> | undefined {
  return data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
}

function findHero(data: WebsiteDataV2): SectionOf<"hero"> | undefined {
  return data.sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
}

/**
 * Macht eine Bild-URL absolut, falls sie root-relativ ist ("/foo.png") —
 * `og:image` muss laut Open-Graph-Spec eine absolute URL sein, `SafeUrlSchema`
 * (siehe `shared/siteContract/schema.ts`) erlaubt aber auch root-relative
 * Pfade und Anker. Anker (`#...`) sind für ein Bildfeld nicht sinnvoll und
 * kommen bei `imageUrl` in der Praxis nicht vor; sie würden hier zu einer
 * (harmlosen, aber unbrauchbaren) `<origin>#...`-URL.
 */
function toAbsoluteUrl(origin: string, url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

function buildLocalBusinessJsonLd(data: WebsiteDataV2): string {
  const contact = findContact(data);
  const address =
    contact && (contact.street || contact.zip || contact.city)
      ? {
          "@type": "PostalAddress",
          streetAddress: contact.street,
          postalCode: contact.zip,
          addressLocality: contact.city,
          addressCountry: "DE",
        }
      : undefined;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: data.businessName,
    telephone: contact?.phone,
    email: contact?.email,
    address,
    aggregateRating: data.google
      ? {
          "@type": "AggregateRating",
          ratingValue: data.google.rating,
          reviewCount: data.google.reviewCount,
        }
      : undefined,
  };
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

/**
 * Meta/Canonical/OG + LocalBusiness-JSON-LD + System-Schriften für die
 * Haupt-Site. Das Inseln-CSS gehört NICHT hierher — `SiteIslands` bringt es
 * selbst als `<style>`-Kind mit (analog zu `mod.css` in `SiteRenderer`),
 * damit CSR-Vorschauen (Dashboard/Editor über `WebsiteRenderer`, die nie
 * durch `renderSiteHtml` laufen) dieselben gestylten Inseln bekommen wie das
 * SSR-HTML — eine Quelle statt zwei, die auseinanderlaufen können.
 */
function renderHead(
  data: WebsiteDataV2,
  canonicalUrl: string,
  origin: string
): string {
  const jsonLd = buildLocalBusinessJsonLd(data);
  const heroImageSrc = findHero(data)?.imageUrl;
  const tags = [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${esc(data.seo.title)}</title>`,
    `<meta name="description" content="${esc(data.seo.description)}" />`,
    `<link rel="canonical" href="${esc(canonicalUrl)}" />`,
    `<meta property="og:title" content="${esc(data.seo.title)}" />`,
    `<meta property="og:description" content="${esc(data.seo.description)}" />`,
    '<meta property="og:type" content="website" />',
  ];
  if (heroImageSrc) {
    const ogImage = toAbsoluteUrl(origin, heroImageSrc);
    tags.push(`<meta property="og:image" content="${esc(ogImage)}" />`);
    tags.push('<meta name="twitter:card" content="summary_large_image" />');
  }
  tags.push(
    ...fontHeadTags(data),
    `<script type="application/ld+json">${jsonLd}</script>`
  );
  return tags.join("\n");
}

/**
 * Meta/Canonical/OG-Kopf für eine Unterseite (Plan B6, Task 3): Titel/
 * Beschreibung kommen aus `page.seo` statt `data.seo`, `og:image` fällt auf
 * das Startseiten-Hero-Bild zurück (Unterseiten haben kein eigenes
 * Hero-Bild). Kein LocalBusiness-JSON-LD hier — das bleibt eine
 * Startseiten-Angelegenheit (Google erwartet das Structured-Data-Markup
 * primär auf der Hauptseite).
 */
function renderPageHead(
  data: WebsiteDataV2,
  page: Page,
  canonicalUrl: string,
  origin: string
): string {
  const heroImageSrc = findHero(data)?.imageUrl;
  const tags = [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${esc(page.seo.title)}</title>`,
    `<meta name="description" content="${esc(page.seo.description)}" />`,
    `<link rel="canonical" href="${esc(canonicalUrl)}" />`,
    `<meta property="og:title" content="${esc(page.seo.title)}" />`,
    `<meta property="og:description" content="${esc(page.seo.description)}" />`,
    '<meta property="og:type" content="website" />',
  ];
  if (heroImageSrc) {
    const ogImage = toAbsoluteUrl(origin, heroImageSrc);
    tags.push(`<meta property="og:image" content="${esc(ogImage)}" />`);
    tags.push('<meta name="twitter:card" content="summary_large_image" />');
  }
  tags.push(...fontHeadTags(data));
  return tags.join("\n");
}

/**
 * Rendert eine Unterseite (`data.pages[]`) statt der Startseite — gleiche
 * HTML-Hülle wie der Startseiten-Zweig unten, nur mit Page-Kopf
 * (`renderPageHead`) und `pathname` an `SiteRenderer` durchgereicht, damit
 * dort die Page-Sektionen statt der Startseiten-Sektionen rendern (siehe
 * SiteRenderer.tsx).
 */
function renderPageHtml(
  data: WebsiteDataV2,
  page: Page,
  canonicalUrl: string,
  pathname: string,
  basePath: string,
  opts: RenderSiteOptions
): RenderSiteResult {
  const includeIslands = hasActiveFeatures(data) && Boolean(opts.slug);
  const head = [
    renderPageHead(data, page, canonicalUrl, opts.origin),
    analyticsTag(opts),
    sectionRevealTag(opts),
  ]
    .filter(Boolean)
    .join("\n");
  const body = renderToStaticMarkup(
    <SiteRenderer
      data={data}
      basePath={basePath}
      now={opts.now}
      slug={opts.slug}
      site={opts.site}
      islandsMode={opts.islandsMode}
      preview={showPreviewPlaceholders(opts)}
      pathname={pathname}
    />
  );
  const canvasColor = getCanvasColor(data);
  const bodyParts = [
    openExternalLinksInNewTab(body),
    siteEnhancerTag(),
    previewCtaTag(opts.previewCta),
  ];
  if (usesMotionBundle(data)) {
    bodyParts.push(
      `<script type="module" src="${esc(getMotionBundlePath())}"></script>`
    );
  }
  if (includeIslands) {
    bodyParts.push(
      `<script type="module" src="${esc(getIslandsBundlePath())}" defer></script>`
    );
  }
  const html = `<!doctype html>
<html lang="de">
<head>
${head}
<style>html,body{margin:0;padding:0}body{background:${canvasColor}}</style>
</head>
<body>
${bodyParts.join("\n")}
</body>
</html>`;
  return { html, status: 200 };
}

/** Umami-Script-Tag für den <head> oder "" (siehe RenderSiteOptions). */
function analyticsTag(opts: RenderSiteOptions): string {
  return opts.umamiWebsiteId ? umamiScriptTag(opts.umamiWebsiteId) : "";
}

/**
 * Inline-Script für Scroll-Reveals + Galerie-Lightbox (2026-08-25) —
 * läuft auf JEDER Kundenseite, auch ohne gebuchte Add-ons (das Islands-
 * Bundle lädt nur bei Features). Inline statt eigenem Asset: kein
 * zusätzlicher Request, kein Caching-/Versionierungs-Problem.
 */
function siteEnhancerTag(): string {
  return `<script>${SITE_ENHANCER_JS}</script>`;
}

/**
 * Einblendungs-CSS für die Zeitmaschinen-Vorschau (RenderSiteOptions.
 * sectionReveal): jede Sektion fadet mit kleinem Versatz nacheinander ein.
 * Alle System-Module rendern ihre Inhalte als `<section>`-Elemente —
 * der generische Selektor greift daher systemübergreifend. Nur opacity/
 * transform (kompositor-freundlich); `prefers-reduced-motion` bekommt den
 * statischen Endzustand (kein `from`-Frame ohne Animation, da `both` nur
 * innerhalb der Animation wirkt).
 */
const SECTION_REVEAL_STYLE = `<style>@media (prefers-reduced-motion: no-preference){
.pb-site section{animation:pb-reveal 0.7s cubic-bezier(0.16,1,0.3,1) both}
.pb-site section:nth-of-type(2){animation-delay:.12s}
.pb-site section:nth-of-type(3){animation-delay:.24s}
.pb-site section:nth-of-type(4){animation-delay:.36s}
.pb-site section:nth-of-type(5){animation-delay:.48s}
.pb-site section:nth-of-type(n+6){animation-delay:.6s}
@keyframes pb-reveal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
}</style>`;

/** Einblendungs-Style-Tag für den <head> oder "" (siehe RenderSiteOptions). */
function sectionRevealTag(opts: RenderSiteOptions): string {
  return opts.sectionReveal ? SECTION_REVEAL_STYLE : "";
}

/** Canvas-Farbe (Body-Hintergrund hinter der Site): Papier der Palette. */
function getCanvasColor(data: WebsiteDataV2): string {
  return getPalette(systemOf(data), data.palette).paper;
}

/** Textfarbe der Rechtsseiten: Tinte der Palette. */
function getInkColor(data: WebsiteDataV2): string {
  return getPalette(systemOf(data), data.palette).ink;
}

/** Schlichte Meta-Hülle (Titel, Canonical) für Impressum/Datenschutz. */
function renderLegalHead(
  data: WebsiteDataV2,
  canonicalUrl: string,
  title: string
): string {
  return [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${esc(title)} — ${esc(data.businessName)}</title>`,
    `<link rel="canonical" href="${esc(canonicalUrl)}" />`,
  ].join("\n");
}

/**
 * Rendert eine Rechtsseite (Impressum/Datenschutz) im Rahmen des
 * Designsystems (Kopf, Fuß, Schrift, Palette). Fehlt der Inhalt, liefert der `status` 404 — der HTML-Fallback-Text
 * bleibt trotzdem menschenlesbar (Crawler sehen Status + Text konsistent).
 *
 * SICHERHEITS-INVARIANTE: `bodyHtml` (impressumHtml/datenschutzHtml, siehe
 * WebsiteDataV2Schema["legal"]) wird unten als `content` bewusst UNESCAPED
 * ins Markup interpoliert — same-origin mit dem Admin-Panel. In dieses Feld
 * darf ausschließlich systemgenerierter Output des legalGenerator gelangen,
 * niemals rohe Nutzereingabe.
 */
function renderLegalPage(
  data: WebsiteDataV2,
  canonicalUrl: string,
  title: string,
  bodyHtml: string | undefined,
  basePath: string,
  opts: RenderSiteOptions
): RenderSiteResult {
  const hasContent = Boolean(bodyHtml && bodyHtml.trim().length > 0);
  // Studio-Vorschau vor der Veröffentlichung (Betreiber-Wunsch 2026-08-31):
  // Impressum/Datenschutz entstehen erst im Schritt „Rechtliches" — statt
  // „nicht gefunden" ein erklärender Hinweis mit Status 200. Live-Seiten
  // behalten das 404-Verhalten.
  // Beide Pfadformen sind unsere internen Ansichten: /preview-ssr/<token>
  // (Studio, Postkarte) und /site/<slug> (Dashboard-Vorschau). Eine live
  // geschaltete Kundenseite laeuft auf eigener Domain mit leerem basePath
  // und behaelt bewusst den 404.
  const isPreview =
    basePath.startsWith("/preview-ssr/") || basePath.startsWith("/site/");
  const content = hasContent
    ? bodyHtml
    : isPreview
      ? `<h1>${esc(title)}</h1><p><strong>Keine Sorge — hier steht noch nichts.</strong></p><p>Das ${esc(title)} entsteht aus deinen Angaben, sobald du die Seite freischaltest. Dann ist hier alles fertig, und du musst dich um nichts kümmern.</p>`
      : "<p>Diese Seite wurde nicht gefunden.</p>";
  const status = hasContent || isPreview ? 200 : 404;
  // Rechtsseite im Rahmen der Seite (Kopf, Fuß, Schrift, Palette).
  const system = systemOf(data);
  const body = renderToStaticMarkup(
    <SiteRenderer
      data={data}
      basePath={basePath}
      now={opts.now}
      legal={{ title, html: content ?? "" }}
    />
  );
  const head = [
    renderLegalHead(data, canonicalUrl, title),
    systemFontHead(system),
    ...systemSchemeHead(system, data.palette),
    analyticsTag(opts),
  ]
    .filter(Boolean)
    .join("\n");
  const html = `<!doctype html>
<html lang="de">
<head>
${head}
<style>html,body{margin:0;padding:0}body{background:${getCanvasColor(data)};color:${getInkColor(data)}}</style>
</head>
<body>
${openExternalLinksInNewTab(body)}
</body>
</html>`;
  return { html, status };
}

/**
 * Rendert eine WebsiteDataV2 zu vollständigem HTML. Gibt neben dem Markup
 * auch den passenden HTTP-Status zurück — insbesondere 404, wenn eine
 * angeforderte Rechtsseite (Impressum/Datenschutz) keinen Inhalt hat, statt
 * das immer als 200 zu senden.
 */
export function renderSiteHtml(
  input: WebsiteDataV2,
  opts: RenderSiteOptions
): RenderSiteResult {
  // Lesegrenze: ganz oben wandeln, damit Kopf (Schriften, Farben) und Körper
  // dasselbe System sehen. rev 3 bleibt dasselbe Objekt (Byte-Gleichheit).
  const data = asSystemDoc(input);
  const pathname = opts.pathname ?? "/";
  const basePath = opts.basePath ?? "";
  // Canonical muss die tatsächliche Adresse der Seite sein — in der Pfadform
  // (/site/:slug) also inklusive basePath, sonst zeigt z. B.
  // /site/<slug>/impressum kanonisch auf pageblitz.de/impressum (Final-Review
  // B6, Teil A). Startseite: basePath oder "/" ohne doppelten Slash.
  const canonicalUrl = `${opts.origin}${basePath}${
    pathname === "/" ? (basePath ? "" : "/") : pathname
  }`;

  if (pathname === "/impressum") {
    return renderLegalPage(
      data,
      canonicalUrl,
      "Impressum",
      data.legal?.impressumHtml,
      basePath,
      opts
    );
  }
  if (pathname === "/datenschutz") {
    return renderLegalPage(
      data,
      canonicalUrl,
      "Datenschutz",
      data.legal?.datenschutzHtml,
      basePath,
      opts
    );
  }

  // Unterseite (Plan B6, Task 3): jeder andere Pfad, der zu `data.pages[]`
  // passt, rendert die Page statt der Startseite. Ein Pfad ohne Treffer
  // (inkl. "/") fällt auf den Startseiten-Zweig unten durch — Aufrufer
  // (server/ssr/routes.ts) prüfen die Pfad-Gültigkeit selbst und rufen
  // renderSiteHtml nur mit bekannten Pfaden auf.
  if (pathname !== "/") {
    const page = pageForPathname(data, pathname);
    if (page) {
      return renderPageHtml(data, page, canonicalUrl, pathname, basePath, opts);
    }
  }

  // Deckt sich mit SiteIslands' eigener Render-Bedingung (Features aktiv UND
  // ein Slug vorhanden) — sonst würde der Bundle-Tag geladen, obwohl gar
  // keine Insel im Markup steht.
  const includeIslands = hasActiveFeatures(data) && Boolean(opts.slug);
  const head = [
    renderHead(data, canonicalUrl, opts.origin),
    analyticsTag(opts),
    sectionRevealTag(opts),
  ]
    .filter(Boolean)
    .join("\n");
  const body = renderToStaticMarkup(
    <SiteRenderer
      data={data}
      basePath={basePath}
      now={opts.now}
      slug={opts.slug}
      site={opts.site}
      islandsMode={opts.islandsMode}
      preview={showPreviewPlaceholders(opts)}
    />
  );

  const canvasColor = getCanvasColor(data);
  const bodyParts = [
    openExternalLinksInNewTab(body),
    siteEnhancerTag(),
    previewCtaTag(opts.previewCta),
  ];
  if (usesMotionBundle(data)) {
    bodyParts.push(
      `<script type="module" src="${esc(getMotionBundlePath())}"></script>`
    );
  }
  if (includeIslands) {
    bodyParts.push(
      `<script type="module" src="${esc(getIslandsBundlePath())}" defer></script>`
    );
  }
  const html = `<!doctype html>
<html lang="de">
<head>
${head}
<style>html,body{margin:0;padding:0}body{background:${canvasColor}}</style>
</head>
<body>
${bodyParts.join("\n")}
</body>
</html>`;
  return { html, status: 200 };
}
