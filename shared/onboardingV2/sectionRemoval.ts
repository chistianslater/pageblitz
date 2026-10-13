import type { SectionType, WebsiteDataV2 } from "../siteContract/types";
import { ADDON_NAMES, type AddOnFlags } from "../pricing";
import { GATED_SECTION_ADDONS, type GatedSectionAddOn } from "./addonEditors";
import { SECTION_LABELS } from "./aiEdit";

/**
 * Abschnitt entfernen (2026-10-13, Betreiber: „Wenn ich mir unsicher bin und
 * eine Sektion hinzufüge, kann ich sie nicht wieder einfach entfernen").
 * Entfernt den Abschnitt ganz aus der Startseite — Ausblenden (Auge im
 * Struktur-Panel) bleibt daneben bestehen. Rückweg: Rückgängig-Hinweis im
 * Studio (withRestoredSection) und der Verlauf.
 *
 * Pflicht bleiben Einstieg (hero) und Kontakt: Kontakt trägt Adresse,
 * Telefon und das Formular und ist schon heute nicht ausblendbar. Das
 * Impressum hängt am Fuß der Seite, nicht an einem Abschnitt.
 *
 * Ein gebuchtes Extra (Galerie, Speisekarte, Preisliste, Team) wird beim
 * Entfernen seines Abschnitts NICHT abbestellt — das läuft nur über die
 * Extras. Der Hinweis sagt das offen.
 */

const REQUIRED_REASONS: Partial<Record<SectionType, string>> = {
  hero: "Der Einstieg gehört auf jede Seite und lässt sich nicht entfernen.",
  contact:
    "Kontakt bleibt immer auf der Seite — darüber erreichen dich deine Kunden.",
};

export type RemovalRule =
  | { allowed: true; addonNote?: string }
  | { allowed: false; reason: string };

function gatedAddOn(type: SectionType): GatedSectionAddOn | null {
  return (GATED_SECTION_ADDONS as readonly string[]).includes(type)
    ? (type as GatedSectionAddOn)
    : null;
}

export function removalRule(
  type: SectionType,
  addOns: Partial<AddOnFlags> = {}
): RemovalRule {
  const reason = REQUIRED_REASONS[type];
  if (reason) return { allowed: false, reason };
  const addon = gatedAddOn(type);
  if (addon && addOns[addon] === true) {
    return {
      allowed: true,
      addonNote: `Dein Extra „${ADDON_NAMES[addon]}“ bleibt gebucht — abbestellen geht nur unter Extras.`,
    };
  }
  return { allowed: true };
}

/** Reihenfolge, wie die Seite sie rendert: eigene Reihenfolge, dann der Rest. */
function effectiveOrder(doc: WebsiteDataV2): SectionType[] {
  const present = doc.sections.map(s => s.type);
  const presentSet = new Set<string>(present);
  const own = (doc.sectionOrder ?? []).filter((t): t is SectionType =>
    presentSet.has(t)
  );
  return [...own, ...present.filter(t => !own.includes(t))];
}

function withLists(
  doc: WebsiteDataV2,
  sections: WebsiteDataV2["sections"],
  order: SectionType[] | undefined,
  hidden: SectionType[]
): WebsiteDataV2 {
  const { sectionOrder: _order, hiddenSections: _hidden, ...rest } = doc;
  return {
    ...rest,
    sections,
    ...(order && order.length > 0 ? { sectionOrder: order } : {}),
    ...(hidden.length > 0 ? { hiddenSections: hidden } : {}),
  } as WebsiteDataV2;
}

export function withoutSection(
  doc: WebsiteDataV2,
  type: SectionType
): WebsiteDataV2 {
  const rule = removalRule(type);
  if (!rule.allowed) throw new Error(rule.reason);
  if (!doc.sections.some(s => s.type === type)) {
    throw new Error(`„${SECTION_LABELS[type]}“ ist nicht auf der Seite.`);
  }
  return withLists(
    doc,
    doc.sections.filter(s => s.type !== type),
    doc.sectionOrder?.filter(t => t !== type),
    (doc.hiddenSections ?? []).filter(t => t !== type)
  );
}

/**
 * Holt einen entfernten Abschnitt aus einem früheren Stand zurück: Inhalt
 * und Ausblendung wie dort, Position hinter dem nächsten Vorgänger, den es
 * heute noch gibt (sonst ganz vorn hinter dem Einstieg). Alles andere am
 * aktuellen Stand bleibt, wie es ist.
 */
export function withRestoredSection(
  current: WebsiteDataV2,
  old: WebsiteDataV2,
  type: SectionType
): WebsiteDataV2 {
  const label = SECTION_LABELS[type];
  if (current.sections.some(s => s.type === type)) {
    throw new Error(`„${label}“ ist schon auf der Seite.`);
  }
  const section = old.sections.find(s => s.type === type);
  if (!section) {
    throw new Error(`„${label}“ lässt sich nicht mehr zurückholen.`);
  }
  const oldOrder = effectiveOrder(old);
  const order = effectiveOrder(current);
  const before = oldOrder.slice(0, oldOrder.indexOf(type)).reverse();
  const anchor = before.find(t => order.includes(t));
  const at = anchor ? order.indexOf(anchor) + 1 : 0;
  const nextOrder = [...order.slice(0, at), type, ...order.slice(at)];
  const hidden = current.hiddenSections ?? [];
  const wasHidden = (old.hiddenSections ?? []).includes(type);
  return withLists(
    current,
    [...current.sections, section],
    nextOrder,
    wasHidden ? [...hidden, type] : hidden
  );
}
