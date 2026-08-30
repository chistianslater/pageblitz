import type { SectionOf, WebsiteDataV2 } from "@shared/siteContract/types";

/**
 * Galerie-Alben (2026-08-30): Die Packs kennen KEINE Alben — sie rendern
 * weiterhin `section.images` in ihrem eigenen Grid. Dieses Modul liefert
 * dem SiteRenderer:
 *
 * 1. `flattenGalleryAlbums(doc)`: Dokument-Kopie, in der die Galerie-
 *    Sektion Hauptbilder + alle Albumbilder als EINE Liste trägt
 *    (Album-Bilder gewinnen beim URL-Dedupe, damit der Filter sie findet).
 * 2. `albumChromeJson(doc)`: url→Album-Zuordnung als JSON für den
 *    siteEnhancer, der daraus die Filter-Chips baut. `null` ohne Alben.
 * 3. `ALBUM_CSS`: Chips + Filterregeln — pack-neutral über die
 *    `--pb-*`-Variablen, Verstecken über das Grid-Kind (Slot-Container).
 *
 * Ohne JavaScript zeigt die Seite schlicht alle Bilder — die Chips
 * existieren nur clientseitig (progressive enhancement).
 */

type GallerySection = SectionOf<"gallery">;

function findGallery(doc: WebsiteDataV2): GallerySection | undefined {
  return doc.sections.find(
    (s): s is GallerySection => s.type === "gallery"
  );
}

export function flattenGalleryAlbums(doc: WebsiteDataV2): WebsiteDataV2 {
  const gallery = findGallery(doc);
  if (!gallery?.albums || gallery.albums.length === 0) return doc;
  const albumImages = gallery.albums.flatMap(album => album.images);
  const albumUrls = new Set(albumImages.map(img => img.url));
  const flattened: GallerySection = {
    ...gallery,
    images: [
      ...gallery.images.filter(img => !albumUrls.has(img.url)),
      ...albumImages,
    ],
    albums: undefined,
  };
  return {
    ...doc,
    sections: doc.sections.map(s => (s.type === "gallery" ? flattened : s)),
  };
}

export interface AlbumChromeAlbum {
  title: string;
  urls: string[];
}

/** JSON fürs `<script data-pb-albums>`-Tag — `null`, wenn keine Alben. */
export function albumChromeJson(doc: WebsiteDataV2): string | null {
  const gallery = findGallery(doc);
  if (!gallery?.albums || gallery.albums.length === 0) return null;
  const albums: AlbumChromeAlbum[] = gallery.albums.map(album => ({
    title: album.title,
    urls: album.images.map(img => img.url),
  }));
  // "<" escapen: das JSON landet in einem Inline-<script>-Tag.
  return JSON.stringify(albums).replace(/</g, "\\u003c");
}

/**
 * Versteck-Regeln invertiert (nur NICHT-passende Kinder verschwinden),
 * damit der Original-Displaywert der Grid-Kinder unangetastet bleibt.
 * Sechs statische Regeln = albums.max(6) im Schema.
 */
const FILTER_RULES = Array.from(
  { length: 6 },
  (_, i) =>
    `[data-pb-album-filter="${i}"] [data-pb-album-item]:not([data-pb-album="${i}"]){display:none!important}`
).join("\n");

export const ALBUM_CSS = `
.pb-album-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
.pb-album-chips button{appearance:none;font:600 12.5px/1 var(--pb-font-body);letter-spacing:.04em;padding:9px 16px;border:1px solid var(--pb-line);border-radius:999px;background:transparent;color:var(--pb-ink);cursor:pointer;transition:background .15s,color .15s,border-color .15s}
.pb-album-chips button:hover{border-color:var(--pb-accent)}
.pb-album-chips button[aria-pressed="true"]{background:var(--pb-accent);border-color:var(--pb-accent);color:var(--pb-accent-contrast)}
${FILTER_RULES}
`;
