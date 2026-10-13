/**
 * Postkarten-Wellen und Versuchsarme (Betreiber-Entscheid 2026-10-13).
 *
 * Welle 1 (September, 32 Karten an Friseure) brachte 3 Scans. Welle 2
 * schickt vier Batches à fünf Karten gleichzeitig — jeder Batch ändert
 * genau eine Größe gegenüber Welle 1, damit sich ein Unterschied einer
 * Ursache zuordnen lässt:
 *
 *   A  Branche   Kosmetik statt Friseur, Karte wie Welle 1 (Kontrolle)
 *   B  Design    Vorderseite = Screenshot der eigenen Seite, groß
 *   C  Wortlaut  „Schau sie dir kostenlos an – freischalten nur, wenn …"
 *   D  Nachfass  zweite Karte an Friseure der Welle 1 ohne Scan
 *
 * Geteilt zwischen Server (Speichern, Vorlage, Auswertung) und Admin
 * (Auswahl beim Erzeugen) — deshalb hier und ohne Abhängigkeiten.
 */

/** Kartenlayouts. Bestimmt HeyMail-Vorlage und Art des Motivs. */
export const POSTKARTEN_LAYOUTS = ["standard", "screenshot"] as const;
export type PostkartenLayout = (typeof POSTKARTEN_LAYOUTS)[number];

export const LAYOUT_LABEL: Record<PostkartenLayout, string> = {
  standard: "Standard (Laptop-Mockup, wie Welle 1)",
  screenshot: "Screenshot groß auf der Vorderseite",
};

/** Alte Zeilen haben kein Layout — sie sind alle im Standard gedruckt. */
export function layoutVon(layout: string | null | undefined): PostkartenLayout {
  return layout === "screenshot" ? "screenshot" : "standard";
}

/** So heißt eine Karte ohne `welle` in der Auswertung. */
export const WELLE_1 = "welle-1";
export const WELLE_2 = "welle-2";

export function welleVon(welle: string | null | undefined): string {
  return welle?.trim() || WELLE_1;
}

export interface BatchVorgabe {
  batch: "A" | "B" | "C" | "D";
  titel: string;
  /** Welche eine Größe dieser Batch gegenüber Welle 1 verändert. */
  variable: string;
  layout: PostkartenLayout;
  /** Schlüssel in TEXT_VARIANTEN (server/postkarten/heymail.ts). */
  textVariant: string;
  /** Filter für „Karten erzeugen" — Teilstring der Google-Kategorie. */
  branche: string;
  /** D: keine neuen Betriebe, sondern Karten der Welle 1 ohne Scan. */
  nachfass: boolean;
}

export const WELLE_2_BATCHES: readonly BatchVorgabe[] = [
  {
    batch: "A",
    titel: "Kosmetik (Kontrolle)",
    variable: "Branche",
    layout: "standard",
    textVariant: "ungefragt",
    branche: "Kosmetik",
    nachfass: false,
  },
  {
    batch: "B",
    titel: "Screenshot-Vorderseite",
    variable: "Kartendesign",
    layout: "screenshot",
    textVariant: "screenshot",
    branche: "Friseur",
    nachfass: false,
  },
  {
    batch: "C",
    titel: "Angebot",
    variable: "Wortlaut",
    layout: "standard",
    textVariant: "angebot",
    branche: "Friseur",
    nachfass: false,
  },
  {
    batch: "D",
    titel: "Nachfass",
    variable: "zweite Karte",
    layout: "standard",
    textVariant: "nachfass",
    branche: "Friseur",
    nachfass: true,
  },
];

/** Karten je Batch — Betreiber-Vorgabe für Welle 2. */
export const KARTEN_JE_BATCH = 5;

export function batchVorgabe(
  batch: string | null | undefined
): BatchVorgabe | null {
  return WELLE_2_BATCHES.find(b => b.batch === batch) ?? null;
}

/**
 * Widerspricht die Auswahl im Backend der Vorgabe des Batches? Ein Batch B
 * mit Standard-Layout oder ein Batch C mit dem Text der ersten Welle wäre
 * ein Versuch, der etwas anderes misst, als sein Name sagt.
 */
export function batchWiderspruch(opts: {
  batch: string | null | undefined;
  layout: string | null | undefined;
  textVariant: string | null | undefined;
}): string | null {
  if (!opts.batch) return null;
  const vorgabe = batchVorgabe(opts.batch);
  if (!vorgabe) return `Unbekannter Batch „${opts.batch}".`;
  if (layoutVon(opts.layout) !== vorgabe.layout) {
    return `Batch ${vorgabe.batch} verlangt das Layout „${vorgabe.layout}", gewählt ist „${layoutVon(opts.layout)}".`;
  }
  if (opts.textVariant !== vorgabe.textVariant) {
    return `Batch ${vorgabe.batch} verlangt die Textvariante „${vorgabe.textVariant}", gewählt ist „${opts.textVariant ?? "keine"}".`;
  }
  return null;
}
