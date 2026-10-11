import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { claimPhotos as claimShared, type SystemSection } from "../shared";
import { bandPlan } from "./offerData";

/**
 * Jedes Foto höchstens einmal je Seite — Raster-Fassung des geteilten
 * `claimPhotos` (shared/photos.ts): Angebotsfotos sind die Bandfotos der
 * Leistungen (bandPlan, nur wenn jedes Band eins bekommt). Reihenfolge
 * Einstieg → Bänder → Über uns → Galerie; vor Kapitelzählung und
 * Abb.-Nummern (index.tsx).
 */
export function claimPhotos<T extends SystemSection>(
  sections: readonly T[],
  hidden: readonly string[]
): { list: T[]; bandPhotos?: string[] } {
  const { list, offerPhotos } = claimShared(sections, hidden, (all, claimed) => {
    const services = all.find(
      (s): s is SectionOf<"services"> => s.type === "services"
    );
    return services ? bandPlan(services, all, claimed).photos : undefined;
  });
  return { list, ...(offerPhotos ? { bandPhotos: offerPhotos } : {}) };
}
