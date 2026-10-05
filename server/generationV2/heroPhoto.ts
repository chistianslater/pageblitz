/**
 * Hero-Foto nach Format wählen (2026-10-05, Einstiege „Bühne"/„Farbfläche").
 *
 * Google-Profile liefern meist Hochformat-Handyfotos. Gibt es darunter ein
 * großes Querformat (Salon, Werkstatt, Gastraum), trägt es die Bühne und
 * wandert nach vorn. Sonst bleibt die Reihenfolge, und die Seite bekommt die
 * Farbfläche mit Fotokarten. Messfehler sind nie fatal: ohne Maße bleibt
 * alles wie geliefert.
 */
import sharp from "sharp";
import {
  STAGE_MIN_RATIO,
  STAGE_MIN_WIDTH,
} from "../../shared/stylePacks/artDirection";
import type { V2Images } from "./runJob";

const MEASURE_TIMEOUT_MS = 8000;

export type PhotoSize = { url: string; width: number; height: number };

export type MeasureDeps = {
  fetchImpl?: typeof fetch;
  readSize?: (buffer: Buffer) => Promise<{ width: number; height: number }>;
};

async function sharpSize(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  // EXIF 5–8 = um 90° gedreht: Handyfotos melden sonst vertauschte Maße.
  return (meta.orientation ?? 1) >= 5
    ? { width: height, height: width }
    : { width, height };
}

/** Misst die Fotos parallel; nicht messbare fallen still heraus. */
export async function measurePhotos(
  urls: string[],
  deps: MeasureDeps = {}
): Promise<PhotoSize[]> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const readSize = deps.readSize ?? sharpSize;
  const sizes = await Promise.all(
    urls.map(async url => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), MEASURE_TIMEOUT_MS);
      try {
        const response = await fetchImpl(url, { signal: controller.signal });
        if (!response.ok) return null;
        const size = await readSize(Buffer.from(await response.arrayBuffer()));
        return size.width > 0 && size.height > 0 ? { url, ...size } : null;
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    })
  );
  return sizes.filter((s): s is PhotoSize => s !== null);
}

/** Größtes Querformat, das die volle Breite trägt — oder keins. */
export function pickStagePhoto(sizes: PhotoSize[]): string | undefined {
  return sizes
    .filter(
      s => s.width >= STAGE_MIN_WIDTH && s.width / s.height >= STAGE_MIN_RATIO
    )
    .sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url;
}

/**
 * Stellt ein Querformat an die Hero-Stelle und markiert es. Das bisherige
 * Hero-Foto rückt an den frei gewordenen Platz (Über uns), die Galerie
 * bleibt, wie sie ist.
 */
export async function withStagePhoto(
  images: V2Images,
  deps: MeasureDeps = {}
): Promise<V2Images> {
  const candidates = Array.from(
    new Set(
      [images.hero, images.about, ...(images.gallery ?? [])].filter(
        (u): u is string => Boolean(u)
      )
    )
  );
  if (candidates.length === 0) return images;
  const stage = pickStagePhoto(await measurePhotos(candidates, deps));
  if (!stage) return { ...images, heroLandscape: false };
  if (stage === images.hero) return { ...images, heroLandscape: true };
  return {
    ...images,
    hero: stage,
    about: images.about === stage ? images.hero : images.about,
    heroLandscape: true,
  };
}
