/**
 * Reine Listen-Operationen für die Galerie-Auswahl im Fotos-Panel.
 * Reihenfolge = Anzeigereihenfolge (`setImages` persistiert das Array).
 */

export const MAX_GALLERY_PHOTOS = 12;

/**
 * Vertauscht das Bild an `index` mit seinem Nachbarn in Richtung
 * `direction` — No-op am jeweiligen Rand (erstes Bild nicht nach oben,
 * letztes nicht nach unten). Mutiert die Ausgangsliste nicht.
 */
export function moveGalleryImage(
  urls: string[],
  index: number,
  direction: "up" | "down"
): string[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= urls.length) return urls;
  const next = [...urls];
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}

/** Entfernt das Bild am Index. Mutiert die Ausgangsliste nicht. */
export function removeGalleryImage(urls: string[], index: number): string[] {
  return urls.filter((_, i) => i !== index);
}

export const MAX_GALLERY_ALBUMS = 6;

export interface GalleryAlbumDraft {
  title: string;
  urls: string[];
}

/**
 * Aktive Liste im Fotos-Panel: "main" = Hauptgalerie, Zahl = Album-Index.
 */
export type GalleryListId = "main" | number;

/** Ersetzt die URL-Liste der adressierten Liste — mutiert nichts. */
export function withListUrls(
  main: string[],
  albums: GalleryAlbumDraft[],
  list: GalleryListId,
  urls: string[]
): { main: string[]; albums: GalleryAlbumDraft[] } {
  if (list === "main") return { main: urls, albums };
  return {
    main,
    albums: albums.map((album, i) => (i === list ? { ...album, urls } : album)),
  };
}

/** Gesamtzahl aller Galerie-Bilder (Hauptliste + Alben). */
export function totalGalleryCount(
  main: string[],
  albums: GalleryAlbumDraft[]
): number {
  return main.length + albums.reduce((sum, a) => sum + a.urls.length, 0);
}
