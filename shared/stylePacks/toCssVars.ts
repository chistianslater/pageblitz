import type { FontSpec, PackConstitution } from "./types";

const fontStack = (f: FontSpec) => `"${f.family}", ${f.fallback}`;

export function toCssVars(
  c: PackConstitution,
  overrides?: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of c.palette) {
    const wanted = overrides?.[color.role];
    vars[`--pb-${color.role}`] = wanted && !color.locked ? wanted : color.hex;
  }
  // `accent-text` ist optional (siehe types.ts): ohne Paletteneintrag ist der
  // Kleintext-Ton identisch mit dem Akzent, damit Module `var(--pb-accent-text)`
  // bedingungslos nutzen können (kein Fallback-Wert in jedem css.ts nötig).
  if (!vars["--pb-accent-text"] && vars["--pb-accent"])
    vars["--pb-accent-text"] = vars["--pb-accent"];
  vars["--pb-font-display"] = fontStack(c.type.display);
  vars["--pb-font-body"] = fontStack(c.type.body);
  if (c.type.utility) vars["--pb-font-utility"] = fontStack(c.type.utility);
  vars["--pb-radius-card"] = c.shape.radiusCard;
  vars["--pb-radius-button"] = c.shape.radiusButton;
  vars["--pb-hero-size"] = c.type.scale.heroClamp;
  return vars;
}
