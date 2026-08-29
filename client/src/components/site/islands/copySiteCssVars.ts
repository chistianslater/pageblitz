/**
 * Kopiert die Pack-Tokens (`--pb-*`) von `.pb-site` auf ein portaliertes
 * Insel-Panel.
 *
 * `toCssVars` setzt die Variablen als Inline-Styles auf `.pb-site`
 * (`SiteRenderer.tsx`). Chat- und Buchungs-Panel hängen per `createPortal`
 * an `document.body` (eigener Stacking-Context, siehe ChatIsland.tsx) — dort
 * erben sie die Tokens nicht mehr, und der Browser fällt auf die
 * User-Agent-Schrift (oft Times) plus ungestylte Flächen zurück.
 *
 * Bewusst NICHT auf `:root` spiegeln: SiteRenderer läuft auch in CSR-
 * Studio-Vorschauen innerhalb der Pageblitz-App; Tokens auf `:root`
 * würden dort die App-UI einfärben.
 *
 * Ohne `document` (SSR über `renderToStaticMarkup`) ein leeres Objekt —
 * das Panel bleibt im SSR-Markup Kind von `.pb-site` und erbt dort ganz
 * normal. Fallback über `getComputedStyle`, falls die Inline-Liste leer
 * ist (z. B. Tokens nur in einem Stylesheet).
 */

const KNOWN_PB_VARS = [
  "--pb-canvas",
  "--pb-surface",
  "--pb-ink",
  "--pb-muted",
  "--pb-line",
  "--pb-accent",
  "--pb-accent-contrast",
  "--pb-accent-text",
  "--pb-accent-2",
  "--pb-font-display",
  "--pb-font-body",
  "--pb-font-utility",
  "--pb-radius-card",
  "--pb-radius-button",
  "--pb-hero-size",
] as const;

function readInlinePbVars(
  style: { length: number; item: (index: number) => string; getPropertyValue: (name: string) => string }
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    if (name && name.startsWith("--pb-")) {
      const value = style.getPropertyValue(name).trim();
      if (value) vars[name] = value;
    }
  }
  return vars;
}

export function copySiteCssVars(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const site = document.querySelector(".pb-site");
  if (!site) return {};

  const inline = (site as HTMLElement).style;
  if (inline && typeof inline.getPropertyValue === "function") {
    const fromInline = readInlinePbVars(inline);
    if (Object.keys(fromInline).length > 0) return fromInline;
  }

  if (typeof getComputedStyle !== "function") return {};
  const computed = getComputedStyle(site);
  const vars: Record<string, string> = {};
  for (const name of KNOWN_PB_VARS) {
    const value = computed.getPropertyValue(name).trim();
    if (value) vars[name] = value;
  }
  return vars;
}
