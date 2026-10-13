import type { WebsiteDataV2 } from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { tradeLabel } from "../../../../../../shared/blueprints/blueprints";
import { displayName } from "../../../../../../shared/designSystems/displayName";
import { orderedSections } from "../../engine";
import { systemShows } from "./sections";

/**
 * Name, Gewerk und sichtbares Dokument — geteilt von Werkstoff und Plakat
 * (aus werkstoff/facts.ts herausgelöst, Verhalten unverändert).
 */

/** Gewerk bzw. Branche („Schreinerei", „Bäckerei"). */
export function branchOf(
  data: WebsiteDataV2,
  blueprint: Blueprint
): string | undefined {
  const label =
    blueprint.id === "trade"
      ? tradeLabel(data.businessCategory, data.businessName)
      : data.businessCategory;
  return label?.trim() || undefined;
}

const lower = (t: string) => t.toLocaleLowerCase("de");

/**
 * Kopf nach Systemblatt: Name in Slab, Gewerk in Mono darunter
 * („Holtkamp / SCHREINEREI"). Beginnt oder endet der Name mit dem Gewerk,
 * steht es nur einmal (unten); sonst bleibt der Name ganz.
 */
export function brandParts(
  name: string,
  branch: string | undefined
): { mark: string; sub?: string } {
  if (!branch) return { mark: name };
  const n = lower(name);
  const b = lower(branch);
  if (n.startsWith(`${b} `))
    return { mark: name.slice(branch.length).trim(), sub: branch };
  if (n.endsWith(` ${b}`))
    return { mark: name.slice(0, -branch.length).trim(), sub: branch };
  return n.includes(b) ? { mark: name } : { mark: name, sub: branch };
}

/** Anzeigename ohne Rechtsform. */
export const nameOf = (data: WebsiteDataV2) => displayName(data.businessName);

/** Dokument nur mit den Abschnitten, die das System auch zeigt. */
export function visibleDoc(doc: WebsiteDataV2): WebsiteDataV2 {
  const shown = new Set(
    orderedSections(doc)
      .filter(systemShows)
      .map(s => s.type)
  );
  return { ...doc, sections: doc.sections.filter(s => shown.has(s.type)) };
}

