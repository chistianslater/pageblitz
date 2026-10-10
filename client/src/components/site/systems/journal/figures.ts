import type { JournalSection } from "./sections";

/** Abbildungen, die Journal nummeriert („Abb. n"). */
export type FigureNumbers = {
  hero?: number;
  about?: number;
  /** Erste Nummer der Galerie; die Bilder zählen fortlaufend weiter. */
  gallery?: number;
  /** Letzte Nummer der Galerie (für „Abb. 3 bis 7"). */
  galleryLast?: number;
};

/**
 * „Abb. n" fortlaufend über die Seite, in Renderreihenfolge: Einstiegsfoto
 * (falls gezeigt), Über-uns-Foto, dann die Galerie. Rein aus der
 * Abschnittsliste berechnet — kein Zähler, der beim Rendern mitläuft.
 * `hidden` sind die im Studio aussortierten Bilder (designProfile).
 */
export function figureNumbers(
  sections: readonly JournalSection[],
  hidden: readonly string[] = []
): FigureNumbers {
  const numbers: FigureNumbers = {};
  let next = 1;
  for (const s of sections) {
    if (s.type === "hero" && s.imageUrl && !hidden.includes("hero-media"))
      numbers.hero = next++;
    else if (
      s.type === "about" &&
      s.imageUrl &&
      !hidden.includes("about-media")
    )
      numbers.about = next++;
    else if (s.type === "gallery" && s.images.length > 0) {
      numbers.gallery = next;
      next += s.images.length;
      numbers.galleryLast = next - 1;
    }
  }
  return numbers;
}
