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
export function heroCollageImages(data: WebsiteDataV2): string[] {
  const hero = data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const gallery = data.sections.find(
    (s): s is SectionOf<"gallery"> => s.type === "gallery"
  );
  const about = data.sections.find(
    (s): s is SectionOf<"about"> => s.type === "about"
  );
  const candidates: string[] = [
    ...(gallery?.images.map(img => img.url) ?? []),
    ...(about?.imageUrl ? [about.imageUrl] : []),
  ];
  const seen = new Set<string>(hero?.imageUrl ? [hero.imageUrl] : []);
  const extras: string[] = [];
  for (const url of candidates) {
    if (seen.has(url)) continue;
    seen.add(url);
    extras.push(url);
    if (extras.length === 2) break;
  }
  return extras;
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
