import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { pickReviewQuote } from "../../artDirection/heroFacts";
import { claimPhotos, unquote, voiceOf, type SystemSection } from "../shared";

/**
 * Reine Daten-Regeln für die Klar-Kapitel (Fotos, Monogramme, Stimmen).
 * Nichts wird erfunden: Fehlt eine Angabe, entfällt das Element.
 */

/* ── Fotos ────────────────────────────────────────────────────────────── */

/**
 * Jedes Foto höchstens einmal je Seite, in Renderrolle: Einstieg → Team
 * (Porträts) → Über uns → Galerie (claimPhotos). Ein Teamfoto, das schon
 * im Einstieg oder bei einem anderen Mitglied steht, wird zum Monogramm —
 * das Foto selbst bleibt auf der Seite; ein brauchbares Kundenfoto fällt
 * nie ganz weg.
 */
export function klarPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[] } {
  const { list } = claimPhotos(sections, hidden, (all, claimed) => {
    const team = all.find((s): s is SectionOf<"team"> => s.type === "team");
    const picked = [
      ...new Set(
        (team?.members ?? [])
          .map(m => m.imageUrl)
          .filter((u): u is string => Boolean(u) && !claimed.has(u!))
      ),
    ];
    return picked.length ? picked : undefined;
  });
  const hero = list.find((s): s is T & SectionOf<"hero"> => s.type === "hero");
  const seen = new Set<string>(
    hero?.imageUrl && !hidden.includes("hero-media") ? [hero.imageUrl] : []
  );
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
  return { list: out };
}

/* ── Monogramm ────────────────────────────────────────────────────────── */

/** Titel und Namenszusätze zählen nicht („Dr.", „med.", „von"). */
const SKIP = /^(dr|prof|med|dent|dipl|von|van|de|der|zu)\.?$/i;

/**
 * Zwei Buchstaben aus Vor- und Familienname („Dr. Katrin Sommer" → KS),
 * ein Wort → ein Buchstabe. Doppelnamen zählen ab dem ersten Teil.
 */
export function monoInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(w => w && !SKIP.test(w) && /^\p{L}/u.test(w));
  if (words.length === 0) return "·";
  const first = Array.from(words[0])[0];
  const last =
    words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase("de");
}

/* ── Stimmen ──────────────────────────────────────────────────────────── */

export type Voice = { text: string; author: string; stars: boolean };

/**
 * Stimmen: zuerst die beste (voiceOf/pickReviewQuote), danach jede weitere
 * zitierfähige Bewertung in Reihenfolge der Daten — Kritik und Wertungen
 * unter 5 entfallen (gleiche Regel wie pickReviewQuote je Eintrag).
 */
export function klarVoices(
  items: SectionOf<"testimonials">["items"]
): Voice[] {
  const lead = voiceOf(items);
  if (!lead) return [];
  const rest = items.flatMap((item): Voice[] => {
    const own = pickReviewQuote([item]);
    if (!own) return [];
    const text = unquote(own.text);
    if (own.author.trim() === lead.author && text === lead.text) return [];
    return [{ text, author: own.author.trim(), stars: item.rating === 5 }];
  });
  return [lead, ...rest];
}

/* ── Text ─────────────────────────────────────────────────────────────── */

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);
