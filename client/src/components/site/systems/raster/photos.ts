import type { SectionOf } from "../../../../../../shared/siteContract/types";
import type { SystemSection } from "../shared";
import { bandPlan } from "./offerData";

/**
 * Jedes Foto höchstens einmal je Seite (Controller-Entscheid R5/R6). Eine
 * geordnete Menge „beansprucht" in Renderreihenfolge der Bildrollen:
 *
 * 1. Einstiegsfoto (wenn gezeigt, nicht `hero-media` ausgeblendet)
 * 2. Bandfotos — aus der Galerie, ohne Beanspruchtes, ohne Doppel; nur,
 *    wenn es für jedes Band eins gibt (bandPlan)
 * 3. Über-uns-Foto — schon beansprucht → entfällt (Fassung ohne Bild,
 *    erster Satz groß). Bewusst KEIN Ersatz aus der Galerie: Galeriefotos
 *    sind Arbeitsproben, das Über-uns-Bild steht für den Betrieb; ein
 *    getauschtes Bild würde etwas behaupten, das die Daten nicht sagen.
 * 4. Galerie — ohne Beanspruchtes, intern ohne Doppel; leer → entfällt.
 *
 * Läuft vor Kapitelzählung und Abb.-Nummern (index.tsx), damit Nummern,
 * Navigation und Kapitel lückenlos bleiben. Nur Raster; Journal unberührt.
 */
export function claimPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[]; bandPhotos?: string[] } {
  const claimed = new Set<string>();
  const hero = sections.find(
    (s): s is T & SectionOf<"hero"> => s.type === "hero"
  );
  if (hero?.imageUrl && !hidden.includes("hero-media"))
    claimed.add(hero.imageUrl);

  const services = sections.find(
    (s): s is T & SectionOf<"services"> => s.type === "services"
  );
  const bandPhotos = services
    ? bandPlan(services, sections, claimed).photos
    : undefined;
  bandPhotos?.forEach(u => claimed.add(u));

  let changed = false;
  const list = sections.flatMap((s): T[] => {
    if (s.type === "about") {
      const a = s as T & SectionOf<"about">;
      if (!a.imageUrl || hidden.includes("about-media")) return [s];
      if (claimed.has(a.imageUrl)) {
        changed = true;
        const { imageUrl: _drop, ...rest } = a;
        return [rest as unknown as T];
      }
      claimed.add(a.imageUrl);
      return [s];
    }
    if (s.type === "gallery") {
      const g = s as T & SectionOf<"gallery">;
      const images = g.images.filter(i => {
        if (claimed.has(i.url)) return false;
        claimed.add(i.url);
        return true;
      });
      if (images.length === g.images.length) return [s];
      changed = true;
      return images.length > 0 ? [{ ...g, images } as T] : [];
    }
    return [s];
  });
  return {
    list: changed ? list : [...sections],
    ...(bandPhotos ? { bandPhotos } : {}),
  };
}
