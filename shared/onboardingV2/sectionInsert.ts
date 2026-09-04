import type { SectionType, WebsiteDataV2 } from "../siteContract/types";
import {
  addonPrice,
  formatEuro,
  ADDON_NAMES,
  type AddOnFlags,
} from "../pricing";
import {
  GATED_SECTION_ADDONS,
  type GatedSectionAddOn,
} from "./addonEditors";
import { SECTION_LABELS } from "./aiEdit";

/**
 * Plus-Zonen (2026-09-03, Übernahme aus vite-deploy-studio „Section-Insert"):
 * der Kunde klickt in der Vorschau zwischen zwei Sektionen auf ein Plus und
 * wählt, was dort hin soll. Erlaubt sind genau die faktenfreien Sektionen,
 * die der KI-Chat schon anlegen darf (ADDABLE_TYPES in aiEditFacts.ts) —
 * die KI schreibt den Inhalt, die Position wird hier deterministisch
 * über `sectionOrder` gesetzt.
 */

export const INSERTABLE_SECTION_TYPES = [
  "story",
  "usp",
  "notice",
  "stats",
  "process",
  "quote",
] as const;
export type InsertableSectionType = (typeof INSERTABLE_SECTION_TYPES)[number];

export const INSERT_META: Record<
  InsertableSectionType,
  { label: string; hint: string }
> = {
  story: {
    label: SECTION_LABELS.story,
    hint: "Wie der Betrieb entstanden ist und wofür er steht — zwei bis fünf Absätze.",
  },
  usp: {
    label: SECTION_LABELS.usp,
    hint: "Zwei bis sechs Argumente, warum Kunden zu dir kommen sollten.",
  },
  notice: {
    label: SECTION_LABELS.notice,
    hint: "Ein Satz ganz oben über der Navigation, etwa Urlaub oder Aktion.",
  },
  stats: {
    label: SECTION_LABELS.stats,
    hint: "Zwei bis vier Kennzahlen — nur solche, die der Inhalt belegt.",
  },
  process: {
    label: SECTION_LABELS.process,
    hint: "So läuft es ab: zwei bis fünf nummerierte Schritte von Anfrage bis Ergebnis.",
  },
  quote: {
    label: SECTION_LABELS.quote,
    hint: "Ein großes Zitat oder Motto des Betriebs.",
  },
};

export interface InsertCandidate {
  type: InsertableSectionType;
  label: string;
  hint: string;
  /** Typ existiert bereits auf der Seite — jede Sektion höchstens einmal. */
  present: boolean;
}

export function insertCandidates(doc: WebsiteDataV2): InsertCandidate[] {
  const present = new Set(doc.sections.map(s => s.type));
  return INSERTABLE_SECTION_TYPES.map(type => ({
    type,
    ...INSERT_META[type],
    present: present.has(type),
  }));
}

/**
 * Neue Reihenfolge: aktuelle Reihenfolge (eigene oder Dokument), `type`
 * direkt hinter `afterType`. Null, wenn die Ziel-Sektion fehlt oder die
 * Kontakt-Sektion ist (die bleibt das Ende der Seite).
 */
export function orderWithInsert(
  doc: WebsiteDataV2,
  type: InsertableSectionType,
  afterType: SectionType
): SectionType[] | null {
  if (afterType === "contact") return null;
  const documentOrder = doc.sections.map(s => s.type);
  const base = (doc.sectionOrder ?? documentOrder).filter(t => t !== type);
  const idx = base.indexOf(afterType);
  if (idx < 0) return null;
  return [...base.slice(0, idx + 1), type, ...base.slice(idx + 1)];
}

/** Fester Wunsch für den Vorschlags-Pfad des KI-Chats. */
export function insertSectionMessage(
  type: InsertableSectionType,
  afterType: SectionType
): string {
  return `Füge eine neue Sektion vom Typ "${type}" (${INSERT_META[type].label}) direkt nach der Sektion "${afterType}" (${SECTION_LABELS[afterType]}) ein. ${INSERT_META[type].hint} Nutze nur Inhalte, die aus dem bestehenden Text belegt sind — erfinde keine Zahlen, Namen oder Fakten. Alle anderen Sektionen bleiben unverändert.`;
}

/**
 * Kostenpflichtige Extras, die selbst eine Sektion sind (2026-09-04,
 * Betreiber: „beim Sektion einfügen macht es ggf. auch Sinn
 * kostenpflichtige Extras zu zeigen"). Der Einfügen-Dialog ist der Moment,
 * in dem jemand etwas hinzufügen will — dort gehören sie hin, mit klarem
 * Preis vor dem Klick. Reihenfolge nach erwartetem Nutzen, nicht alphabetisch.
 */
const ADDON_INSERT_ORDER = [
  "gallery",
  "team",
  "menu",
  "pricelist",
] as const satisfies readonly GatedSectionAddOn[];

const ADDON_INSERT_HINTS: Record<GatedSectionAddOn, string> = {
  gallery: "Arbeiten und Räume als Bilderstrecke — der häufigste Grund, warum Kunden länger bleiben.",
  team: "Gesichter statt Anonymität: Mitglieder mit Foto, Name und Rolle.",
  menu: "Speisekarte mit Kategorien, Gerichten und Preisen.",
  pricelist: "Leistungen mit Preisen, damit Kunden vorab wissen, woran sie sind.",
};

export interface InsertAddonCandidate {
  key: GatedSectionAddOn;
  label: string;
  /** Monatspreis, fertig formatiert — nie im Client neu berechnen. */
  priceLabel: string;
  hint: string;
  /** Schon gebucht: die Sektion liegt bereits auf der Seite. */
  active: boolean;
}

export function insertAddonCandidates(
  addOns: AddOnFlags
): InsertAddonCandidate[] {
  return ADDON_INSERT_ORDER.filter(key =>
    (GATED_SECTION_ADDONS as readonly string[]).includes(key)
  ).map(key => ({
    key,
    label: ADDON_NAMES[key],
    priceLabel: formatEuro(addonPrice(key)),
    hint: ADDON_INSERT_HINTS[key],
    active: addOns[key] === true,
  }));
}
