import { getSystem } from "@shared/designSystems/registry";
import { getPalette } from "@shared/designSystems/palette";
import {
  bestTextOn,
  ensureTextContrast,
} from "@shared/designSystems/colorMath";
import { systemDocOf } from "./systemDoc";

/** Mindestkontrast für normalgroßen Text (WCAG 2.x SC 1.4.3). */
const MIN_TEXT_CONTRAST = 4.5;
const NEUTRAL = { primary: "#111111", link: "#111111", onPrimary: "#ffffff" };

export interface LegalColors {
  /** Fläche für Kopf/Fuß der Rechtsseite: Akzent der Farbstimmung. */
  primary: string;
  /** Linkfarbe auf Weiß (≥ 4,5:1). */
  link: string;
  /** Schrift auf `primary`. */
  onPrimary: string;
}

/**
 * Farben der Rechtsseiten im SPA-Pfad (`LegalPage`): Akzent aus der
 * Farbstimmung des Designsystems der Seite (`getPalette(getSystem(system),
 * palette)`). Alte Dokumente bekommen über `systemDocOf` ihr Hauptsystem;
 * ohne gültiges Dokument bleibt es neutral.
 */
export function legalColors(websiteData: unknown): LegalColors {
  const doc = systemDocOf(websiteData);
  const def = doc?.system ? getSystem(doc.system) : undefined;
  if (!doc || !def) return NEUTRAL;
  const primary = getPalette(def, doc.palette).accent;
  return {
    primary,
    link: ensureTextContrast(primary, "#ffffff", MIN_TEXT_CONTRAST),
    onPrimary: bestTextOn(primary),
  };
}
