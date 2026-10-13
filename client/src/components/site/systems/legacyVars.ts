/**
 * Alias-Variablen `--pb-*` für rev 3: Inseln (Formular, Chat, Buchung),
 * Hinweis-Banner, Bildnachweis und Branding-Badge sind über die Pack-Tokens
 * gestylt. Hier bekommen sie die Werte des Designsystems — aufgelöst (keine
 * `var(--sys-*)`-Verweise), weil `copySiteCssVars` die Inline-Werte auf
 * portalierte Panels außerhalb von `.pb-site` kopiert.
 *
 * Bewusst nicht gesetzt: `--pb-radius-*` (Journal ist eckig; eine
 * undefinierte Variable ergibt Radius 0), `--pb-accent-2`, `--pb-hero-size`.
 */
import {
  contrastRatio,
  relativeLuminance,
} from "../../../../../shared/designSystems/colorMath";

/** Unter dieser Leuchtdichte gilt das Papier als dunkel (Raster „Kohle"). */
const DARK_PAPER = 0.18;
/** WCAG AA für Text auf der Akzentfläche (Knöpfe, Banner, Chat-Blasen). */
const AA = 4.5;

/**
 * Helle Fläche (Formular, Panels): auf hellem Papier Papier 35 % mit Weiß
 * (Journal-Systemblatt), auf dunklem Papier ein Hauch Tinte — sonst stünde
 * eine hellgraue Fläche mit heller Schrift auf der Seite.
 */
function surfaceOf(paper: string, ink: string): string {
  return relativeLuminance(paper) < DARK_PAPER
    ? `color-mix(in srgb, ${paper} 92%, ${ink})`
    : `color-mix(in srgb, ${paper} 35%, #fff)`;
}

/**
 * Schrift auf dem Akzent: `onDeep`, solange es lesbar ist (Journal);
 * sonst Papier oder Tinte, je nachdem was stärker kontrastiert (Kohle:
 * Gelb braucht dunkle Schrift).
 */
function onAccentOf(
  accent: string,
  onDeep: string,
  paper: string,
  ink: string
): string {
  if (contrastRatio(onDeep, accent) >= AA) return onDeep;
  return contrastRatio(paper, accent) >= contrastRatio(ink, accent)
    ? paper
    : ink;
}

export function legacyPackVars(
  sys: Record<string, string>
): Record<string, string> {
  return {
    "--pb-canvas": sys["--sys-paper"],
    "--pb-surface": surfaceOf(sys["--sys-paper"], sys["--sys-ink"]),
    "--pb-ink": sys["--sys-ink"],
    "--pb-muted": sys["--sys-muted"],
    "--pb-line": sys["--sys-rule"],
    "--pb-accent": sys["--sys-accent"],
    "--pb-accent-text": sys["--sys-accent"],
    "--pb-accent-contrast": onAccentOf(
      sys["--sys-accent"],
      sys["--sys-on-deep"],
      sys["--sys-paper"],
      sys["--sys-ink"]
    ),
    "--pb-font-display": sys["--sys-font-display"],
    // UI-Text (Formulare, Badge, Banner) in der Grotesk wie small/link.
    "--pb-font-body": sys["--sys-font-text"],
    "--pb-font-utility": sys["--sys-font-text"],
  };
}
