import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/stylePacks/blueprints";
import { formatHeroRating } from "../../artDirection/ArtDirectedHero";
import { claimPhotos, type SystemSection } from "../shared";
import type { IconName } from "./icons";

/**
 * Reine Daten-Regeln für die Nacht-Kapitel (Fotos, Kapitel-Ziffer,
 * Bewertung, Symbole). Nichts wird erfunden: Fehlt eine Angabe, entfällt
 * das Element.
 */

/* ── Fotos ────────────────────────────────────────────────────────────── */

/** Bildpaar neben der Karte nur, wenn der Galerie danach noch so viele bleiben. */
const PAIR_KEEPS = 2;

/**
 * Jedes Foto höchstens einmal je Seite (claimPhotos), in Renderrolle:
 * Einstieg → Bildpaar an der Karte (Systemblatt 10/15: zwei Galeriefotos
 * versetzt neben der Speisekarte — nur, wenn die Galerie danach noch
 * mindestens zwei behält) → Team (Porträts) → Über uns → Galerie. Ein
 * Teamfoto, das schon woanders steht, wird zum Monogramm; das Foto selbst
 * bleibt auf der Seite — ein Kundenfoto fällt nie ganz weg.
 */
export function nachtPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[]; pair?: [string, string] } {
  let pair: [string, string] | undefined;
  const { list } = claimPhotos(sections, hidden, (all, claimed) => {
    const gallery = all.find(
      (s): s is SectionOf<"gallery"> => s.type === "gallery"
    );
    const free = [
      ...new Set(
        (gallery?.images ?? []).map(i => i.url).filter(u => !claimed.has(u))
      ),
    ];
    if (all.some(s => s.type === "menu") && free.length >= 2 + PAIR_KEEPS)
      pair = [free[0], free[1]];
    const taken = new Set([...claimed, ...(pair ?? [])]);
    const team = all.find((s): s is SectionOf<"team"> => s.type === "team");
    const portraits = [
      ...new Set(
        (team?.members ?? [])
          .map(m => m.imageUrl)
          .filter((u): u is string => Boolean(u) && !taken.has(u!))
      ),
    ];
    const picked = [...(pair ?? []), ...portraits];
    return picked.length ? picked : undefined;
  });
  const hero = list.find((s): s is T & SectionOf<"hero"> => s.type === "hero");
  const seen = new Set<string>([
    ...(hero?.imageUrl && !hidden.includes("hero-media") ? [hero.imageUrl] : []),
    ...(pair ?? []),
  ]);
  const out = list.map((s): T => {
    if (s.type !== "team") return s;
    const t = s as T & SectionOf<"team">;
    let changed = false;
    const members = t.members.map(m => {
      if (!m.imageUrl) return m;
      if (seen.has(m.imageUrl)) {
        changed = true;
        const { imageUrl: _drop, ...rest } = m;
        return rest;
      }
      seen.add(m.imageUrl);
      return m;
    });
    return changed ? ({ ...t, members } as T) : s;
  });
  return pair ? { list: out, pair } : { list: out };
}

/* ── Kapitel-Ziffer ───────────────────────────────────────────────────── */

export type Opener = { value: string; word: string };

/** Erst ab so vielen Einträgen trägt die Zahl eine Ziffer. */
const OPENER_MIN = 3;
const OPENER_MAX = 99;

/**
 * Große Kupferziffer über dem ersten Angebots-Kapitel (Systemblatt 10:
 * „7 Gänge", „6 Leistungen") — nur als echte Zählung der Einträge:
 * Gerichte der Karte, Leistungen bzw. Angebote, Posten der Preisliste.
 * Genau ein Kapitel je Seite trägt sie (das erste von Karte, Leistungen,
 * Preisliste); unter drei Einträgen entfällt sie.
 */
export function openerOf(
  section: SystemSection,
  sections: readonly SystemSection[],
  blueprint: Blueprint
): Opener | undefined {
  const first = sections.find(
    s => s.type === "menu" || s.type === "services" || s.type === "pricelist"
  );
  if (first !== section) return undefined;
  const count =
    section.type === "services"
      ? section.items.length
      : section.type === "menu" || section.type === "pricelist"
        ? section.categories.reduce((n, c) => n + c.items.length, 0)
        : 0;
  if (count < OPENER_MIN || count > OPENER_MAX) return undefined;
  const word =
    section.type === "menu"
      ? "Gerichte"
      : section.type === "services" && blueprint.id === "stay"
        ? "Angebote"
        : "Leistungen";
  return { value: String(count), word };
}

/** „3 Gerichte" / „1 Gericht" an der Kategorie der Karte. */
export const dishCount = (n: number) => `${n} ${n === 1 ? "Gericht" : "Gerichte"}`;

/* ── Bewertung ────────────────────────────────────────────────────────── */

/** „4,8" + „von 5 · 312 Bewertungen auf Google" — nur mit echten Zahlen. */
export function ratingLine(
  doc: WebsiteDataV2
): { value: string; text: string } | undefined {
  const g = doc.google;
  if (!g || !(g.reviewCount > 0) || !(g.rating > 0) || g.rating > 5)
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const noun = g.reviewCount === 1 ? "Bewertung" : "Bewertungen";
  return {
    value: formatHeroRating(g.rating),
    text: `von 5 · ${count} ${noun} auf Google`,
  };
}

/* ── Gut zu wissen ────────────────────────────────────────────────────── */

const KNOW: readonly (readonly [RegExp, IconName])[] = [
  [/hund|haustier|tiere?\b/i, "paw"],
  [/park|stellpl|auto\b|garage/i, "car"],
  [/barriere|rollstuhl|rollator|stufe|aufzug|treppe|rampe/i, "access"],
  [/vegan|vegetar|allerg|gluten|laktose|unvertr/i, "leaf"],
  [/frühstück|kaffee|getränk/i, "cup"],
  [/bezahl|zahlung|\bzahlen|\bkarte\b|kartenzahl|\bbar\b|apple pay|paypal|\bec\b|kredit/i, "card"],
  [/absag|storn|termin|reserv|buch/i, "calendar"],
  [/check.?in|check.?out|anreise|abreise|wann|uhr\b|zeit/i, "clock"],
];

/** Symbol im Kupferring je Frage (nur Schlagworte der Frage); sonst „i". */
export function knowIcon(question: string): IconName {
  return KNOW.find(([re]) => re.test(question))?.[1] ?? "info";
}

/* ── Text ─────────────────────────────────────────────────────────────── */

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Zwei Buchstaben aus Vor- und Familienname („Meral Aydın" → MA). */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(w => /^\p{L}/u.test(w) && !/^(dr|prof|med)\.?$/i.test(w));
  if (words.length === 0) return "·";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase("de");
}
