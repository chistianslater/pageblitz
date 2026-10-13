import type { Blueprint } from "../blueprints/blueprints";
import type {
  DesignProfile,
  PhotoTreatment,
} from "../siteContract/designProfile";

/**
 * Fotobehandlung in Plakat (2026-10-13). Duoton (grau, multipliziert auf
 * die Feldfarbe) trägt den Plakat-Look — Essen sieht darin aber verdorben
 * aus. Standard deshalb: Essen in Originalfarben, alles andere eingefärbt.
 * Der Kunde kann im Studio umschalten (`designProfile.photoTreatment`).
 */

/**
 * Essen außerhalb des Bauplans Gastro (Metzgerei, Hofladen, Weingut … landen
 * in Handel oder Standard). Lange Stämme dürfen im Wort stehen
 * („Landmetzgerei"), kurze Schlagwörter nur als ganzes Wort.
 */
const FOOD_STEMS =
  /metzger|fleischer|schlachter|feinkost|delikatess|hofladen|käserei|kaeserei|foodtruck|food-truck|weingut|winzer|catering|obsthof|gemüsebau|gemuesebau|butcher|bakery|grocery/i;
const FOOD_WORDS =
  /(^|[^a-zäöüß])(deli|food|obst|gemüse|gemuese|käse|kaese|wein|eis)([^a-zäöüß]|$)/i;

/** Standard ohne Kundenwahl: Gastro und Lebensmittel original, sonst eingefärbt. */
export function defaultPhotoTreatment(
  blueprint: Pick<Blueprint, "id">,
  category: string | undefined
): PhotoTreatment {
  if (blueprint.id === "gastro") return "original";
  const text = category?.trim() ?? "";
  return text && (FOOD_STEMS.test(text) || FOOD_WORDS.test(text))
    ? "original"
    : "tinted";
}

/** Wirksame Behandlung: Kundenwahl, sonst Standardregel. */
export function photoTreatmentOf(
  profile: Pick<DesignProfile, "photoTreatment"> | undefined,
  blueprint: Pick<Blueprint, "id">,
  category: string | undefined
): PhotoTreatment {
  return profile?.photoTreatment ?? defaultPhotoTreatment(blueprint, category);
}
