import { esc } from "./renderSite";

export interface NotFoundPageOptions {
  /** Name des Unternehmens, dessen Kundenseite existiert, aber nicht unter diesem Pfad. */
  businessName: string;
  /** Ziel des "Zurück"-Links — "/" (Subdomain-Form) oder "/site/<slug>" (Pfadform). */
  homeHref: string;
}

/**
 * Schlichte 404-Seite für unbekannte Unterpfade einer bekannten v2-Kundenseite
 * (z. B. `/site/<slug>/gibt-es-nicht`). Wird von `handleCustomerSiteSsr`
 * (`server/ssr/routes.ts`) mit `X-Robots-Tag: noindex` ausgeliefert, damit
 * Crawler diese Pfade nicht indexieren.
 */
export function renderNotFoundHtml(opts: NotFoundPageOptions): string {
  const { businessName, homeHref } = opts;
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Seite nicht gefunden — ${esc(businessName)}</title>
</head>
<body>
<div class="pb-not-found">
<h1>Seite nicht gefunden</h1>
<p>Diese Seite von ${esc(businessName)} gibt es nicht.</p>
<a href="${esc(homeHref)}">&larr; Zurück zur Startseite</a>
</div>
</body>
</html>`;
}
