import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { Blueprint } from "../../../../../../shared/blueprints/blueprints";
import { formatHeroRating } from "../shared/heroFacts";
import { claimPhotos, type SystemSection } from "../shared";
import type { IconName } from "./icons";

/**
 * Reine Daten-Regeln für die Nacht-Kapitel (Fotos, Kapitel-Ziffer,
 * Bewertung, Symbole). Nichts wird erfunden: Fehlt eine Angabe, entfällt
 * das Element.
 */

/* ── Fotos ────────────────────────────────────────────────────────────── */

/** Zwei Galeriefotos neben der Karte, mit dem Alt-Text der Galerie. */
export type PairPhoto = { url: string; alt: string };
export type PairPhotos = readonly [PairPhoto, PairPhoto];

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
  hidden: readonly string[],
  freeGallery = false
): { list: T[]; pair?: PairPhotos } {
  let pair: PairPhotos | undefined;
  const { list } = claimPhotos(sections, hidden, (all, claimed) => {
    const gallery = all.find(
      (s): s is SectionOf<"gallery"> => s.type === "gallery"
    );
    // Erstes Vorkommen je Adresse, mit seinem Alt-Text.
    const free = (gallery?.images ?? []).filter(
      (img, i, list) =>
        !claimed.has(img.url) && list.findIndex(o => o.url === img.url) === i
    );
    if (all.some(s => s.type === "menu") && free.length >= 2 + PAIR_KEEPS)
      pair = [
        { url: free[0].url, alt: free[0].alt ?? "" },
        { url: free[1].url, alt: free[1].alt ?? "" },
      ];
    const pairUrls = (pair ?? []).map(p => p.url);
    const taken = new Set([...claimed, ...pairUrls]);
    const team = all.find((s): s is SectionOf<"team"> => s.type === "team");
    const portraits = [
      ...new Set(
        (team?.members ?? [])
          .map(m => m.imageUrl)
          .filter((u): u is string => Boolean(u) && !taken.has(u!))
      ),
    ];
    const picked = [...pairUrls, ...portraits];
    return picked.length ? picked : undefined;
  }, freeGallery);
  const hero = list.find((s): s is T & SectionOf<"hero"> => s.type === "hero");
  const seen = new Set<string>([
    ...(hero?.imageUrl && !hidden.includes("hero-media")
      ? [hero.imageUrl]
      : []),
    ...(pair ?? []).map(p => p.url),
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
  if (
    section.type !== "menu" &&
    section.type !== "services" &&
    section.type !== "pricelist"
  )
    return undefined;
  const count =
    section.type === "services"
      ? section.items.length
      : section.categories.reduce((n, c) => n + c.items.length, 0);
  if (count < OPENER_MIN || count > OPENER_MAX) return undefined;
  return { value: String(count), word: openerWord(section, blueprint) };
}

/**
 * Getränkekarte: ein Wort der Kategorie ist ein Getränk (auch als Wortende:
 * „Rotweine", „Fassbier") und keins ist Essen — „Weinbergschnecken" oder
 * „Kaffee & Kuchen" zählen nicht. Ganze Wörter, keine Teilstrings.
 */
const DRINK_WORD =
  /^\p{L}*(?:wein|weine|bier|biere|getränk|getränke|drink|drinks|cocktail|cocktails|spirituosen|schnaps|schnäpse|brände|aperitif|aperitifs|digestif|digestifs|kaffee|tee|tees|saft|säfte|limonade|limonaden|alkoholfrei|alkoholfreie|alkoholfreies)$/u;
const FOOD_WORD =
  /^(?:kuchen|torte|torten|speise|speisen|essen|gericht|gerichte|snack|snacks|frühstück|brot|dessert|desserts|eis|gebäck)$/u;

export function isDrinkCategory(name: string): boolean {
  const words = name.toLocaleLowerCase("de").split(/[^\p{L}]+/u).filter(Boolean);
  return words.some(w => DRINK_WORD.test(w)) && !words.some(w => FOOD_WORD.test(w));
}

/**
 * Geisterwort zur Zählung, nach Abschnitt und Branche: Karte → „Gerichte",
 * Preisliste in der Gastronomie → „Getränke", wenn jede Kategorie danach
 * heißt, sonst „Posten"; Unterkunft → „Angebote"; sonst „Leistungen".
 */
export function openerWord(
  section: SectionOf<"menu"> | SectionOf<"services"> | SectionOf<"pricelist">,
  blueprint: Blueprint
): string {
  if (section.type === "menu") return "Gerichte";
  if (blueprint.id === "stay") return "Angebote";
  if (section.type === "pricelist" && blueprint.id === "gastro") {
    const named = section.categories.filter(c => c.items.length > 0);
    return named.length > 0 && named.every(c => isDrinkCategory(c.name))
      ? "Getränke"
      : "Posten";
  }
  return "Leistungen";
}

/** „3 Gerichte" / „1 Gericht" an der Kategorie der Karte. */
export const dishCount = (n: number) =>
  `${n} ${n === 1 ? "Gericht" : "Gerichte"}`;

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
  [
    /bezahl|zahlung|\bzahlen|\bkarte\b|kartenzahl|\bbar\b|apple pay|paypal|\bec\b|kredit/i,
    "card",
  ],
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
