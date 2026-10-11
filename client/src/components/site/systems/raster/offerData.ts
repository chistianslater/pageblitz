import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { NUMBERED, type SystemSection } from "../shared";
import { REFERENCE_COLUMN_REM, clampAt, wordWidthEm } from "./fit";

/**
 * Reine Daten-Regeln für Leistungs-Bänder, Zahlenzeile und Kapitelzählung
 * in Raster. Nichts wird erfunden: Preise nur aus dem Dokument, Zahlen nur
 * aus `data.google`, Fotos nur, wenn jedes Band eins bekommt.
 */

type Service = SectionOf<"services">["items"][number];

/** Höchstens so viele Bänder; der Rest steht als Liste darunter. */
export const MAX_BANDS = 6;

export type BandPlan = {
  bands: Service[];
  /** Leistungen ab der siebten: kompakte Liste „Weitere Leistungen". */
  rest: Service[];
  /** S/W-Hintergrund je Band — nur, wenn jedes Band eins hat. */
  photos?: string[];
  /** Genau ein Band: statisch, ohne Sticky. */
  single: boolean;
  /** Ein Band ist auf dem Handy höher als der Bildschirm → kein Stapeln (< 900 px). */
  flowNarrow: boolean;
  /** Dasselbe für den Desktop (≥ 900 px). */
  flowWide: boolean;
};

/**
 * Fotos für die Bänder: Das Schema kennt kein Foto je Leistung. Quelle sind
 * die Fotos des Betriebs aus der Galerie (in ihrer Reihenfolge) — aber nur,
 * wenn es für JEDES Band eins gibt. Sonst tragen alle Bänder die Fläche
 * `deep` (Systemblatt: kein halb bebilderter Stapel).
 */
export function bandPlan(
  services: SectionOf<"services">,
  sections: readonly SystemSection[]
): BandPlan {
  const bands = services.items.slice(0, MAX_BANDS);
  const rest = services.items.slice(MAX_BANDS);
  const gallery = sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  const images = gallery?.images.map(i => i.url) ?? [];
  const photos =
    bands.length > 0 && images.length >= bands.length
      ? images.slice(0, bands.length)
      : undefined;
  return {
    bands,
    rest,
    ...(photos ? { photos } : {}),
    single: bands.length === 1,
    flowNarrow: !bandsFit(bands, BAND_PHONE),
    flowWide: !bandsFit(bands, BAND_DESKTOP),
  };
}

/**
 * Galerie ohne die Fotos, die schon als Band-Hintergrund stehen (Abgleich
 * über die URL). Bleibt nichts übrig, entfällt die Galerie ganz — vor der
 * Kapitelzählung, damit Nummern und Navigation lückenlos bleiben. Die
 * Bänder selbst lesen ihre Fotos aus der ungekürzten Liste (`source`).
 */
export function withoutBandPhotos<T extends SystemSection>(
  sections: readonly T[]
): T[] {
  const services = sections.find(
    (s): s is T & SectionOf<"services"> => s.type === "services"
  );
  const used = new Set(
    services ? (bandPlan(services, sections).photos ?? []) : []
  );
  if (used.size === 0) return [...sections];
  return sections.flatMap(s => {
    if (s.type !== "gallery") return [s];
    const images = (s as SectionOf<"gallery">).images.filter(
      i => !used.has(i.url)
    );
    return images.length > 0 ? [{ ...s, images } as T] : [];
  });
}

/* ── Bandnamen-Fit ───────────────────────────────────────────────────── */

/** Laufweite der Stufe `figure` in em. */
const FIGURE_TRACK = parseFloat(RASTER.type.figure!.track);
/** Untergrenze für Bandnamen laut Systemblatt: 2,5 rem (= Abstand `l`). */
export const BAND_FLOOR_REM = parseFloat(RASTER.space.l);

/** Umbruchstellen wie bei der Wortmarke: Leerraum und nach Bindestrich. */
const units = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(w => w.split(/(?<=[-–/])(?=\p{L})/u));

export type BandFit = {
  /** Breite des längsten Worts in em (Versal, Laufweite `figure`). */
  widthEm: number;
  /** Passt das längste Wort bei 2,5 rem nicht in die Handy-Spalte → Trennstrich. */
  hyphenate: boolean;
};

/**
 * Bandname: Größe = min(Stufe `figure`, Spalte ÷ längstes Wort), Untergrenze
 * 2,5 rem; passt es auch dann nicht, trennt der Browser mit Trennstrich
 * (`hyphens:auto`, Seite ist `lang="de"`). Entscheidung an der Handy-Spalte
 * (320 px), Größe im CSS über `--rs-fit` und Container-Einheiten.
 */
export function fitBandName(name: string): BandFit {
  const widthEm = Math.max(
    0,
    ...units(name).map(u => wordWidthEm(u, FIGURE_TRACK))
  );
  return {
    widthEm,
    hyphenate:
      widthEm > 0 && REFERENCE_COLUMN_REM / widthEm < BAND_FLOOR_REM,
  };
}

/* ── Zahlenzeile ─────────────────────────────────────────────────────── */

