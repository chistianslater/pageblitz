import { useSystem } from "../SystemContext";
import type { SystemSection } from "./sections";

/** Vorschau-Platzhalter (nur in der Vorschau, nie auf der Live-Seite). */

export const hasSection = (
  sections: readonly SystemSection[],
  type: SystemSection["type"]
) => sections.some(s => s.type === type);

/** Zeigt die Vorschau den Platzhalter für ein fehlendes Extra? Text aus dem Bauplan. */
export function useSlot(
  kind: "pricelist" | "team" | "menu",
  sections: readonly SystemSection[]
): string | undefined {
  const { preview, blueprint } = useSystem();
  if (
    !preview ||
    !blueprint.placeholders.includes(kind) ||
    hasSection(sections, kind)
  )
    return undefined;
  return blueprint.placeholderText[kind] ?? "";
}

/** Platzhalter, die als eigener Abschnitt zwischen den Kapiteln stehen. */
export type PreviewSlotKind = "menu" | "team";

/**
 * Wo die Vorschau-Platzhalter stehen (unabhängig davon, ob sie gerade
 * gezeigt werden): Speisekarte nach den Leistungen, sonst nach dem
 * Einstieg; Team nach „Über uns", sonst nach der Galerie, sonst vor dem
 * Besuch (bzw. am Ende).
 */
export function previewSlotAnchors(
  sections: readonly SystemSection[]
): Partial<Record<PreviewSlotKind, number>> {
  const at = (type: SystemSection["type"]) =>
    sections.findIndex(s => s.type === type);
  const pick = (...indices: number[]) => indices.find(i => i >= 0);
  const contact = at("contact");
  return {
    menu: pick(at("services"), at("hero"), sections.length - 1),
    team: pick(
      at("about"),
      at("gallery"),
      contact > 0 ? contact - 1 : -1,
      sections.length - 1
    ),
  };
}
