/**
 * Branchenfamilie bei der Erzeugung bestimmen (2026-10-06, Betreiber: „Wir
 * müssen alle Branchen, die es in Google gibt, abdecken"). Drei Stufen:
 * 1. Nachschlagetabelle aller ~4.080 Google-Kategorien (deutsch + englisch),
 * 2. Stichwörter in Kategorie und Name (shared/stylePacks/blueprints.ts),
 * 3. KI-Branchenschlüssel aus `classifyIndustry`, der ohnehin läuft.
 * Die Familie landet im Dokument (`blueprintFamily`), damit die Seite die
 * große Tabelle nicht im Browser braucht.
 */
import {
  keywordFamily,
  type BlueprintId,
} from "../../shared/stylePacks/blueprints";
import { CATEGORY_FAMILIES } from "./categoryFamilies";

/** Schlüssel aus `classifyIndustry` → Familie. */
const INDUSTRY_KEY_FAMILY: Record<string, BlueprintId> = {
  friseur: "beauty",
  beauty: "beauty",
  restaurant: "gastro",
  pizza: "gastro",
  bar: "gastro",
  cafe: "gastro",
  baeckerei: "gastro",
  hotel: "stay",
  bauunternehmen: "trade",
  handwerk: "trade",
  reinigung: "trade",
  garten: "trade",
  fitness: "courses",
  medizin: "health",
  immobilien: "advice",
  beratung: "advice",
  tech: "advice",
  auto: "auto",
  fotografie: "creative",
};

/** Kategorie-Namen vergleichbar machen (Groß/Klein, Bindestriche, Umlaute bleiben). */
export function categoryKey(category: string): string {
  return category
    .toLowerCase()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveIndustryFamily(
  category: string | undefined,
  businessName = "",
  industryKey?: string
): BlueprintId {
  const cat = category?.trim() ?? "";
  const fromTable = cat ? CATEGORY_FAMILIES[categoryKey(cat)] : undefined;
  if (fromTable && fromTable !== "standard") return fromTable;
  const fromKeyword = keywordFamily(cat, businessName);
  if (fromKeyword) return fromKeyword;
  if (fromTable) return fromTable;
  return (industryKey && INDUSTRY_KEY_FAMILY[industryKey]) || "standard";
}
