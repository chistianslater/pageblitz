import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { claimPhotos, voiceList, type SystemSection } from "../shared";

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
  hidden: readonly string[],
  freeGallery = false
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
  }, freeGallery);
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
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toLocaleUpperCase("de");
}

/* ── Stimmen ──────────────────────────────────────────────────────────── */

export type { Voice } from "../shared/voice";
/** Stimmen — Regeln in shared/voice.ts (voiceList, geteilt mit Nacht). */
export const klarVoices = voiceList;

/* ── Text ─────────────────────────────────────────────────────────────── */

/** Absätze aus Leerzeilen. */
export const paragraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

/* ── Vorteile ohne Doppel ─────────────────────────────────────────────── */

/**
 * Vorteile, die schon als Fakten-Chip im Einstieg stehen und keinen
 * eigenen Satz haben, entfallen (gleicher Schlüssel wie die Chips). Bleibt
 * keiner übrig, entfällt das Kapitel — vor der Navigation, damit kein
 * Anker ins Leere zeigt. Nur Seiten mit Einstieg (dort stehen die Chips).
 */
export function withoutChipEchoes<T extends SystemSection>(
  sections: readonly T[],
  chipKeys: readonly string[],
  key: (t: string) => string
): T[] {
  if (!sections.some(s => s.type === "hero") || chipKeys.length === 0)
    return [...sections];
  return sections.flatMap((s): T[] => {
    if (s.type !== "usp") return [s];
    const u = s as T & SectionOf<"usp">;
    const items = u.items.filter(
      i => Boolean(i.text?.trim()) || !chipKeys.includes(key(i.title))
    );
    if (items.length === u.items.length) return [s];
    return items.length > 0 ? [{ ...u, items } as T] : [];
  });
}
