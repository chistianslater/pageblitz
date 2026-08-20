import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteRenderer } from "../../client/src/components/site/SiteRenderer";
import "../../client/src/components/site/packs/index";
import { getConstitution } from "../../shared/stylePacks";
import type { FontSpec } from "../../shared/stylePacks";
import type { SectionOf, WebsiteDataV2 } from "../../shared/siteContract/types";

export interface RenderSiteOptions {
  origin: string;
  pathname?: string;
}

/** Schützt interpolierte Strings vor HTML-Injection (&, <, >, "). */
function esc(value: string): string {
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

/** Inline-Toggle für die mobile Navigation — kein React im Browser. */
const MOBILE_NAV_SCRIPT = `document.querySelectorAll("[data-nav-toggle]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll("[data-nav]").forEach(function (nav) {
      nav.classList.toggle("is-open");
    });
  });
});`;

function findContact(data: WebsiteDataV2): SectionOf<"contact"> | undefined {
  return data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
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

/** Meta/Canonical/OG + LocalBusiness-JSON-LD + Pack-Fonts-Link für die Haupt-Site. */
function renderHead(data: WebsiteDataV2, canonicalUrl: string): string {
  const constitution = getConstitution(data.stylePackId);
  const fontsUrl = buildFontsUrl([
    constitution.type.display,
    constitution.type.body,
    constitution.type.utility,
  ]);
  const jsonLd = buildLocalBusinessJsonLd(data);
  return [
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${esc(data.seo.title)}</title>`,
    `<meta name="description" content="${esc(data.seo.description)}" />`,
    `<link rel="canonical" href="${esc(canonicalUrl)}" />`,
    `<meta property="og:title" content="${esc(data.seo.title)}" />`,
    `<meta property="og:description" content="${esc(data.seo.description)}" />`,
    '<meta property="og:type" content="website" />',
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    `<link rel="stylesheet" href="${esc(fontsUrl)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join("\n");
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

/** Rendert eine schlichte Rechtsseite (Impressum/Datenschutz) statt der vollen Site. */
function renderLegalPage(
  data: WebsiteDataV2,
  canonicalUrl: string,
  title: string,
  bodyHtml: string | undefined
): string {
  const content = bodyHtml ?? "<p>Diese Seite wurde nicht gefunden.</p>";
  return `<!doctype html>
<html lang="de">
<head>
${renderLegalHead(data, canonicalUrl, title)}
</head>
<body>
<div class="pb-legal">
<a href="/">&larr; Zurück zur Startseite</a>
${content}
</div>
</body>
</html>`;
}

export function renderSiteHtml(
  data: WebsiteDataV2,
  opts: RenderSiteOptions
): string {
  const pathname = opts.pathname ?? "/";
  const canonicalUrl = `${opts.origin}${pathname}`;

  if (pathname === "/impressum") {
    return renderLegalPage(
      data,
      canonicalUrl,
      "Impressum",
      data.legal?.impressumHtml
    );
  }
  if (pathname === "/datenschutz") {
    return renderLegalPage(
      data,
      canonicalUrl,
      "Datenschutz",
      data.legal?.datenschutzHtml
    );
  }

  const head = renderHead(data, canonicalUrl);
  const body = renderToStaticMarkup(<SiteRenderer data={data} />);

  return `<!doctype html>
<html lang="de">
<head>
${head}
</head>
<body>
${body}
<script>${MOBILE_NAV_SCRIPT}</script>
</body>
</html>`;
}
