/**
 * Bildnachweis für Unsplash-Fotos (2026-10-07, Unsplash-API-Guidelines):
 * „Fotos: Name, Name · Unsplash" unter der Seite. Genannt wird nur, wessen
 * Foto noch auf der Seite steht — tauscht der Kunde Bilder aus, fällt der
 * Nachweis von selbst weg.
 */
import React from "react";
import type { WebsiteDataV2 } from "../../../../shared/siteContract/types";

const UNSPLASH =
  "https://unsplash.com/?utm_source=pageblitz&utm_medium=referral";

/** Stockfoto von Unsplash (kein eigenes Bild des Betriebs). */
export function isStockPhotoUrl(url: string): boolean {
  return url.includes("images.unsplash.com");
}

/** Besteht die Galerie nur aus Stockfotos? Dann heißt sie „Einblicke". */
export function galleryIsStock(data: WebsiteDataV2): boolean {
  const gallery = data.sections.find(s => s.type === "gallery");
  if (!gallery || gallery.type !== "gallery" || gallery.images.length === 0)
    return false;
  return gallery.images.every(image => isStockPhotoUrl(image.url));
}

export function PhotoCredits({ data }: { data: WebsiteDataV2 }) {
  if (!data.photoCredits?.length) return null;
  const json = JSON.stringify(data.sections);
  const seen = new Set<string>();
  const credits = data.photoCredits.filter(c => {
    if (!json.includes(c.match) || seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
  if (credits.length === 0) return null;
  return (
    <p className="pb-photo-credits">
      Fotos:{" "}
      {credits.map((c, i) => (
        <React.Fragment key={c.url}>
          {i > 0 && ", "}
          <a href={c.url} target="_blank" rel="noopener noreferrer">
            {c.name}
          </a>
        </React.Fragment>
      ))}{" "}
      ·{" "}
      <a href={UNSPLASH} target="_blank" rel="noopener noreferrer">
        Unsplash
      </a>
    </p>
  );
}

export const PHOTO_CREDITS_CSS = `
.pb-photo-credits{margin:0;padding:14px 6% 18px;font:400 11px/1.5 var(--pb-font-body,system-ui);color:var(--pb-muted,#777);background:var(--pb-canvas,#fff);text-align:center}
.pb-photo-credits a{color:inherit;text-decoration:underline;text-underline-offset:2px}
`;
