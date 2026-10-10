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
export function legacyPackVars(
  sys: Record<string, string>
): Record<string, string> {
  return {
    "--pb-canvas": sys["--sys-paper"],
    // Helles Band laut Systemblatt: Papier 35 % mit Weiß.
    "--pb-surface": `color-mix(in srgb, ${sys["--sys-paper"]} 35%, #fff)`,
    "--pb-ink": sys["--sys-ink"],
    "--pb-muted": sys["--sys-muted"],
    "--pb-line": sys["--sys-rule"],
    "--pb-accent": sys["--sys-accent"],
    "--pb-accent-text": sys["--sys-accent"],
    "--pb-accent-contrast": sys["--sys-on-deep"],
    "--pb-font-display": sys["--sys-font-display"],
    // UI-Text (Formulare, Badge, Banner) in der Grotesk wie small/link.
    "--pb-font-body": sys["--sys-font-text"],
    "--pb-font-utility": sys["--sys-font-text"],
  };
}
