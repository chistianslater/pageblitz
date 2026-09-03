import React from "react";
import type {
  SectionOf,
  WebsiteDataV2,
} from "../../../../shared/siteContract/types";

/**
 * Hero-Collage (2026-08-30, „setze im hero 3 fotos ein"): bei
 * `designProfile.heroLayout === "collage"` legen sich bis zu zwei
 * zusätzliche Foto-Karten über die Hero-Sektion (absolut positioniert,
 * gestapelt und leicht rotiert — Look kommt zentral aus
 * DESIGN_PROFILE_CSS, Selektor `.pb-hero-extras`).
 *
 * Die Bilder kommen aus dem vorhandenen Material des Kunden — zuerst die
 * Galerie, dann das Über-uns-Bild — nie aus neuen, ungeprüften Quellen.
 * Jedes Pack rendert die Komponente direkt nach dem öffnenden Tag seiner
 * Hero-Sektion (`<HeroCollage data={data} />`); außerhalb des
 * Collage-Layouts oder ohne Zusatzbilder rendert sie nichts.
 */
/** Höchstens so viele Karten legen sich über die Hero-Sektion. */
export const MAX_COLLAGE_IMAGES = 2;

/**
 * Auswählbares Material für die Collage: Galerie zuerst, dann das
 * Über-uns-Bild — ohne das Hero-Bild selbst (das liegt schon darunter) und
 * ohne Dubletten. Server und Fotos-Panel prüfen gegen genau diese Liste,
 * damit nie eine fremde Adresse in die Collage wandert.
 */
export function collagePhotoPool(data: WebsiteDataV2): string[] {
  const hero = data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const gallery = data.sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  const about = data.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  const seen = new Set<string>(hero?.imageUrl ? [hero.imageUrl] : []);
  const pool: string[] = [];
  for (const url of [
    ...(gallery?.images.map(img => img.url) ?? []),
    ...(about?.imageUrl ? [about.imageUrl] : []),
  ]) {
    if (seen.has(url)) continue;
    seen.add(url);
    pool.push(url);
  }
  return pool;
}

export function heroCollageImages(data: WebsiteDataV2): string[] {
  const pool = collagePhotoPool(data);
  const chosen = data.designProfile?.heroCollageImages;
  // Gewählt schlägt automatisch. Gegen den Vorrat filtern, damit gelöschte
  // Fotos still herausfallen und fremde Adressen nie greifen.
  if (chosen) {
    return chosen
      .filter(url => pool.includes(url))
      .slice(0, MAX_COLLAGE_IMAGES);
  }
  return pool.slice(0, MAX_COLLAGE_IMAGES);
}

export function HeroCollage({ data }: { data: WebsiteDataV2 }) {
  if (data.designProfile?.heroLayout !== "collage") return null;
  const extras = heroCollageImages(data);
  if (extras.length === 0) return null;
  return (
    <span className="pb-hero-extras" aria-hidden="true">
      {extras.map(url => (
        <img key={url} src={url} alt="" loading="lazy" />
      ))}
    </span>
  );
}
