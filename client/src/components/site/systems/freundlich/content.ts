import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { formatHeroRating } from "../shared/heroFacts";
import { claimPhotos, type SystemSection } from "../shared";
import type { IconName } from "./icons";

/**
 * Reine Daten-Regeln für die Freundlich-Kapitel (Flächen, Wolken, Titel,
 * Symbole, Fotos, Bewertung). Nichts wird erfunden: Fehlt eine Angabe,
 * entfällt das Element.
 */

/* ── Flächen und Wolken ───────────────────────────────────────────────── */

/**
 * Fläche eines Kapitels (Systemblatt 11–18): Papier, Band (Wechselfläche),
 * Pastell 2 (Team) oder Pastell 4 (Abschluss-Band). Text auf Pastell immer
 * in der Tinte des Pastells.
 */
export type Surface = "paper" | "band" | "tint2" | "tint4";

const SURFACE: Partial<Record<SystemSection["type"], Surface>> = {
  services: "band",
  menu: "band",
  pricelist: "band",
  testimonials: "band",
  team: "tint2",
  cta: "tint4",
};

/**
 * Fläche je Abschnitt in Renderreihenfolge. Nach dem Foto-Einstieg liegt
 * die erste Fläche immer auf dem Band (Systemblatt 10/16: Wolke in
 * Bandfarbe) — eine Papierfläche wird dort zum Band.
 */
export function surfacePlan(
  sections: readonly SystemSection[],
  photoEntry: boolean
): Surface[] {
  return sections.map((s, i) => {
    const own = SURFACE[s.type] ?? "paper";
    const afterPhoto = photoEntry && i === 1 && sections[0]?.type === "hero";
    return afterPhoto && own === "paper" ? "band" : own;
  });
}

/**
 * Wolke am oberen Rand: nur beim Wechsel von einer anderen Fläche auf eine
 * gefüllte (Band/Pastell). Nach dem Einstieg zeichnet der Einstieg die
 * Wolke selbst; zurück aufs Papier bleibt die Kante gerade (Systemblatt 17).
 */
export function cloudAt(
  sections: readonly SystemSection[],
  plan: readonly Surface[],
  i: number
): boolean {
  if (i === 0 || plan[i] === "paper") return false;
  if (sections[i - 1]?.type === "hero") return false;
  return plan[i - 1] !== plan[i];
}

/* ── Titel ────────────────────────────────────────────────────────────── */

/**
 * Kapiteltitel in zwei Tönen (Systemblatt 7: „Was wir für / euren Hund
 * tun", „Ein Tag bei uns"): die letzten Wörter in Akzent — bis drei Wörter
 * das letzte, sonst die hintere Hälfte (abgerundet). Titel mit
 * Auszeichnung (`*`, `_`, `[`) oder aus einem Wort bleiben ganz.
 */
export function titleSplit(text: string): { lead: string; rest?: string } {
  const t = text.trim();
  if (/[*_[\]]/.test(t)) return { lead: t };
  const words = t.split(/\s+/);
  if (words.length < 2) return { lead: t };
  const take = words.length <= 3 ? 1 : Math.floor(words.length / 2);
  return {
    lead: words.slice(0, -take).join(" "),
    rest: words.slice(-take).join(" "),
  };
}

/* ── Symbole ──────────────────────────────────────────────────────────── */

const OFFER: readonly (readonly [RegExp, IconName])[] = [
  [/wasch|bad\b|bade|shampoo|föhn/i, "drop"],
  [/schneid|schnitt|schere|trimm|frisur|haar/i, "scissors"],
  [/kennenlern|eingewöhn|willkommen|schnupper/i, "heart"],
  [/kralle|pfote|hund|katze|tier|welpe|fell/i, "paw"],
  [/musik|gesang|singen|klavier|gitarre|geige|instrument/i, "music"],
  [/nachhilfe|lern|schul|hausaufgab|lesen|mathe|sprach/i, "book"],
  [/\beis\b|kugel|waffel|gelato|sorbet/i, "cone"],
  [/kaffee|espresso|tee\b|getränk|cappuccino/i, "cup"],
  [/essen|mittag|frühstück|küche|bio\b|vegan|vegetar/i, "leaf"],
  [/draußen|garten|natur|ausflug|wald/i, "sun"],
  [/gruppe|kinder|familie|eltern|kurs/i, "people"],
  [/beratung|hebamme|geburt|schwanger|vorsorge/i, "smile"],
  [/zuhause|hausbesuch|betreuung|tagesmutter|kita/i, "home"],
  [/termin|ablauf|tag\b|tagesablauf|zeit/i, "calendar"],
  [/mitnehmen|abhol|bestell|torte|becher/i, "bag"],
];

