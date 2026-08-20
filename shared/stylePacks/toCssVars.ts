import type { FontSpec, PackConstitution } from "./types";

const fontStack = (f: FontSpec) => `"${f.family}", ${f.fallback}`;

export function toCssVars(
  c: PackConstitution,
  overrides?: Record<string, string>,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of c.palette) {
    const wanted = overrides?.[color.role];
    vars[`--pb-${color.role}`] = wanted && !color.locked ? wanted : color.hex;
  }
  vars["--pb-font-display"] = fontStack(c.type.display);
  vars["--pb-font-body"] = fontStack(c.type.body);
  if (c.type.utility) vars["--pb-font-utility"] = fontStack(c.type.utility);
  vars["--pb-radius-card"] = c.shape.radiusCard;
  vars["--pb-radius-button"] = c.shape.radiusButton;
  vars["--pb-hero-size"] = c.type.scale.heroClamp;
  return vars;
}
