/**
 * Farbwelten (P10, 2026-08-30): kuratierte Grundstimmungen je Pack.
 *
 * Statt freier Pipetten wählt der Kunde eine WELT — ein vollständiges,
 * kontrastgeprüftes Set der Grundrollen (canvas/surface/ink/muted/line
 * plus lesbare accent-text/accent-contrast). Die Rezepte rechnen aus der
 * Pack-Verfassung; die Tests (colorWorlds.test.ts) erzwingen WCAG-
 * Kontraste für ALLE Packs × ALLE Welten. Der Akzent bleibt unangetastet
 * — den wählt der Kunde weiterhin frei (Guard in toCssVars).
 *
 * Gespeichert wird eine Welt als normale `colorOverrides`-Einträge
 * (Server: updateTheme löst die ID auf) — kein neues Schema-Feld.
 */

import { getConstitution } from "./index";
import type { PackId } from "../siteContract/types";
import {
  bestTextOn,
  clampChroma,
  ensureTextContrast,
  hexToHsl,
  hslToHex,
  mix,
  relativeLuminance,
} from "./colorMath";

export interface ColorWorld {
  id: string;
  name: string;
  /** Drei Vorschau-Farben für die Swatch-Karte: Grund, Fläche, Akzent. */
  swatch: [string, string, string];
  /** Vollständiges Rollen-Set; leer = Original (Overrides löschen). */
  overrides: Record<string, string>;
}

/** Rollen, die eine Farbwelt setzt/zurücksetzt — accent gehört dem Kunden. */
export const WORLD_ROLES = [
  "canvas",
  "surface",
  "ink",
  "muted",
  "line",
  "accent-text",
  "accent-contrast",
] as const;

function roleHex(packId: PackId, role: string): string {
  const constitution = getConstitution(packId);
  const entry = constitution.palette.find(color => color.role === role);
  if (entry) return entry.hex;
  if (role === "surface") return roleHex(packId, "canvas");
  throw new Error(`Palette-Rolle fehlt: ${packId}/${role}`);
}

/** Mischt so viel Weiß/Schwarz ein, bis die Ziel-Luminanz erreicht ist. */
function towardLuminance(hex: string, target: string, goalLum: number): string {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const lum = relativeLuminance(mix(target, hex, mid));
    if (target === "#ffffff" ? lum >= goalLum : lum <= goalLum) hi = mid;
    else lo = mid;
  }
  return mix(target, hex, hi);
}

/**
 * Baut aus neuem Grund/Fläche alle abhängigen Rollen kontrastfest auf.
 * ink ≥ 7:1 auf beiden Flächen, muted ≥ 4,5:1, accent-text ≥ 4,5:1.
 */
function buildWorldSet(
  packId: PackId,
  canvas: string,
  surface: string
): Record<string, string> {
  const baseInk = roleHex(packId, "ink");
  const accent = roleHex(packId, "accent");
  let ink = ensureTextContrast(baseInk, canvas, 7);
  ink = ensureTextContrast(ink, surface, 7);
  let muted = mix(ink, canvas, 0.62);
  muted = ensureTextContrast(muted, canvas, 4.5);
  muted = ensureTextContrast(muted, surface, 4.5);
  const line = mix(ink, canvas, 0.16);
  const accentText = ensureTextContrast(accent, canvas, 4.5);
  // Text AUF dem Akzent: Schwarz oder Weiß (bei dunklen Packs wäre die
  // helle Tinte als Basis Mausgrau), notfalls bis zum Extrem geschärft.
  const accentContrast = ensureTextContrast(
    bestTextOn(accent, "#000000"),
    accent,
    4.5
  );
  return {
    canvas,
    surface,
    ink,
    muted,
    line,
    "accent-text": accentText,
    "accent-contrast": accentContrast,
  };
}

interface WorldRecipe {
  id: string;
  name: string;
  ground: (packId: PackId) => { canvas: string; surface: string };
}

