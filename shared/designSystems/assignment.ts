import type { WebsiteDataV2 } from "../siteContract/types";
import { blueprintFor, isBarberShop, type BlueprintId, type GastroKind } from "../blueprints/blueprints";
import type { DesignSystemId } from "./types";

export type SystemTriple = readonly [DesignSystemId, DesignSystemId, DesignSystemId];

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
  standard: ["raster", "journal", "klar"],
};
const BARBER: SystemTriple = ["plakat", "nacht", "raster"];
const GASTRO: Record<GastroKind, SystemTriple> = {
  restaurant: ["nacht", "journal", "werkstoff"],
  imbiss: ["plakat", "werkstoff", "raster"],
  cafe: ["werkstoff", "journal", "plakat"],
};

export function systemsFor(
  family: BlueprintId,
  sub: { barber?: boolean; gastroKind?: GastroKind } = {}
): SystemTriple {
  if (family === "gastro") return GASTRO[sub.gastroKind ?? "restaurant"];
  if (family === "beauty" && sub.barber) return BARBER;
  return BY_FAMILY[family];
}

export function systemsForDoc(
  doc: Pick<WebsiteDataV2, "businessCategory" | "businessName" | "blueprintFamily">
): SystemTriple {
  const bp = blueprintFor(doc.businessCategory, doc.businessName, doc.blueprintFamily);
  return systemsFor(bp.id, {
    barber: bp.id === "beauty" && isBarberShop(doc.businessCategory, doc.businessName),
    gastroKind: bp.gastroKind,
  });
}
