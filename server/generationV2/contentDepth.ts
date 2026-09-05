import type { SectionOf, WebsiteDataV2 } from "../../shared/siteContract/types";

/**
 * Inhaltliche Mindesttiefe der Erstgenerierung (Befund 2026-09-05).
 *
 * Gemessen an zehn echten Kundenseiten: Der Über-uns-Text hatte im Schnitt
 * 50 Wörter, einzelne Leistungsbeschreibungen nur eine Halbzeile. Die
 * Pack-Layouts sind auf mehr ausgelegt — daher der Eindruck „halb fertig".
 *
 * Diese Prüfung läuft NUR bei der Generierung, bewusst nicht im Zod-Schema:
 * Das Schema liest auch bestehende Dokumente aus der Datenbank. Härtere
 * Untergrenzen dort würden ältere Kundenseiten beim Laden ungültig machen
 * und damit live schalten, was heute funktioniert.
 *
 * Die Grenzen sind Untergrenzen, keine Zielwerte: Sie sollen Halbsätze
 * abfangen, nicht Geschwätzigkeit belohnen.
 */
export const MIN_WORDS = {
  heroSubheadline: 12,
  serviceDescription: 15,
  aboutBody: 70,
  faqAnswer: 20,
} as const;

export interface ContentGap {
  /** Pfad im Dokument, z. B. "services.items[2].description". */
  pfad: string;
  /** Klartextname für den Prompt. */
  feld: string;
  ist: number;
  soll: number;
}

function woerter(text: string | undefined | null): number {
  if (!text) return 0;
  const t = text.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

/**
 * Prüft nur, was tatsächlich da ist. Ein fehlendes optionales Feld ist keine
 * Lücke — sonst würde die Prüfung Inhalte einfordern, für die es keine
 * Faktengrundlage gibt, und das Modell zum Erfinden verleiten.
 */
export function contentGaps(doc: WebsiteDataV2): ContentGap[] {
  const luecken: ContentGap[] = [];
  const pruefe = (
    pfad: string,
    feld: string,
    text: string | undefined | null,
    soll: number
  ) => {
    const ist = woerter(text);
    if (ist > 0 && ist < soll) luecken.push({ pfad, feld, ist, soll });
  };

  const hero = doc.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  pruefe(
    "hero.subheadline",
    "Hero-Unterzeile",
    hero?.subheadline,
    MIN_WORDS.heroSubheadline
  );

  const services = doc.sections.find(
    (s): s is SectionOf<"services"> => s.type === "services"
  );
  services?.items.forEach((item, i) =>
    pruefe(
      `services.items[${i}].description`,
      "Leistungsbeschreibung",
      item.description,
      MIN_WORDS.serviceDescription
    )
  );

  const about = doc.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  pruefe("about.body", "Über-uns-Text", about?.body, MIN_WORDS.aboutBody);

  const faq = doc.sections.find((s): s is SectionOf<"faq"> => s.type === "faq");
  faq?.items.forEach((item, i) =>
    pruefe(
      `faq.items[${i}].answer`,
      "FAQ-Antwort",
      item.answer,
      MIN_WORDS.faqAnswer
    )
  );

  return luecken;
}

/**
 * Nachforder-Hinweis für genau einen zweiten Versuch. Nennt jede Lücke mit
 * Pfad, Ist und Soll — und verbietet ausdrücklich, die Lücke mit erfundenen
 * Angaben zu füllen. Lieber ein knapper wahrer Text als ein langer falscher.
 */
export function depthRetryHint(luecken: ContentGap[]): string {
  if (luecken.length === 0) return "";
  const zeilen = luecken
    .map(l => `- ${l.pfad} (${l.feld}): ${l.ist} Wörter, mindestens ${l.soll}`)
    .join("\n");
  return `Diese Felder sind zu knapp geraten und wirken auf der fertigen Seite unfertig:
${zeilen}

Schreibe NUR diese Felder länger und konkreter. Alle anderen Felder bleiben unverändert. Nutze dafür ausschließlich Angaben, die im Kontext oben belegt sind — Leistungen, Arbeitsweise, Materialien, Ablauf, Öffnungszeiten, Lage. Erfinde keine Zahlen, Jahre, Namen, Auszeichnungen oder Referenzen. Wenn zu einem Feld nichts Belegtes mehr zu sagen ist, lass es kürzer, statt es mit Floskeln zu füllen.`;
}

/**
 * Lohnt ein zweiter Modellaufruf? Er kostet rund 20–40 Sekunden und
 * verdoppelt damit fast die Generierungsdauer — für zwei fehlende Wörter
 * wäre das verschwendet. Nachgefordert wird deshalb nur bei erheblicher
 * Unterschreitung (ein Feld unter 70 % des Mindestwerts) oder wenn sich
 * mindestens drei knappe Lücken summieren.
 */
export function lohntNachforderung(luecken: ContentGap[]): boolean {
  if (luecken.length === 0) return false;
  if (luecken.some(l => l.ist < l.soll * 0.7)) return true;
  return luecken.length >= 3;
}