export type Figure = { value: string; label: string };

/**
 * Echte Zahlen: Google-Note und Anzahl der Bewertungen, nur mit Bewertungen.
 * Ein Gründungsjahr kennt das Schema nicht — also kein „gegründet".
 */
export function figuresOf(google: WebsiteDataV2["google"]): Figure[] {
  if (!google || !(google.reviewCount > 0)) return [];
  const figures: Figure[] = [];
  if (google.rating > 0)
    figures.push({
      value: formatHeroRating(google.rating),
      label: "Google-Bewertung",
    });
  figures.push({
    value: google.reviewCount.toLocaleString("de-DE"),
    label: google.reviewCount === 1 ? "Bewertung" : "Bewertungen",
  });
  return figures;
}

/**
 * Weniger als zwei Zahlen → die Zeile entfällt ganz. Hängt an `figuresOf`:
 * Heute liefert es 0 oder 2 Zahlen (Note + Anzahl; ohne Note nur 1). Kommt
 * eine weitere echte Zahl dazu (z. B. belegtes Gründungsjahr), zählt sie
 * hier automatisch mit.
 */
export const MIN_FIGURES = 2;

/**
 * Zeigt die Startseite die Zahlenzeile? Sie folgt den Leistungs-Bändern
 * (Systemblatt 8/11), also nur mit Leistungen, nur auf der Startseite
 * (Einstieg vorhanden) und nicht neben einem eigenen Zahlen-Abschnitt
 * (gleicher Anker „zahlen").
 */
export function showsFigures(
  sections: readonly SystemSection[],
  google: WebsiteDataV2["google"]
): boolean {
  const has = (t: SystemSection["type"]) => sections.some(s => s.type === t);
  return (
    has("hero") &&
    has("services") &&
    !has("stats") &&
    figuresOf(google).length >= MIN_FIGURES
  );
}

/* ── Kapitelzählung ──────────────────────────────────────────────────── */

/** Kapitel in Renderreihenfolge; die Zahlenzeile steht direkt nach den Leistungen. */
export type RasterChapterKey = SystemSection["type"] | "figures";

/**
 * Kapitelnummer ab 01 (der Einstieg trägt keine), lückenlos über die
 * sichtbaren nummerierten Abschnitte; mit `figures` zählt die Zahlenzeile
 * als eigenes Kapitel nach den Leistungen. 0 für nicht nummerierte.
 */
export function chapterNumber(
  sections: readonly SystemSection[],
  key: RasterChapterKey,
  figures = false
): number {
  const order: RasterChapterKey[] = sections
    .filter(s => NUMBERED.has(s.type))
    .flatMap(s =>
      s.type === "services" && figures ? [s.type, "figures" as const] : [s.type]
    );
  return order.indexOf(key) + 1;
}

/* ── Trennstellen langer Bandnamen ───────────────────────────────────── */

/**
 * Häufige Grundwörter in Leistungsnamen. Trennt der Browser selbst
 * („JAHRESAB-SCHLUSS"), landet der Strich oft mitten im Wort; an der
 * Kompositionsfuge liest es sich wie im Systemblatt („JAHRES-ABSCHLUSS").
 */
const HEADS = [
  "abschluss", "abrechnung", "arbeiten", "beratung", "behandlung",
  "betreuung", "buchhaltung", "dämmung", "dienst", "einbau", "entsorgung",
  "erklärung", "fahrten", "färbung", "gestaltung", "haltung", "installation",
  "kosmetik", "massage", "montage", "öffnung", "pflege", "planung",
  "prüfung", "reinigung", "reparatur", "sanierung", "schnitt", "schutz",
  "service", "technik", "therapie", "training", "transfer", "tausch",
  "unterricht", "verkauf", "vermessung", "vermietung", "versicherung",
  "vermittlung", "wartung", "wechsel",
].sort((a, b) => b.length - a.length);
const MIN_PREFIX = 3;
/** Weiche Trennstelle. */
const SHY = "\u00AD";

/**
 * Bandname mit weicher Trennstelle (U+00AD) an der Kompositionsfuge, nur
 * für Wörter, die bei 2,5 rem nicht in die Handy-Spalte passen. Ohne
 * bekannte Fuge bleibt das Wort — dann trennt der Browser (`hyphens:auto`).
 */
export function bandTitle(title: string): {
  text: string;
  manual: boolean;
  /** Breite des längsten Stücks nach dem Trennen (inkl. Strich) in em. */
  partEm: number;
} {
  let manual = false;
  const text = title.replace(/\p{L}+/gu, word => {
    if (REFERENCE_COLUMN_REM / wordWidthEm(word, FIGURE_TRACK) >= BAND_FLOOR_REM)
      return word;
    const lower = word.toLocaleLowerCase("de-DE");
    const head = HEADS.find(
      h => lower.endsWith(h) && lower.length - h.length >= MIN_PREFIX
    );
    if (!head) return word;
    manual = true;
    const at = word.length - head.length;
    return `${word.slice(0, at)}${SHY}${word.slice(at)}`;
  });
  const parts = text
    .split(/\s+/)
    .flatMap(w =>
      w.split(SHY).map((p, k, all) => (k < all.length - 1 ? `${p}-` : p))
    );
  const partEm = Math.max(0, ...parts.map(p => wordWidthEm(p, FIGURE_TRACK)));
  return { text, manual, partEm };
}

