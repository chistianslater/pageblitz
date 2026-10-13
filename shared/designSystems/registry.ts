import { JOURNAL } from "./journal";
import { RASTER } from "./raster";
import { WERKSTOFF } from "./werkstoff";
import { PLAKAT } from "./plakat";
import { KLAR } from "./klar";
import { NACHT } from "./nacht";
import { FREUNDLICH } from "./freundlich";
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
  // Nacht: abgenommen und freigeschaltet (siehe RELEASED_SYSTEMS).
  nacht: NACHT,
  // Freundlich: abgenommen und freigeschaltet (siehe RELEASED_SYSTEMS).
  freundlich: FREUNDLICH,
};

/**
 * Nur abgenommene Systeme gehen an neue Seiten und ins Studio (Spec §6).
 *
 * Vorsicht beim Zurücknehmen einer Freischaltung: Jedes gelesene Dokument
 * ohne rev 3 (alte Verlaufsstände, Fixtures, Altbestand) bekommt beim Lesen
 * über `asSystemDoc` → `withPrimarySystem` das erste FREIGESCHALTETE System
 * seines Tripels. Ist für eine Branche keins mehr frei, wirft
 * `withPrimarySystem` — Rendern, Wiederherstellen und Studio-Laden solcher
 * Seiten schlagen dann fehl. Vorher prüfen, dass jedes Tripel ein
 * freigeschaltetes System behält (Test „withPrimarySystem ist total“ in
 * apply.test.ts).
 */
export const RELEASED_SYSTEMS: readonly DesignSystemId[] = [
  "journal",
  "raster",
  "werkstoff",
  "plakat",
  "klar",
  "nacht",
  "freundlich",
];

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
  "nacht",
  "freundlich",
];

export function systemHasMotion(id: DesignSystemId): boolean {
  return SYSTEMS_WITH_MOTION.includes(id);
}
