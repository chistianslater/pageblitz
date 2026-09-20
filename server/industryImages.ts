/**
 * Curated Unsplash photo library for industry-specific website images.
 * This file acts as a server-side wrapper for the shared configuration.
 */

import { INDUSTRY_IMAGES, type IndustryImageSet } from "@shared/industryImages";

/**
 * Find the best matching image set for a given industry/category string.
 * Also checks business name for keywords.
 * If industryKey is provided, it uses that directly.
 *
 * Uses intelligent matching: prioritizes longer, more specific keywords
 * to avoid false matches (e.g., "bauunternehmen" vs "bau").
 */
/**
 * Kurze Schlagworte dürfen nur als ganzes Wort treffen. Vorher galt jeder
 * Teilstring: „it" (Technik) steckt in „City", „bar" in „Barbier", „bau" in
 * „Baumann", „car" in „Carola". Der Friseursalon „Salon City Cuts Borken"
 * bekam so Laptop- und Bürofotos in die Galerie (Betreiber-Befund
 * 2026-09-20). Ab vier Zeichen bleibt der Teilstring erlaubt — deutsche
 * Komposita wie „Friseursalon" ⊃ „friseur" sollen weiter greifen.
 */
const MIN_TEILSTRING = 4;

/** Kleinschreibung, nur Buchstaben/Ziffern, von Leerzeichen umschlossen. */
function normalisiert(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-zäöüß0-9]+/g, " ").trim()} `;
}

/** Länge des längsten treffenden Schlagworts; 0 = kein Treffer. */
function trefferLaenge(text: string, keywords: string[]): number {
  let beste = 0;
  for (const kw of keywords) {
    const k = normalisiert(kw).trim();
    if (!k) continue;
    const trifft =
      k.length >= MIN_TEILSTRING ? text.includes(k) : text.includes(` ${k} `);
    if (trifft && k.length > beste) beste = k.length;
  }
  return beste;
}

/**
 * Beste Bildergruppe für eine Branche. Die Kategorie aus dem Google-Profil
 * wiegt schwerer als der Firmenname, und das längste treffende Schlagwort
 * gewinnt (spezifisch vor allgemein). Früher entschied die mittlere
 * Schlagwortlänge der Gruppe — eine Gruppe mit langen Wörtern gewann damit
 * auch mit einem Zufallstreffer.
 *
 * `industryKey` (aus classifyIndustry) zählt nur, wenn er eine echte Gruppe
 * benennt; „default" ist die Verlegenheitsantwort des LLM und darf die
 * Kategorie nicht überstimmen (Befund 2026-09-09).
 */
export function getIndustryImages(
  category: string,
  businessName: string = "",
  industryKey?: string
): IndustryImageSet {
  if (industryKey === "hotel") industryKey = "hospitality";
  if (industryKey && industryKey !== "default" && INDUSTRY_IMAGES[industryKey]) {
    return INDUSTRY_IMAGES[industryKey];
  }

  const kategorie = normalisiert(category);
  const name = normalisiert(businessName);
  let beste: IndustryImageSet | null = null;
  let bestKategorie = 0;
  let bestName = 0;
  for (const [key, satz] of Object.entries(INDUSTRY_IMAGES)) {
    if (key === "default") continue;
    const k = trefferLaenge(kategorie, satz.keywords);
    const n = trefferLaenge(name, satz.keywords);
    if (k === 0 && n === 0) continue;
    if (k > bestKategorie || (k === bestKategorie && n > bestName)) {
      beste = satz;
      bestKategorie = k;
      bestName = n;
    }
  }
  return beste ?? INDUSTRY_IMAGES.default;
}

/** true, wenn keine Branchengruppe passte und nur das neutrale Set bleibt. */
export function istNeutralesSet(satz: IndustryImageSet): boolean {
  return satz === INDUSTRY_IMAGES.default;
}

/**
 * Get a random hero image URL for a given industry.
 * Uses a seed based on business name for consistency (same business → same image).
 */
export function getHeroImageUrl(
  category: string,
  businessName: string = "",
  industryKey?: string
): string {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  const heroes = imageSet.hero;
  // Use a simple hash of the businessName to pick a consistent image
  let hash = 0;
  for (let i = 0; i < businessName.length; i++) {
    hash = (hash << 5) - hash + businessName.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % heroes.length;
  return heroes[idx];
}

/**
 * Get gallery images for a given industry.
 */
export function getGalleryImages(
  category: string,
  businessName: string = "",
  industryKey?: string
): string[] {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  return imageSet.gallery || imageSet.hero.slice(0, 2);
}

/** Galerie erst ab so vielen Motiven — darunter wirkt die Sektion zu dünn. */
const MIN_STOCK_GALLERY = 3;

/**
 * Dasselbe Foto in zwei Größen ist dasselbe Foto.
 *
 * Die Listen liefern ein Motiv je nach Zweck unterschiedlich zugeschnitten:
 * Galerie mit `?w=800&q=80`, Hero und Über-uns mit `?w=1400&q=85`. Der
 * Vergleich lief über die ganze URL — damit galten beide als verschieden und
 * standen nebeneinander in der Galerie (Betreiber-Befund 2026-09-13, Salon
 * Iris Klautke: sieben Bilder, davon zwei doppelt). Die Identität ist der
 * Pfad ohne Query, bei Unsplash also `/photo-<id>`.
 */
export function bildIdentitaet(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url.split("?")[0];
  }
}

/**
 * Branchen-Stock, wenn GMB/Upload leer sind: Hero, Über-uns und (ab 3
 * Motiven) Galerie. Die Generierung bleibt so visuell vollständig, statt
 * Hero/About/Galerie auf kaputte Leere zu strippen.
 */
export function buildStockFallbackImages(
  category: string,
  businessName: string = "",
  industryKey?: string
): { hero: string; about?: string; gallery?: string[] } {
  const imageSet = getIndustryImages(category, businessName, industryKey);
  const unique: string[] = [];
  const gesehen = new Set<string>();
  for (const url of [
    ...(imageSet.gallery ?? []),
    ...imageSet.hero,
    ...(imageSet.about ?? []),
  ]) {
    const id = bildIdentitaet(url);
    if (gesehen.has(id)) continue;
    gesehen.add(id);
    unique.push(url);
  }
  const hero = getHeroImageUrl(category, businessName, industryKey);
  const heroId = bildIdentitaet(hero);
  const about =
    unique.find(url => bildIdentitaet(url) !== heroId) ?? unique[0] ?? hero;
  return {
    hero,
    ...(about ? { about } : {}),
    ...(unique.length >= MIN_STOCK_GALLERY
      ? { gallery: unique.slice(0, 8) }
      : {}),
  };
}