const RECIPES: WorldRecipe[] = [
  {
    id: "heller",
    name: "Heller",
    ground: packId => {
      // Dunkle Packs springen ganz ins Licht (Grauzonen-Mitte vermeiden),
      // helle werden nur eine Spur luftiger.
      const canvas = roleHex(packId, "canvas");
      const surface = roleHex(packId, "surface");
      return {
        canvas: towardLuminance(canvas, "#ffffff", 0.86),
        surface: towardLuminance(surface, "#ffffff", 0.92),
      };
    },
  },
  {
    id: "waermer",
    name: "Wärmer",
    ground: packId => {
      const warm = "#f2e5d2";
      const canvas = roleHex(packId, "canvas");
      const surface = roleHex(packId, "surface");
      const dark = relativeLuminance(canvas) < 0.35;
      // Dunkle Packs: warmen Ton nur hauchen, nicht aufhellen.
      const w = dark ? 0.08 : 0.4;
      return {
        canvas: mix(warm, canvas, w),
        surface: mix(warm, surface, dark ? 0.06 : 0.3),
      };
    },
  },
  {
    id: "kuehler",
    name: "Kühler",
    ground: packId => {
      const cool = "#e6ebf1";
      const canvas = roleHex(packId, "canvas");
      const surface = roleHex(packId, "surface");
      const dark = relativeLuminance(canvas) < 0.35;
      const w = dark ? 0.08 : 0.4;
      return {
        canvas: mix(cool, canvas, w),
        surface: mix(cool, surface, dark ? 0.06 : 0.3),
      };
    },
  },
  {
    id: "getoent",
    name: "Getönt",
    ground: packId => {
      const accent = clampChroma(roleHex(packId, "accent"), 0.5, 0.3, 0.7);
      const canvas = roleHex(packId, "canvas");
      const surface = roleHex(packId, "surface");
      return {
        canvas: mix(accent, canvas, 0.1),
        surface: mix(accent, surface, 0.06),
      };
    },
  },
  {
    id: "abend",
    name: "Abend",
    ground: packId => {
      const canvasHsl = hexToHsl(roleHex(packId, "canvas"));
      // Dunkler Grund im Farbton des Packs, Chroma gedeckelt.
      const s = Math.min(canvasHsl.s, 0.28);
      return {
        canvas: hslToHex({ h: canvasHsl.h, s, l: 0.1 }),
        surface: hslToHex({ h: canvasHsl.h, s, l: 0.15 }),
      };
    },
  },
];

/** Alle Welten eines Packs — „Original" (leere Overrides) immer zuerst. */
export function getColorWorlds(packId: PackId): ColorWorld[] {
  const accent = roleHex(packId, "accent");
  const original: ColorWorld = {
    id: "original",
    name: "Original",
    swatch: [roleHex(packId, "canvas"), roleHex(packId, "surface"), accent],
    overrides: {},
  };
  const derived = RECIPES.map(recipe => {
    const { canvas, surface } = recipe.ground(packId);
    return {
      id: recipe.id,
      name: recipe.name,
      swatch: [canvas, surface, accent] as [string, string, string],
      overrides: buildWorldSet(packId, canvas, surface),
    };
  });
  return [original, ...derived];
}

export function getColorWorld(
  packId: PackId,
  worldId: string
): ColorWorld | null {
  return getColorWorlds(packId).find(world => world.id === worldId) ?? null;
}

/**
 * Aktive Welt aus gespeicherten Overrides zurückrechnen (UI-Markierung):
 * eine Welt gilt als aktiv, wenn ihr canvas-Wert exakt gespeichert ist.
 * Ohne canvas-Override ist „original" aktiv; unbekannte Werte → „eigene".
 */
export function activeColorWorldId(
  packId: PackId,
  overrides: Record<string, string> | undefined
): string {
  const canvas = overrides?.canvas?.toLowerCase();
  if (!canvas) return "original";
  return (
    getColorWorlds(packId).find(
      world => world.overrides.canvas?.toLowerCase() === canvas
    )?.id ?? "eigene"
  );
}
