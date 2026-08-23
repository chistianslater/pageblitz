import { FALLBACK_PACK, getConstitution } from "@shared/stylePacks";
import type { PackId } from "@shared/siteContract/types";

/** Neutraler Rückfall, falls eine Verfassung ausnahmsweise keine Akzentfarbe definiert. */
const FALLBACK_ACCENT = "#111111";

/**
 * Liest die Akzentfarbe der Stil-Verfassung eines Packs — die Primärfarbe
 * für Rechtsseiten-Header/Footer (`LegalPage`) und Showcase-Karten
 * (`PackShowcase`). Unbekannte/fehlende Pack-IDs fallen auf `FALLBACK_PACK`
 * zurück (`getConstitution` wirft bei unregistrierten IDs).
 */
export function getPackAccent(
  packId: PackId | string | null | undefined
): string {
  const id = (packId ?? FALLBACK_PACK) as PackId;
  let constitution;
  try {
    constitution = getConstitution(id);
  } catch {
    constitution = getConstitution(FALLBACK_PACK);
  }
  return (
    constitution.palette.find(p => p.role === "accent")?.hex ?? FALLBACK_ACCENT
  );
}
