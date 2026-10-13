import { getVoicePool, rankVoices } from "../../shared/textVoices";
import type { PackId } from "../../shared/siteContract/types";
import { getNextLayoutForIndustry } from "../db";

/**
 * Wählt die Textstimme für ein neues Geschäft: Kandidaten-Pool nach
 * Business-Kategorie (getVoicePool), Feinwahl nach Kontext (rankVoices) und
 * Rotation über den bestehenden Layout-Counter (getNextLayoutForIndustry,
 * nach Industrie-Key). Die ID landet im historischen Feld `stylePackId`.
 */
export async function selectVoice(
  category: string,
  industryKey: string,
  context?: string
): Promise<PackId> {
  const pool = rankVoices(getVoicePool(category), context);
  const voiceId = await getNextLayoutForIndustry(industryKey, pool);
  return voiceId as PackId;
}
