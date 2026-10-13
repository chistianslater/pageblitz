import type { WebsiteDataV2 } from "../siteContract/types";
import {
  blueprintFor,
  isBarberShop,
  type BlueprintId,
  type GastroKind,
} from "../blueprints/blueprints";
import {
  isIceCream,
  isKidsLessons,
  isKidsPhoto,
  isMidwife,
  isPediatric,
  petKind,
  type PetKind,
} from "../blueprints/careWords";
import type { DesignSystemId } from "./types";

export type SystemTriple = readonly [
  DesignSystemId,
  DesignSystemId,
  DesignSystemId,
];

/** Spec §5 — Haupt, Alternative 1, Alternative 2. */
const BY_FAMILY: Record<Exclude<BlueprintId, "gastro">, SystemTriple> = {
  beauty: ["journal", "nacht", "plakat"],
  trade: ["werkstoff", "raster", "plakat"],
  health: ["klar", "journal", "raster"],
  advice: ["raster", "klar", "journal"],
  retail: ["werkstoff", "journal", "plakat"],
  auto: ["raster", "plakat", "nacht"],
  courses: ["plakat", "klar", "raster"],
  stay: ["journal", "nacht", "werkstoff"],
  creative: ["journal", "raster", "plakat"],
  urgent: ["raster", "klar", "plakat"],
  industry: ["raster", "werkstoff", "klar"],
  // Freundlich (2026-10-13): Kita, Krippe, Tagesmutter, Hebamme. Klar als
  // ruhige, gut lesbare Alternative (Eltern, Sprechzeiten), Journal warm.
  family: ["freundlich", "klar", "journal"],
  // Tiere ohne erkennbare Unterart wie Tierarzt (siehe PET_TRIPLE).
  pets: ["freundlich", "klar", "journal"],
  standard: ["raster", "journal", "klar"],
};
const BARBER: SystemTriple = ["plakat", "nacht", "raster"];
const GASTRO: Record<GastroKind, SystemTriple> = {
  restaurant: ["nacht", "journal", "werkstoff"],
  imbiss: ["plakat", "werkstoff", "raster"],
  cafe: ["werkstoff", "journal", "plakat"],
};

/**
 * Freundliche Unterarten bestehender Familien (Eisdiele, Musikschule,
 * Nachhilfe, Kinderfotografie; im Bestand gespeicherte Tierärzte, Hebammen,
 * Hundesalons, Tierbedarf): Freundlich vorn, dahinter das bisherige
 * Hauptsystem der Familie — solange Freundlich nicht freigeschaltet ist,
 * bekommen diese Betriebe über `withPrimarySystem` also genau das System
 * von vorher.
 */
type FriendlyBase =
  | "health"
  | "beauty"
  | "courses"
  | "retail"
  | "creative";
const FRIENDLY: Record<FriendlyBase, SystemTriple> = {
  health: ["freundlich", "klar", "journal"],
  beauty: ["freundlich", "journal", "werkstoff"],
  courses: ["freundlich", "plakat", "klar"],
  retail: ["freundlich", "werkstoff", "journal"],
  creative: ["freundlich", "journal", "raster"],
};
/** Tiere je Unterart — dieselbe Reihe wie die Familie, aus der sie kommen. */
const PET_TRIPLE: Record<PetKind, SystemTriple> = {
  vet: FRIENDLY.health,
  grooming: FRIENDLY.beauty,
  school: FRIENDLY.courses,
  shop: FRIENDLY.retail,
};
/**
 * Kinder- und Jugendärzte bleiben Gesundheit mit Klar vorn (Praxis,
 * Heilmittelwerberecht, Vertrauen über Klarheit); Freundlich als erste
 * Alternative, weil Kinder und Eltern die Seite lesen.
 */
const PEDIATRIC: SystemTriple = ["klar", "freundlich", "journal"];

export type SystemSub = {
  barber?: boolean;
  gastroKind?: GastroKind;
  /** Freundliche Unterart (siehe FRIENDLY). */
  friendly?: boolean;
  /** Tiere: Unterart. */
  petKind?: PetKind;
  /** Gesundheit: Kinder- und Jugendarzt. */
  pediatric?: boolean;
};

export function systemsFor(
  family: BlueprintId,
  sub: SystemSub = {}
): SystemTriple {
  if (family === "pets")
    return sub.petKind ? PET_TRIPLE[sub.petKind] : BY_FAMILY.pets;
  if (family === "gastro") {
    const kind = GASTRO[sub.gastroKind ?? "restaurant"];
    // Eis: Freundlich vorn, dahinter die Reihe der eigenen Gastro-Art.
    return sub.friendly ? ["freundlich", kind[0], kind[1]] : kind;
  }
  if (sub.friendly && family in FRIENDLY)
    return FRIENDLY[family as FriendlyBase];
  if (family === "health" && sub.pediatric) return PEDIATRIC;
  if (family === "beauty" && sub.barber) return BARBER;
  return BY_FAMILY[family];
}

/**
 * Freundliche Unterart einer bestehenden Familie — NUR aus der Kategorie
 * (Review F1): „Pizzeria Gelato" bleibt Pizzeria, „Dr. Tierarzt" Arzt.
 */
function friendlyVariant(family: BlueprintId, text: string): boolean {
  switch (family) {
    case "gastro":
      return isIceCream(text);
    case "courses":
      return isKidsLessons(text) || petKind(text) === "school";
    case "creative":
      return isKidsPhoto(text);
    case "health":
      return petKind(text) === "vet" || isMidwife(text);
    case "beauty":
      return petKind(text) === "grooming";
    case "retail":
      return petKind(text) === "shop";
    default:
      return false;
  }
}

export function systemsForDoc(
  doc: Pick<
    WebsiteDataV2,
    "businessCategory" | "businessName" | "blueprintFamily"
  >
): SystemTriple {
  const bp = blueprintFor(
    doc.businessCategory,
    doc.businessName,
    doc.blueprintFamily
  );
  const category = doc.businessCategory ?? "";
  return systemsFor(bp.id, {
    barber:
      bp.id === "beauty" &&
      isBarberShop(doc.businessCategory, doc.businessName),
    gastroKind: bp.gastroKind,
    friendly: friendlyVariant(bp.id, category),
    petKind: bp.id === "pets" ? petKind(category) : undefined,
    pediatric: bp.id === "health" && isPediatric(category),
  });
}
