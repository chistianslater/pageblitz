import { getPackPool } from "../../shared/stylePacks";
import type { PackId } from "../../shared/siteContract/types";
import { getNextLayoutForIndustry } from "../db";
import { rankArtDirections } from "../../shared/stylePacks/artDirection";

/**
 * Wählt das Style-Pack für ein neues Geschäft: Kandidaten-Pool aus der
 * Branchen-Registry (getPackPool, nach Business-Kategorie) + Rotation über
 * den bestehenden Layout-Counter (getNextLayoutForIndustry, nach
 * Industrie-Key). Pool-Werte sind jetzt Pack-IDs statt Legacy-Layoutnamen.
 */
export async function selectPack(
  category: string,
  industryKey: string,
  context?: string
): Promise<PackId> {
  const pool = rankArtDirections(getPackPool(category), context);
  const packId = await getNextLayoutForIndustry(industryKey, pool);
  return packId as PackId;
}
