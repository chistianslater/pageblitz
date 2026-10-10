import type { WebsiteDataV2 } from "../siteContract/types";
import { getPalette, pickPalette } from "./palette";
import { systemsForDoc } from "./assignment";
import { getSystem, isReleased } from "./registry";
import type { DesignSystemId } from "./types";

/**
 * Wendet ein Designsystem an: rev 3, System, Palette. Das Schriftpaar des
 * Packs entfällt (das System bringt eigene Schriften); das Profil bleibt.
 */
export function withDesignSystem(
  doc: WebsiteDataV2,
  system: DesignSystemId,
  paletteId?: string
): WebsiteDataV2 {
  const def = getSystem(system);
  if (!def) throw new Error(`Designsystem nicht vorhanden: ${system}`);
  const palette = paletteId
    ? getPalette(def, paletteId)
    : pickPalette(def, doc.colorOverrides?.accent);
  const { fontPairId: _fontPairId, ...rest } = doc;
  return { ...rest, designRevision: 3, system, palette: palette.id };
}

export function withoutDesignSystem(doc: WebsiteDataV2): WebsiteDataV2 {
  const { system: _system, palette: _palette, ...rest } = doc;
  return { ...rest, designRevision: 2 };
}

/**
 * Neue Seiten: das freigeschaltete Hauptsystem der Branche, sonst unverändert
 * (rev 2). Erwartet ein Dokument mit gesetztem `blueprintFamily`.
 */
export function withPrimarySystem(doc: WebsiteDataV2): WebsiteDataV2 {
  const [primary] = systemsForDoc(doc);
  return isReleased(primary) ? withDesignSystem(doc, primary) : doc;
}