/* ── Stapeln nur, wenn jedes Band auf den Bildschirm passt ────────────── */

/**
 * Ein klebendes Band, das höher ist als der Bildschirm, wird vom nächsten
 * überdeckt, bevor sein Ende gelesen ist. Ohne JS: Die Höhe jedes Bands
 * wird serverseitig aus den Tokens geschätzt, an einem kleinen Handy
 * (320 × 568, Band 85svh) und einem kleinen Desktop (900 × 600, Band
 * 100svh). Passt ein Band nicht, fließen auf dieser Breite ALLE Bänder
 * normal (kein Sticky) — ein halber Stapel wäre schlimmer.
 *
 * Höhe = Polster oben (m) + Kopfzeile (kicker) + Abstand vor dem Namen (xl)
 *      + Namenszeilen (figure, eingepasst) + Abstand (s) + Erklärung (h3,
 *      Zeilen über Zeichen je Zeile) + Polster unten (Handy: Leiste + l,
 *      Desktop: gutter).
 * Zeichenbreite der Erklärung: 0,55 em je Zeichen (Geist-Kleinbuchstaben
 * im Mittel ~0,5 em, bewusst großzügig). Bei Handy-Spalte 17,75 rem und
 * h3 22 px ergibt das ~23 Zeichen je Zeile; bei einem einzeiligen Namen
 * kippt das Handy ab rund 180 Zeichen Erklärung.
 */
const REM = 16;
const sp = (k: keyof typeof RASTER.space) =>
  parseFloat(RASTER.space[k]) || 0;
const DESC_CHAR_EM = 0.55;

export type BandViewport = {
  widthRem: number;
  heightRem: number;
  /** Anteil der Bildschirmhöhe (85svh bzw. 100svh). */
  bandShare: number;
  /** Polster unten zusätzlich zu den Tokens (Handy-Leiste). */
  dockRem: number;
  /** Max. Satzbreite der Erklärung in em (Systemblatt: 20 bzw. 24). */
  descMaxEm: number;
};

export const BAND_PHONE: BandViewport = {
  widthRem: 320 / REM,
  heightRem: 568 / REM,
  bandShare: 0.85,
  dockRem: sp("l") + sp("m"),
  descMaxEm: 20,
};
export const BAND_DESKTOP: BandViewport = {
  widthRem: 900 / REM,
  heightRem: 600 / REM,
  bandShare: 1,
  dockRem: 0,
  descMaxEm: 24,
};

/** Geschätzte Bandhöhe in rem bei gegebener Bildschirmgröße. */
export function bandHeightRem(item: Service, vp: BandViewport): number {
  const gutter = clampAt(RASTER.space.gutter, vp.widthRem);
  const column = vp.widthRem - 2 * gutter;
  const kicker = parseFloat(RASTER.type.kicker.size) * RASTER.type.kicker.line;
  // Name: Größe wie im CSS, Zeilen über die Umbruchstellen gierig gefüllt.
  const figureMax = clampAt(RASTER.type.figure!.size, vp.widthRem);
  const { text, manual, partEm } = bandTitle(item.title);
  const widest = manual && vp === BAND_PHONE ? partEm : fitBandName(item.title).widthEm;
  const size = Math.max(BAND_FLOOR_REM, Math.min(figureMax, column / (widest || 1)));
  const pieces = text
    .split(/\s+/)
    .flatMap(w => (manual && vp === BAND_PHONE ? w.split(SHY) : [w]));
  let lines = 0;
  let line = "";
  for (const piece of pieces) {
    const next = line ? `${line} ${piece}` : piece;
    if (line && wordWidthEm(next, FIGURE_TRACK) * size > column) {
      lines++;
      line = piece;
    } else line = next;
  }
  if (line) lines++;
  const name = lines * size * RASTER.type.figure!.line;
  // Erklärung
  const h3 = clampAt(RASTER.type.h3.size, vp.widthRem);
  const descWidth = Math.min(column, vp.descMaxEm * h3);
  const perLine = Math.max(1, Math.floor(descWidth / (h3 * DESC_CHAR_EM)));
  const descLines = item.description
    ? Math.ceil(item.description.length / perLine)
    : 0;
  const desc = descLines
    ? sp("s") + descLines * h3 * RASTER.type.h3.line
    : 0;
  const bottom = vp === BAND_PHONE ? vp.dockRem + sp("l") : gutter;
  return sp("m") + kicker + sp("xl") + name + desc + bottom;
}

/** Passt jedes Band auf diesen Bildschirm? Sonst fließen die Bänder. */
export function bandsFit(items: readonly Service[], vp: BandViewport): boolean {
  return items.every(i => bandHeightRem(i, vp) <= vp.heightRem * vp.bandShare);
}
