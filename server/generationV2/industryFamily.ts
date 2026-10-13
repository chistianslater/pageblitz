/**
 * Branchenfamilie bei der Erzeugung bestimmen (2026-10-06, Betreiber: „Wir
 * müssen alle Branchen, die es in Google gibt, abdecken"). Drei Stufen:
 * 1. Nachschlagetabelle aller ~4.080 Google-Kategorien (deutsch + englisch),
 * 2. Stichwörter in Kategorie und Name (shared/blueprints/blueprints.ts),
 * 3. KI-Branchenschlüssel aus `classifyIndustry`, der ohnehin läuft.
 * Die Familie landet im Dokument (`blueprintFamily`), damit die Seite die
 * große Tabelle nicht im Browser braucht.
 */
import {
  keywordFamily,
  type BlueprintId,
} from "../../shared/blueprints/blueprints";
import { careFamily } from "../../shared/blueprints/careWords";
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
  // Freundlich-Familien (Kinder & Familie, Tiere) schlagen die Google-Tabelle:
  // dort stehen Tierarzt/Hebamme unter Gesundheit, Hundeschule unter Kurse,
  // „Kindergarten" sogar unter Sofort-Dienste. Nur die Kategorie zählt hier —
  // ein Name allein überstimmt die Tabelle nicht.
  const care = careFamily(cat);
  if (care) return care;
  const fromTable = cat ? CATEGORY_FAMILIES[categoryKey(cat)] : undefined;
  const fromKeyword = keywordFamily(cat, businessName);
  // „Hersteller" ist bei Google oft ein Handwerksbetrieb (Tischlerei Klähn) —
  // ein Gewerk im Namen schlägt die allgemeine Tabellen-Familie.
  if (fromTable === "industry" && fromKeyword && fromKeyword !== "industry")
    return fromKeyword;
  if (fromTable && fromTable !== "standard") return fromTable;
  if (fromKeyword) return fromKeyword;
  if (fromTable) return fromTable;
  return (industryKey && INDUSTRY_KEY_FAMILY[industryKey]) || "standard";
}
