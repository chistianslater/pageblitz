import { hexToRgb } from "./colorMath";
import type { DesignSystemDef, SystemPalette } from "./types";

export function getPalette(def: DesignSystemDef, id?: string): SystemPalette {
  return def.palettes.find(p => p.id === id) ?? def.palettes[0];
}

function distance(a: string, b: string): number {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return Math.hypot(x.r - y.r, x.g - y.g, x.b - y.b);
}

/** Palette mit dem Akzent, der der Logo-/Fotofarbe am nächsten ist (Spec §5). */
export function pickPalette(def: DesignSystemDef, accentHex?: string): SystemPalette {
  if (!accentHex) return def.palettes[0];
  return [...def.palettes].sort(
    (a, b) => distance(a.accent, accentHex) - distance(b.accent, accentHex)
  )[0];
}
