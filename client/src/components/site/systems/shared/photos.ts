import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import type { SystemSection } from "./sections";
import { FREIE_GALERIEBILDER } from "../../engine";

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
 *
 * `freeGallery` (ohne Galerie-Extra, Systeme mit `freeGalleryBeyondShown`):
 * Die Galerie kommt ungekürzt an (SiteRenderer kürzt für diese Systeme
 * nicht). Angebotsfotos wählen wie bisher aus den ersten drei
 * Galeriefotos (unverändert gegenüber dem Vorschnitt); die Galerie zeigt
 * danach die ersten drei Fotos, die die Seite noch nicht zeigt
 * (FREIE_GALERIEBILDER) — gezählt nach Einstieg, Angebotsfotos und einem
 * Über-uns-Foto, das vor der Galerie steht. Jedes Foto einmal je Seite.
 */
export function claimPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[],
  pickOffer?: OfferPhotoPick,
  freeGallery = false
): { list: T[]; offerPhotos?: string[] } {
  const claimed = new Set<string>();
  const hero = sections.find(
    (s): s is T & SectionOf<"hero"> => s.type === "hero"
  );
  if (hero?.imageUrl && !hidden.includes("hero-media"))
    claimed.add(hero.imageUrl);

  // Angebotsfotos wählen wie vor 2026-10-12 aus den ersten drei
  // Galeriefotos (damals kürzte der SiteRenderer vorher) — sie bleiben, wie
  // sie waren; die Galerie bekommt danach trotzdem drei freie.
  const offerPool: readonly SystemSection[] = freeGallery
    ? sections.map(s =>
        s.type === "gallery"
          ? { ...s, images: s.images.slice(0, FREIE_GALERIEBILDER) }
          : s
      )
    : sections;
  const offerPhotos = pickOffer?.(offerPool, claimed);
  offerPhotos?.forEach(u => claimed.add(u));

  let changed = false;
  let shownHere = 0;
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
        if (freeGallery && shownHere >= FREIE_GALERIEBILDER) return false;
        claimed.add(i.url);
        shownHere++;
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

/** Ohne gebuchtes Galerie-Extra trägt die Galerie nur die freien Fotos. */
export const galleryIsFree = (doc: WebsiteDataV2): boolean =>
  doc.addOns?.gallery !== true;
