import type { SectionOf } from "../../../../../../shared/siteContract/types";
import type { SystemSection } from "./sections";

/**
 * Wählt die Angebotsfotos eines Systems (Raster: Bandfotos der Leistungen,
 * Werkstoff: Foto am Ablauf). Bekommt die Abschnitte und die schon
 * beanspruchten Fotos (Einstieg); gibt die Fotos zurück oder nichts.
 */
export type OfferPhotoPick = (
  sections: readonly SystemSection[],
  claimed: ReadonlySet<string>
) => string[] | undefined;

/**
 * Jedes Foto höchstens einmal je Seite (Controller-Entscheid R5/R6). Eine
 * geordnete Menge „beansprucht" in Renderreihenfolge der Bildrollen:
 *
 * 1. Einstiegsfoto (wenn gezeigt, nicht `hero-media` ausgeblendet)
 * 2. Angebotsfotos — vom System gewählt (`pickOffer`), meist aus der
 *    Galerie, ohne Beanspruchtes
 * 3. Über-uns-Foto — schon beansprucht → entfällt (Fassung ohne Bild).
 *    Bewusst KEIN Ersatz aus der Galerie: Galeriefotos sind Arbeitsproben,
 *    das Über-uns-Bild steht für den Betrieb.
 * 4. Galerie — ohne Beanspruchtes, intern ohne Doppel; leer → entfällt.
 *
 * Läuft vor Kapitelzählung und Abb.-Nummern, damit Nummern, Navigation
 * und Kapitel lückenlos bleiben. Journal nutzt es nicht.
 */
export function claimPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[],
  pickOffer?: OfferPhotoPick
): { list: T[]; offerPhotos?: string[] } {
  const claimed = new Set<string>();
  const hero = sections.find(
    (s): s is T & SectionOf<"hero"> => s.type === "hero"
  );
  if (hero?.imageUrl && !hidden.includes("hero-media"))
    claimed.add(hero.imageUrl);

  const offerPhotos = pickOffer?.(sections, claimed);
  offerPhotos?.forEach(u => claimed.add(u));

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
    ...(offerPhotos ? { offerPhotos } : {}),
  };
}
