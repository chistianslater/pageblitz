import { JOURNAL } from "./journal";
import { RASTER } from "./raster";
import { WERKSTOFF } from "./werkstoff";
import { PLAKAT } from "./plakat";
import { KLAR } from "./klar";
import { NACHT } from "./nacht";
import type { DesignSystemDef, DesignSystemId } from "./types";

export const DESIGN_SYSTEMS: Partial<Record<DesignSystemId, DesignSystemDef>> = {
  journal: JOURNAL,
  // Raster: abgenommen und freigeschaltet.
  raster: RASTER,
  // Werkstoff: abgenommen und freigeschaltet.
  werkstoff: WERKSTOFF,
  // Plakat: abgenommen und freigeschaltet (siehe RELEASED_SYSTEMS).
  plakat: PLAKAT,
  // Klar: abgenommen und freigeschaltet (siehe RELEASED_SYSTEMS).
  klar: KLAR,
  // Nacht: in Arbeit, NICHT freigeschaltet (nicht in RELEASED_SYSTEMS).
  nacht: NACHT,
};

/** Nur abgenommene Systeme gehen an neue Seiten und ins Studio (Spec §6). */
export const RELEASED_SYSTEMS: readonly DesignSystemId[] = ["journal", "raster", "werkstoff", "plakat", "klar"];

export function getSystem(id: DesignSystemId): DesignSystemDef | undefined {
  return DESIGN_SYSTEMS[id];
}

export function isReleased(id: DesignSystemId): boolean {
  return RELEASED_SYSTEMS.includes(id) && Boolean(DESIGN_SYSTEMS[id]);
}

/**
 * Systeme mit eigener Bewegung im Motion-Bundle (`site-islands/motion.ts`).
 * Nur diese laden das Bundle (SSR, `usesMotionBundle`).
 */
export const SYSTEMS_WITH_MOTION: readonly DesignSystemId[] = [
  "journal",
  "raster",
  "werkstoff",
  "plakat",
  "klar",
];

export function systemHasMotion(id: DesignSystemId): boolean {
  return SYSTEMS_WITH_MOTION.includes(id);
}
