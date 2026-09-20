/**
 * KI-Bilder statt neutraler Verlegenheitsfotos (Betreiber-Wunsch
 * 2026-09-20): Findet die Branchenbibliothek keine passende Gruppe, zeigte
 * die Seite bisher generische Büro- und Arbeitsmotive. Für solche Fälle
 * erzeugt Cloudflare Flux fünf Motive zur Kategorie und legt sie in R2 ab.
 *
 * Bewusst eng gehalten: nur wenn (a) keine eigenen oder Google-Fotos
 * existieren, (b) keine Branchengruppe greift und (c) der Cloudflare-Token
 * gesetzt ist. Schlägt etwas fehl, bleibt der neutrale Stock.
 */
import { generateAiImage, isAiImagesConfigured } from "../_core/aiImages";
import { uploadPhoto } from "../onboardingUpload";

/** Hero, Über uns und drei Galeriemotive. */
const MOTIVE = [
  "wide interior shot of the business premises, welcoming and tidy",
  "a person at work, focused on their craft, candid moment",
  "close-up of tools and materials of the trade on a work surface",
  "detail of the workspace with warm natural light",
  "exterior of a small local business storefront on a quiet street",
] as const;

export interface ErzeugteBilder {
  hero: string;
  about?: string;
  gallery?: string[];
}

/** Motiv-Beschreibung für Flux: Branche zuerst, dann die Szene. */
export function buildMotivText(kategorie: string, motiv: string): string {
  const branche = kategorie.trim() || "local business";
  return `${branche} in Germany — ${motiv}`;
}

/**
 * Erzeugt bis zu fünf Bilder parallel und lädt sie nach R2. Liefert `null`,
 * wenn KI-Bilder nicht eingerichtet sind oder kein einziges Bild entstand —
 * dann greift weiter der neutrale Stock.
 */
export async function generateIndustryImages(
  kategorie: string,
  websiteId: number,
  startIndex = 0
): Promise<ErzeugteBilder | null> {
  if (!isAiImagesConfigured()) return null;
  const ergebnisse = await Promise.all(
    MOTIVE.map(async (motiv, i) => {
      const base64 = await generateAiImage(buildMotivText(kategorie, motiv));
      if (!base64) return null;
      try {
        const { url } = await uploadPhoto(
          base64,
          "image/jpeg",
          websiteId,
          startIndex + i
        );
        return url;
      } catch (e) {
        console.error("[aiStockImages] Upload fehlgeschlagen:", e);
        return null;
      }
    })
  );
  const urls = ergebnisse.filter((u): u is string => Boolean(u));
  if (urls.length === 0) return null;
  const [hero, ...rest] = urls;
  return {
    hero,
    ...(rest[0] ? { about: rest[0] } : {}),
    ...(rest.length >= 3 ? { gallery: urls } : {}),
  };
}
