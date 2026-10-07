/**
 * Erzeugt server/generationV2/categoryFamilies.ts aus der Zuordnung aller
 * Google-Kategorien (gcid-Liste, je Kategorie deutscher Name + Familie).
 *
 *   npx tsx scripts/build-category-families.ts <gfam-*.json …>
 *
 * Schlüssel: deutscher Name, englischer Name und gcid-ID (Unterstriche als
 * Leerzeichen), jeweils über categoryKey normalisiert.
 */
import fs from "fs";
import path from "path";
import { BLUEPRINT_IDS } from "../shared/stylePacks/blueprints";
import { categoryKey } from "../server/generationV2/industryFamily";

const files = process.argv.slice(2);
const english = new Map<string, string>();
const csv = files.find(f => f.endsWith(".csv"));
if (csv)
  for (const line of fs.readFileSync(csv, "utf8").trim().split("\n")) {
    const i = line.indexOf(",");
    english.set(line.slice(5, i), line.slice(i + 1).replace(/^"|"$/g, ""));
  }

const table: Record<string, string> = {};
// Deutscher Kategoriename → englischer Google-Name (Suchbegriff für Unsplash).
const englishByKey: Record<string, string> = {};
const counts: Record<string, number> = {};
let total = 0;
for (const file of files.filter(f => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    [string, string]
  >;
  for (const [id, [de, assigned]] of Object.entries(data)) {
    let family = assigned;
    if (!(BLUEPRINT_IDS as readonly string[]).includes(family)) continue;
    total++;
    // Hersteller, Großhandel, Lieferanten bekommen „Betrieb & Industrie"
    // (Familie kam nach der ersten Zuordnung dazu, 2026-10-07).
    if (
      ["standard", "retail", "trade"].includes(family) &&
      /wholesal|supplier|manufactur|distribut|factory|producer|exporter|importer/.test(
        `${id} ${english.get(id) ?? ""}`.toLowerCase()
      )
    )
      family = "industry";
    counts[family] = (counts[family] ?? 0) + 1;
    for (const name of [de, english.get(id), id.replace(/_/g, " ")])
      if (name) table[categoryKey(name)] ??= family;
    const en = english.get(id);
    if (en && de) englishByKey[categoryKey(de)] ??= en;
  }
}

const out = path.join("server/generationV2/categoryFamilies.ts");
const body = Object.keys(table)
  .sort()
  .map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(table[k])},`)
  .join("\n");
fs.writeFileSync(
  out,
  `/**
 * Google-Kategorie → Branchenfamilie (${total} Kategorien, ${Object.keys(table).length} Schlüssel).
 * Erzeugt von scripts/build-category-families.ts — nicht von Hand pflegen.
 */
import type { BlueprintId } from "../../shared/stylePacks/blueprints";

export const CATEGORY_FAMILIES: Record<string, BlueprintId> = {
${body}
};
`
);
const englishBody = Object.keys(englishByKey)
  .sort()
  .map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(englishByKey[k])},`)
  .join("\n");
fs.writeFileSync(
  path.join("server/generationV2/categoryEnglish.ts"),
  `/**
 * Deutscher Google-Kategoriename → englischer Name (${Object.keys(englishByKey).length} Einträge),
 * Suchbegriff für Unsplash (englisch verschlagwortet).
 * Erzeugt von scripts/build-category-families.ts — nicht von Hand pflegen.
 */
export const CATEGORY_ENGLISH: Record<string, string> = {
${englishBody}
};
`
);
console.log("Kategorien:", total, "Schlüssel:", Object.keys(table).length);
console.log(counts);
