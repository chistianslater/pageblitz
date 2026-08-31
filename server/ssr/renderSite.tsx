import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteRenderer } from "../../client/src/components/site/SiteRenderer";
import "../../client/src/components/site/packs/index";
import { getConstitution, getFontPair } from "../../shared/stylePacks";
import type { FontSpec } from "../../shared/stylePacks";
import type {
  Page,
  SectionOf,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import { hasActiveFeatures } from "../../client/src/components/site/islands/SiteIslands";
import { SITE_ENHANCER_JS } from "../../client/src/components/site/siteEnhancer";
import { getIslandsBundlePath } from "./islandsBundle";
import { pageForPathname } from "../../client/src/components/site/engine";
import { umamiScriptTag } from "../umami";

export interface RenderSiteOptions {
  origin: string;
  pathname?: string;
  /**
   * Präfix für interne Pack-Links (Impressum/Datenschutz, Legal-Zurück-Link).
   * "" für Subdomain-Sites (kunde.pageblitz.de/...), "/site/<slug>" für die
   * Pfadform (pageblitz.de/site/<slug>/...) — sonst führen die Links dort in
   * die Pageblitz-SPA statt zur Kundenseite.
   */
  basePath?: string;
  /**
   * Fester Zeitpunkt für datumsabhängige Pack-Elemente (z. B. "Heute
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
  site?: { chatWelcomeMessage?: string | null; showBranding?: boolean };
  /**
   * Reicht den Vorschau-Modus 1:1 an `SiteRenderer`/`SiteIslands` durch.
   * `undefined` (Default) lässt Inseln im Live-Modus rendern — so bleibt das
   * bisherige Verhalten von Kundenseiten-SSR und `/preview-ssr/:token`
   * unverändert. Nur die öffentliche Pack-Demo (`/demo/:pack`) übergibt
   * "preview", damit ein eventuell aktives Kontaktformular/Chat/Buchung dort
   * nichts absenden kann (siehe `SiteIslands` für die Preview-Semantik).
   */
  islandsMode?: "live" | "preview";
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

/** Schützt interpolierte Strings vor HTML-Injection (&, <, >, "). */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Baut die einzige Google-Fonts-css2-URL aus den Fonts der Pack-Verfassung. */
function buildFontsUrl(fonts: (FontSpec | undefined)[]): string {
  const families = fonts
    .filter((f): f is FontSpec => Boolean(f))
    .map(f => `family=${f.googleCss}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Fonts eines Dokuments: Pack-Verfassung, wobei eine gewählte Schriftpaarung
 * (WebsiteDataV2.fontPairId, Studio-Theme-Editor) display/body ersetzt —
 * dieselbe Ersetzung wie in `toCssVars`, damit Head-Link und gerenderte
 * CSS-Variablen nie auseinanderlaufen. CSR-Pendant: packFontHrefs.
 */
function fontsForDoc(data: WebsiteDataV2): (FontSpec | undefined)[] {
  const constitution = getConstitution(data.stylePackId);
  const pair = getFontPair(data.fontPairId);
  return [
    pair?.display ?? constitution.type.display,
    pair?.body ?? constitution.type.body,
    constitution.type.utility,
  ];
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
 * Meta/Canonical/OG + LocalBusiness-JSON-LD + Pack-Fonts-Link für die
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
  const fontsUrl = buildFontsUrl(fontsForDoc(data));
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
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link rel="stylesheet" href="${esc(fontsUrl)}" />`,
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
  const fontsUrl = buildFontsUrl(fontsForDoc(data));
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
  tags.push(
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link rel="stylesheet" href="${esc(fontsUrl)}" />`
  );
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
      pathname={pathname}
    />
  );
  const canvasColor = getCanvasColor(data);
  const bodyParts = [body, siteEnhancerTag()];
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
 * Alle 14 Pack-Module rendern ihre Inhalte als `<section>`-Elemente —
 * der generische Selektor greift daher packübergreifend. Nur opacity/
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

/**
 * Canvas-Farbe (Body-Hintergrund hinter der Site): Farbwelt-Override
 * gewinnt vor der Verfassung — sonst blitzt bei dunklen Welten der helle
 * Pack-Standard als Streifen über der Navigation/beim Overscroll durch.
 */
function getCanvasColor(data: WebsiteDataV2): string {
  return getRoleColor(data, "canvas", "#ffffff");
}

/** Textfarbe der Rechtsseiten — folgt der Farbwelt wie die Canvas. */
function getInkColor(data: WebsiteDataV2): string {
  return getRoleColor(data, "ink", "#111111");
}

function getRoleColor(
  data: WebsiteDataV2,
  role: "canvas" | "ink",
  fallback: string
): string {
  const override = data.colorOverrides?.[role];
  if (override && /^#[0-9a-fA-F]{6}$/.test(override)) return override;
  try {
    const constitution = getConstitution(data.stylePackId as any);
    const entry = constitution.palette.find(c => c.role === role);
    return entry?.hex ?? fallback;
  } catch {
    return fallback;
  }
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
 * Rendert eine schlichte Rechtsseite (Impressum/Datenschutz) statt der vollen
 * Site. Fehlt der Inhalt, liefert der `status` 404 — der HTML-Fallback-Text
 * bleibt trotzdem menschenlesbar (Crawler sehen Status + Text konsistent).
 *
 * SICHERHEITS-INVARIANTE: `bodyHtml` (impressumHtml/datenschutzHtml, siehe
 * WebsiteDataV2Schema["legal"]) wird unten als `content` bewusst UNESCAPED
 * in `html` interpoliert — same-origin mit dem Admin-Panel. In dieses Feld
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
  const isPreview = basePath.startsWith("/preview-ssr/");
  const content = hasContent
    ? bodyHtml
    : isPreview
      ? `<h1>${esc(title)}</h1><p><strong>Diese Seite wird nach der Veröffentlichung sichtbar.</strong></p><p>Pageblitz erzeugt ${esc(title)} automatisch aus deinen Angaben im Schritt „Rechtliches“ — sobald deine Website freigeschaltet ist, steht die Seite hier.</p>`
      : "<p>Diese Seite wurde nicht gefunden.</p>";
  const backHref = basePath || "/";
  const canvasColor = getCanvasColor(data);
  const html = `<!doctype html>
<html lang="de">
<head>
${[renderLegalHead(data, canonicalUrl, title), analyticsTag(opts)].filter(Boolean).join("\n")}
<style>html,body{margin:0;padding:0}body{background:${canvasColor};color:${getInkColor(data)}}.pb-legal a{color:inherit}</style>
</head>
<body>
<div class="pb-legal">
<a href="${esc(backHref)}">&larr; Zurück zur Startseite</a>
${content}
</div>
</body>
</html>`;
  return { html, status: hasContent || isPreview ? 200 : 404 };
}

/**
 * Rendert eine WebsiteDataV2 zu vollständigem HTML. Gibt neben dem Markup
 * auch den passenden HTTP-Status zurück — insbesondere 404, wenn eine
 * angeforderte Rechtsseite (Impressum/Datenschutz) keinen Inhalt hat, statt
 * das immer als 200 zu senden.
 */
export function renderSiteHtml(
  data: WebsiteDataV2,
  opts: RenderSiteOptions
): RenderSiteResult {
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
    />
  );

  const canvasColor = getCanvasColor(data);
  const bodyParts = [body, siteEnhancerTag()];
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
