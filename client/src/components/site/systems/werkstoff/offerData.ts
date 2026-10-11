import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { claimPhotos, type SystemSection } from "../shared";

/**
 * Reine Daten-Regeln für Werkstoff-Angebot und -Galerie. Keine neuen
 * Schemafelder: Die Tageszeitleiste ist der `process`-Abschnitt, wenn jeder
 * Schritt mit einer Uhrzeit beginnt; Fotos stammen nur aus dem Dokument.
 */

/**
 * Uhrzeit am Anfang eines Schritt-Titels: „5:00", „05:30 Uhr", „6.00 Uhr:".
 * Danach optional ein Trenner (– - · : ,) und der Rest als Bezeichnung.
 * Ohne Lookbehind (Safari < 16.4).
 */
const TIME_START =
  /^(\d{1,2})[:.](\d{2})(?!\d)(?:\s*Uhr\b)?\s*(?:[–\-·:,]\s*)?(.*)$/s;

export function stepTime(
  title: string
): { time: string; label: string } | undefined {
  const m = title.trim().match(TIME_START);
  if (!m) return undefined;
  // „4.50 € Brötchen" ist ein Preis, keine Uhrzeit.
  if (/^(€|euro?\b)/i.test(m[3])) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return undefined;
  return { time: `${h}:${m[2]}`, label: m[3].trim() };
}

/** Reiner Wochentag („Di", „Dienstag", „So.") — dann darf eine Tafelzeile „heute" tragen. */
const DAY_NAME =
  /^(mo(ntag)?|di(enstag)?|mi(ttwoch)?|do(nnerstag)?|fr(eitag)?|sa(mstag)?|so(nntag|nnabend)?)\.?$/i;

export const isDayName = (name: string) => DAY_NAME.test(name.trim());

/** „So." → „So", „Sonnabend" → „Sa" — Form, die `coversToday` versteht. */
export function normalizeDay(name: string): string {
  const t = name.trim().replace(/\.$/, "");
  return /^sonnabend$/i.test(t) ? "Sa" : t;
}

export type ProcessMode = "timeline" | "numbers";

/** Zeitleiste (Northdock), wenn alle Schritte mit Uhrzeit beginnen; sonst 1·2·3. */
export function processMode(section: SectionOf<"process">): ProcessMode {
  return section.steps.length > 0 &&
    section.steps.every(s => stepTime(s.title) !== undefined)
    ? "timeline"
    : "numbers";
}

/** So viele Fotos bleiben der Galerie mindestens (Werkbank-Raster ab 2). */
const GALLERY_KEEP = 2;

/**
 * Foto am Ablauf (Systemblatt „Ablauf 1·2·3": Foto, dann Ziffern). Das
 * Schema kennt kein Ablauf-Foto; Quelle ist die Galerie des Betriebs (erstes
 * noch freies Foto) — nur, wenn ihr danach noch zwei bleiben. Die
 * Zeitleiste trägt keine Fotos (Systemblatt: nur, wenn jede Karte eins hat).
 */
export function processPhoto(
  sections: readonly SystemSection[],
  claimed: ReadonlySet<string>
): string[] | undefined {
  const process = sections.find(
    (s): s is SectionOf<"process"> => s.type === "process"
  );
  if (!process || processMode(process) !== "numbers") return undefined;
  const gallery = sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  // Das Über-uns-Foto steht für den Betrieb und bleibt dort.
  const about = sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  )?.imageUrl;
  const free = [...new Set(gallery?.images.map(i => i.url) ?? [])].filter(
    u => !claimed.has(u) && u !== about
  );
  return free.length > GALLERY_KEEP ? [free[0]] : undefined;
}

/** Jedes Foto höchstens einmal: Einstieg → Ablauf → Über uns → Galerie. */
export function werkstoffPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[]; offerPhotos?: string[] } {
  return claimPhotos(sections, hidden, processPhoto);
}

/** Größe eines Werkbank-Rasters (Systemblatt: 2 bis 4 Fotos). */
const GROUP_MAX = 4;

/**
 * Viele Fotos → mehrere Werkbank-Raster nacheinander, je 2 bis 4 Fotos;
 * nie bleibt eins allein (4+1 wird 3+2). Nur bei genau einem Foto steht es
 * allein — ein Foto des Betriebs fällt nie weg.
 */
export function galleryGroups(count: number): number[] {
  if (count <= GROUP_MAX) return count > 0 ? [count] : [];
  const groups: number[] = [];
  let left = count;
  while (left > 0) {
    const take = Math.min(GROUP_MAX, left);
    groups.push(take);
    left -= take;
  }
  if (groups[groups.length - 1] === 1) {
    groups[groups.length - 2] -= 1;
    groups[groups.length - 1] = 2;
  }
  return groups;
}
