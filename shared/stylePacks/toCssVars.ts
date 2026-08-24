import type { FontSpec, PackConstitution } from "./types";

const fontStack = (f: FontSpec) => `"${f.family}", ${f.fallback}`;

export function toCssVars(
  c: PackConstitution,
  overrides?: Record<string, string>,
  fontPair?: { display: FontSpec; body: FontSpec } | null
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of c.palette) {
    const wanted = overrides?.[color.role];
    // locked schützt Pack-Identität gegen automatische Eingriffe — aber eine
    // bewusste Kundenwahl im Studio (Theme-Editor, 2026-08-24) schlägt den
    // Lock bei der Rolle `accent`: „Ich wähle Rot, nichts passiert" wäre
    // sonst unerklärbar. Andere Rollen bleiben locked-geschützt.
    const overrideWins = wanted && (!color.locked || color.role === "accent");
    vars[`--pb-${color.role}`] = overrideWins ? wanted : color.hex;
  }
  // `accent-text` ist optional (siehe types.ts): ohne Paletteneintrag ist der
  // Kleintext-Ton identisch mit dem Akzent, damit Module `var(--pb-accent-text)`
  // bedingungslos nutzen können (kein Fallback-Wert in jedem css.ts nötig).
  if (!vars["--pb-accent-text"] && vars["--pb-accent"])
    vars["--pb-accent-text"] = vars["--pb-accent"];
  // Kunden-Schriftpaar (fontPairId) ersetzt display/body der Verfassung;
  // utility (Mono/Label-Schrift) bleibt pack-seitig.
  vars["--pb-font-display"] = fontStack(fontPair?.display ?? c.type.display);
  vars["--pb-font-body"] = fontStack(fontPair?.body ?? c.type.body);
  if (c.type.utility) vars["--pb-font-utility"] = fontStack(c.type.utility);
  vars["--pb-radius-card"] = c.shape.radiusCard;
  vars["--pb-radius-button"] = c.shape.radiusButton;
  vars["--pb-hero-size"] = c.type.scale.heroClamp;
  return vars;
}
