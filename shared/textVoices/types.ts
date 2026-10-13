import type { PackId } from "../siteContract/types";

/**
 * Textstimme (Packs entfernen, 2026-10-13): Was von den 20 Pack-Verfassungen
 * bleibt — nur Ton und Regeln für die Texterzeugung, kein Look (Farben,
 * Schriften, Formen kommen aus dem Designsystem). Die ID steht weiter im
 * historischen Dokumentfeld `stylePackId` (Typ `PackId`).
 */
export interface TextVoice {
  id: PackId;
  name: string;
  /** Ein Satz Haltung — landet als „Tonalität“ in den Prompts. */
  essence: string;
  /** Branchen-Schlüssel für die Stimmen-Wahl (getVoicePool). */
  industries: string[];
  /**
   * Gastro-Stimmen (industries enthalten Restaurant/Café/Bäckerei/Bar/Imbiss/
   * Catering/Konditorei/Eisdiele o. ä.): Angebot-Panel startet im
   * Speisekarten- statt Leistungen-Modus, wenn noch keine Angebots-Sektion
   * mit Inhalt existiert (siehe OfferPanel.offerFromDoc, B4c Task 7).
   */
  prefersMenu?: boolean;
  llmHints: { do: string[]; dont: string[] };
}