/** Symbol in der Kachel nach Schlagworten im Titel; sonst nichts. */
export function offerIcon(title: string): IconName | undefined {
  return OFFER.find(([re]) => re.test(title))?.[1];
}

/** Zwei Buchstaben für die Kachel ohne Symbol („Eingewöhnung" → „Ei"). */
export function tileLetters(title: string): string {
  const letters = Array.from(title.trim()).filter(c => /\p{L}|\p{N}/u.test(c));
  if (letters.length === 0) return "·";
  const [a, b = ""] = letters;
  return `${a.toLocaleUpperCase("de")}${b.toLocaleLowerCase("de")}`;
}

/** Zwei Buchstaben aus Vor- und Familienname („Anke Bremer" → AB). */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(w => /^\p{L}/u.test(w) && !/^(dr|prof|med|und|&)\.?$/i.test(w));
  if (words.length === 0) return "·";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase("de");
}

/** Pastell je Eintrag im Wechsel (1–4); `skip` = Pastell der Fläche. */
export function tintOf(i: number, skip?: number): number {
  const cycle = [1, 2, 3, 4].filter(t => t !== skip);
  return cycle[i % cycle.length];
}

/* ── Fotos ────────────────────────────────────────────────────────────── */

/**
 * Jedes Foto höchstens einmal je Seite (claimPhotos), in Renderrolle:
 * Einstieg → Team-Porträts → Über uns → Galerie (frei: drei Fotos, die die
 * Seite noch nicht zeigt). Ein Porträt, das schon als Einstieg steht, wird
 * zur Initiale; das Foto selbst bleibt auf der Seite. Eine danach leere
 * Galerie entfällt.
 *
 * Angebotskarten tragen kein Foto: Betreiber-Entscheid 2026-10-13 „nur,
 * wenn jedes Angebot eins hat" — die Leistungen führen kein eigenes Foto
 * (Schema), also nie Galeriefotos an fremden Angeboten.
 */
export function freundlichPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[],
  freeGallery: boolean
): T[] {
  const { list } = claimPhotos(
    sections,
    hidden,
    (all, claimed) => {
      const team = all.find((s): s is SectionOf<"team"> => s.type === "team");
      const portraits = [
        ...new Set(
          (team?.members ?? [])
            .map(m => m.imageUrl)
            .filter((u): u is string => Boolean(u) && !claimed.has(u!))
        ),
      ];
      return portraits.length ? portraits : undefined;
    },
    freeGallery
  );
  const hero = list.find((s): s is T & SectionOf<"hero"> => s.type === "hero");
  const seen = new Set<string>(
    hero?.imageUrl && !hidden.includes("hero-media") ? [hero.imageUrl] : []
  );
  return list
    .map((s): T => {
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
    })
    .filter(s => s.type !== "gallery" || s.images.length > 0);
}

/* ── Bewertung ────────────────────────────────────────────────────────── */

/** „4,9 von 5" + „87 Bewertungen auf Google" — nur mit echten Zahlen. */
export function ratingBadge(
  doc: WebsiteDataV2
): { value: string; text: string } | undefined {
  const g = doc.google;
  if (!g || !(g.reviewCount > 0) || !(g.rating > 0) || g.rating > 5)
    return undefined;
  const count = g.reviewCount.toLocaleString("de-DE");
  const noun = g.reviewCount === 1 ? "Bewertung" : "Bewertungen";
  return {
    value: `${formatHeroRating(g.rating)} von 5`,
    text: `${count} ${noun} auf Google`,
  };
}

/* ── Text ─────────────────────────────────────────────────────────────── */

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/** Kurze Karte: höchstens so viele Posten als Einzelkarten (Systemblatt 11). */
export const ITEM_CARDS_MAX = 8;
