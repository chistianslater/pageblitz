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
 * Hauptsystem der Branche: das erste freigeschaltete System des Tripels
 * (Spec §5). Total — jede Familie/Unterart ergibt rev 3; wirft nur, wenn
 * keins der drei freigeschaltet ist. Ohne `blueprintFamily` erkennt
 * `systemsForDoc` die Familie aus Kategorie und Name.
 */
export function withPrimarySystem(
  doc: WebsiteDataV2,
  released: (id: DesignSystemId) => boolean = isReleased
): WebsiteDataV2 {
  const triple = systemsForDoc(doc);
  const system = triple.find(id => released(id));
  if (!system)
    throw new Error(
      `Kein Designsystem freigeschaltet für: ${triple.join(", ")}`
    );
  return withDesignSystem(doc, system);
}

/**
 * Lesegrenze (Packs entfernen, 2026-10-13): Jedes gelesene Dokument wird ein
 * System-Dokument (rev 3). rev 3 mit System bleibt dasselbe Objekt
 * (Byte-Gleichheit); alte Stände (rev 1/2/ohne Revision) übernehmen System
 * und Palette des aktuellen Stands, sonst das Hauptsystem der Branche.
 * Inhalte, `stylePackId` (Textstimme) und `designProfile` bleiben.
 */
export function asSystemDoc(
  doc: WebsiteDataV2,
  current?: Pick<WebsiteDataV2, "designRevision" | "system" | "palette">
): WebsiteDataV2 {
  if (doc.designRevision === 3 && doc.system) return doc;
  if (current?.designRevision === 3 && current.system)
    return withDesignSystem(doc, current.system, current.palette);
  return withPrimarySystem(doc);
}
