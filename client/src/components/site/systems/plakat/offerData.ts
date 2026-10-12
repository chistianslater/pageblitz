import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { claimPhotos, type SystemSection } from "../shared";
import { lateClose, type Hours } from "./hours";

/**
 * Reine Daten-Regeln für Plakat-Inhalte (Leistungen, Ablauf, Team,
 * Galerie, Stimme, Zeiten). Nichts wird erfunden: Fehlt eine Angabe,
 * entfällt das Element.
 */

/* ── Fotos ────────────────────────────────────────────────────────────── */

/** So viele Fotos bleiben der Galerie mindestens, wenn der Ablauf eins nimmt. */
const GALLERY_KEEP = 2;

/**
 * Jedes Foto höchstens einmal je Seite, in Renderrolle: Einstieg → Team
 * (Kreise) → Ablauf (Bogen, erstes freies Galeriefoto, nur wenn der
 * Galerie zwei bleiben) → Über uns → Galerie. Ein Teamfoto, das schon im
 * Einstieg steht oder doppelt vorkommt, wird zum Monogramm — das Foto
 * selbst bleibt auf der Seite (nie fällt ein brauchbares Kundenfoto weg).
 */
export function plakatPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[]; processPhoto?: string } {
  let processPhoto: string | undefined;
  const { list } = claimPhotos(sections, hidden, (all, claimed) => {
    const taken = new Set(claimed);
    const team = all.find((s): s is SectionOf<"team"> => s.type === "team");
    const teamPhotos: string[] = [];
    for (const m of team?.members ?? [])
      if (m.imageUrl && !taken.has(m.imageUrl)) {
        taken.add(m.imageUrl);
        teamPhotos.push(m.imageUrl);
      }
    const process = all.some(s => s.type === "process");
    // Das Über-uns-Foto bleibt dort — außer es ist ausgeblendet.
    const about = hidden.includes("about-media")
      ? undefined
      : all.find((s): s is SectionOf<"about"> => s.type === "about")
          ?.imageUrl;
    const gallery = all.find(
      (s): s is SectionOf<"gallery"> => s.type === "gallery"
    );
    const free = [...new Set(gallery?.images.map(i => i.url) ?? [])].filter(
      u => !taken.has(u) && u !== about
    );
    if (process && free.length > GALLERY_KEEP) processPhoto = free[0];
    const picked = [...teamPhotos, ...(processPhoto ? [processPhoto] : [])];
    return picked.length ? picked : undefined;
  });
  const hero = list.find((s): s is T & SectionOf<"hero"> => s.type === "hero");
  const heroUrl =
    hero?.imageUrl && !hidden.includes("hero-media") ? hero.imageUrl : "";
  const seen = new Set<string>([heroUrl]);
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
  return { list: out, ...(processPhoto ? { processPhoto } : {}) };
}

/** Fotos je Galerie-Gruppe (Systemblatt: stehende Pille, Bogen, liegende Pille). */
const GROUP_MAX = 3;

/** Viele Fotos → Gruppen zu 3 (oder 2); nie bleibt eins allein, außer es ist das einzige. */
export function galleryGroups(count: number): number[] {
  if (count <= GROUP_MAX) return count > 0 ? [count] : [];
  const groups: number[] = [];
  let left = count;
  while (left > 0) {
    // 4 → 2 + 2, sonst Dreier, solange danach keiner allein bleibt.
    const take = left === 4 ? 2 : Math.min(GROUP_MAX, left);
    groups.push(take);
    left -= take;
  }
  return groups;
}

/* ── Preise ───────────────────────────────────────────────────────────── */

export { rowPrice } from "../shared/price";

/* ── Zeiten ───────────────────────────────────────────────────────────── */

/** Späteste Schließzeit nach Mitternacht als „02:00" (Systemblatt Ecke). */
export function lateFigure(hours: Hours | undefined): string | undefined {
  const late = lateClose(hours);
  if (late === undefined) return undefined;
  const h = Math.floor(late / 60);
  const m = late % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export { unquote, voiceOf } from "../shared/voice";
