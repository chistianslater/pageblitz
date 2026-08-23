import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteRenderer } from "../../client/src/components/site/SiteRenderer";
import "../../client/src/components/site/packs/index";
import { getConstitution } from "../../shared/stylePacks";
import type { FontSpec } from "../../shared/stylePacks";
import type {
  Page,
  SectionOf,
  WebsiteDataV2,
} from "../../shared/siteContract/types";
import { hasActiveFeatures } from "../../client/src/components/site/islands/SiteIslands";
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
  site?: { chatWelcomeMessage?: string | null };
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
  const constitution = getConstitution(data.stylePackId);
  const fontsUrl = buildFontsUrl([
    constitution.type.display,
    constitution.type.body,
    constitution.type.utility,
  ]);
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
  const constitution = getConstitution(data.stylePackId);
  const fontsUrl = buildFontsUrl([
    constitution.type.display,
    constitution.type.body,
    constitution.type.utility,
  ]);
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
  const canvasColor = getCanvasColor(data.stylePackId);
  const bodyParts = [body];
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

/** Hole die Canvas-Farbe (Hintergrund) aus der Verfassung. */
function getCanvasColor(packId: string): string {
  try {
    const constitution = getConstitution(packId as any);
    const canvasEntry = constitution.palette.find(c => c.role === "canvas");
    return canvasEntry?.hex ?? "#ffffff";
  } catch {
    return "#ffffff";
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
  const content = hasContent
    ? bodyHtml
    : "<p>Diese Seite wurde nicht gefunden.</p>";
  const backHref = basePath || "/";
  const canvasColor = getCanvasColor(data.stylePackId);
  const html = `<!doctype html>
<html lang="de">
<head>
${[renderLegalHead(data, canonicalUrl, title), analyticsTag(opts)].filter(Boolean).join("\n")}
<style>html,body{margin:0;padding:0}body{background:${canvasColor}}</style>
</head>
<body>
<div class="pb-legal">
<a href="${esc(backHref)}">&larr; Zurück zur Startseite</a>
${content}
</div>
</body>
</html>`;
  return { html, status: hasContent ? 200 : 404 };
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
  const head = [renderHead(data, canonicalUrl, opts.origin), analyticsTag(opts)]
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

  const canvasColor = getCanvasColor(data.stylePackId);
  const bodyParts = [body];
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
