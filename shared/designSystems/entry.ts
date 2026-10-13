/**
 * Einstieg nach Fotomaterial (Packs entfernen, 2026-10-13; vorher
 * die Einstiegs-Regeln der Pack-Daten).
 *
 * Die Designsysteme lesen vom Profil nur `composition === "stage"` (großes
 * Querformat trägt die volle Fläche) und `hiddenElements`. Alles andere am
 * Profil ist der neutrale Standard.
 */
import type { PackId } from "../siteContract/types";
import {
  DEFAULT_DESIGN_PROFILE,
  designSeed,
  type DesignProfile,
} from "../siteContract/designProfile";

/** Ab dieser Breite trägt ein Querformat-Foto die volle Bühne. */
export const STAGE_MIN_WIDTH = 1000;
/** Breite/Höhe, ab der ein Foto als Querformat gilt. */
export const STAGE_MIN_RATIO = 1.25;

export type EntryPhotos = {
  /** Das Hero-Foto ist ein großes Querformat (gemessen bei der Generierung). */
  heroLandscape: boolean;
  /** Zahl der echten Fotos neben dem Hero-Bild (Über uns, Galerie). */
  extraPhotos: number;
};

/**
 * Textstimmen, deren Einstieg schon zu Pack-Zeiten immer reine Typo war
 * (Komposition „statement“): Sie bekamen auch mit Querformat keine Bühne.
 * Bleibt so, damit neue Seiten dieser Betriebe aussehen wie bisher.
 */
const TYPE_LED_VOICES: ReadonlySet<PackId> = new Set([
  "marktplatz",
  "verve",
  "plakat",
]);

export type EntryInput = {
  stylePackId: PackId;
  businessName: string;
  businessCategory?: string;
  sections: ReadonlyArray<{ type: string; imageUrl?: string }>;
};

/**
 * Komposition des Einstiegs: ohne Hero-Foto Schrift („statement“),
 * großes Querformat → Bühne, sonst mit Zusatzfoto → Farbfläche, sonst
 * Hochformat neben dem Text („portrait“).
 */
export function entryComposition(
  input: EntryInput,
  photos: EntryPhotos
): NonNullable<DesignProfile["composition"]> {
  const hasHeroPhoto = input.sections.some(
    s => s.type === "hero" && Boolean(s.imageUrl)
  );
  if (!hasHeroPhoto || TYPE_LED_VOICES.has(input.stylePackId))
    return "statement";
  if (photos.heroLandscape) return "stage";
  if (photos.extraPhotos >= 1) return "colorfield";
  return "portrait";
}

/** Seed des Entwurfsprofils: Name, Kategorie und Textstimme des Betriebs. */
export function entrySeed(
  input: Pick<EntryInput, "businessName" | "businessCategory" | "stylePackId">
): number {
  return designSeed(
    `${input.businessName}|${input.businessCategory ?? ""}|${input.stylePackId}`
  );
}

/** Profil einer neuen Seite: Standard + Einstieg nach Fotos + Seed. */
export function entryProfile(
  input: EntryInput,
  photos: EntryPhotos
): DesignProfile {
  return {
    ...DEFAULT_DESIGN_PROFILE,
    composition: entryComposition(input, photos),
    seed: entrySeed(input),
  };
}
