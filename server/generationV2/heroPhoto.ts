/**
 * Fotos prüfen und das Titelbild wählen (2026-10-05, Einstiege
 * „Bühne"/„Farbfläche").
 *
 * Google-Profile liefern meist Hochformat-Handyfotos, oft mit eingeblendetem
 * Instagram-Profilbild oder als gespiegelte Collage. Jedes Foto wird einmal
 * geladen, vermessen, auf Spiegelung geprüft und — wenn ein Bildmodell
 * erreichbar ist — nach Motiv, Overlay und Eignung als Titelbild bewertet.
 * Aussortiertes landet weder im Hero noch in Über uns oder der Galerie.
 *
 * Nichts davon ist fatal: Fällt das Modell aus, greifen Spiegel- und
 * Größenprüfung; fällt auch das Laden aus, bleibt alles wie geliefert.
 */
import sharp from "sharp";
import { invokeLLM } from "../_core/llm";
import {
  STAGE_MIN_RATIO,
  STAGE_MIN_WIDTH,
} from "../../shared/stylePacks/artDirection";
import type { V2Images } from "./runJob";

const MEASURE_TIMEOUT_MS = 8000;
const VISION_TIMEOUT_MS = 40_000;
/** Kürzere Seite darunter wirkt auf großen Flächen verwaschen. */
const MIN_SHORT_SIDE = 500;
/**
 * Mittlere Helligkeitsdifferenz links ↔ gespiegelt rechts (64×64, Graustufen).
 * Gespiegelte Collagen lagen bei ~23, echte Fotos ab ~42 (Haarem, 8 Fotos).
 */
const MIRROR_THRESHOLD = 30;
const MIRROR_GRID = 64;

export type PhotoSize = { url: string; width: number; height: number };

const MOTIVE = [
  "innenraum",
  "arbeit",
  "ergebnis",
  "team",
  "aussen",
  "produkt",
  "landschaft",
  "grafik",
  "sonstiges",
] as const;
type Motiv = (typeof MOTIVE)[number];

export type VisionRating = {
  motiv: Motiv;
  overlay: boolean;
  collage: boolean;
  /** 1–5 */
  quality: number;
  /** 1–5: taugt als großes Titelbild */
  heroScore: number;
};

export type PhotoCheck = PhotoSize & {
  mirrored: boolean;
  vision?: VisionRating;
};

type Inspected = PhotoCheck & { thumb?: string };

export type MeasureDeps = {
  fetchImpl?: typeof fetch;
  readSize?: (buffer: Buffer) => Promise<{ width: number; height: number }>;
  readMirror?: (buffer: Buffer) => Promise<number>;
  makeThumb?: (buffer: Buffer) => Promise<string>;
  /** Bildmodell; `null` = nicht verfügbar. Reihenfolge wie `thumbs`. */
  rate?: (
    thumbs: string[],
    category: string
  ) => Promise<(VisionRating | null)[] | null>;
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

async function sharpMirror(buffer: Buffer): Promise<number> {
  const n = MIRROR_GRID;
  const px = await sharp(buffer)
    .rotate()
    .resize(n, n, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();
  let diff = 0;
  for (let y = 0; y < n; y += 1)
    for (let x = 0; x < n / 2; x += 1)
      diff += Math.abs(px[y * n + x] - px[y * n + (n - 1 - x)]);
  return diff / ((n * n) / 2);
}

async function sharpThumb(buffer: Buffer): Promise<string> {
  const small = await sharp(buffer)
    .rotate()
    .resize(512, 512, { fit: "inside" })
    .jpeg({ quality: 70 })
    .toBuffer();
  return `data:image/jpeg;base64,${small.toString("base64")}`;
}

/** Ein Teilschritt darf scheitern, ohne den Rest zu verlieren. */
async function attempt<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

async function inspectPhotos(
  urls: string[],
  deps: MeasureDeps
): Promise<Inspected[]> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  const readSize = deps.readSize ?? sharpSize;
  const readMirror = deps.readMirror ?? sharpMirror;
  const makeThumb = deps.makeThumb ?? sharpThumb;
  const checks = await Promise.all(
    urls.map(async (url): Promise<Inspected | null> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), MEASURE_TIMEOUT_MS);
      try {
        const response = await fetchImpl(url, { signal: controller.signal });
        if (!response.ok) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        const size = await readSize(buffer);
        if (!(size.width > 0 && size.height > 0)) return null;
        const mirror = await attempt(() => readMirror(buffer));
        const thumb = await attempt(() => makeThumb(buffer));
        return {
          url,
          ...size,
          mirrored: mirror !== undefined && mirror < MIRROR_THRESHOLD,
          thumb,
        };
      } catch {
        return null;
      } finally {
        clearTimeout(timer);
      }
    })
  );
  return checks.filter((c): c is Inspected => c !== null);
}

/** Misst die Fotos parallel; nicht messbare fallen still heraus. */
export async function measurePhotos(
  urls: string[],
  deps: MeasureDeps = {}
): Promise<PhotoSize[]> {
  const checks = await inspectPhotos(urls, {
    ...deps,
    makeThumb: async () => "",
  });
  return checks.map(({ url, width, height }) => ({ url, width, height }));
}

function clampScore(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 3;
}

/** Antwort des Modells streng lesen — Unbekanntes wird verworfen, nie geraten. */
export function parseVisionRatings(
  raw: string,
  count: number
): (VisionRating | null)[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    return null;
  }
  const photos = (parsed as { photos?: unknown })?.photos;
  if (!Array.isArray(photos)) return null;
  const result: (VisionRating | null)[] = Array.from(
    { length: count },
    () => null
  );
  for (const entry of photos) {
    const e = entry as Record<string, unknown>;
    const i = Number(e.i);
    if (!Number.isInteger(i) || i < 0 || i >= count) continue;
    const motiv = MOTIVE.includes(e.motiv as Motiv)
      ? (e.motiv as Motiv)
      : "sonstiges";
    result[i] = {
      motiv,
      overlay: e.overlay === true,
      collage: e.collage === true,
      quality: clampScore(e.qualitaet),
      heroScore: clampScore(e.hero),
    };
  }
  return result;
}

async function rateWithModel(
  thumbs: string[],
  category: string
): Promise<(VisionRating | null)[] | null> {
  // Tests und Mock-Läufe bleiben ohne Netz und deterministisch.
  if (process.env.VITEST || process.env.PB_LLM_MOCK === "1") return null;
  try {
    const response = await invokeLLM({
      // Das Backup-Modell (Gemini) sieht Bilder; der Rückfall bleibt intakt.
      preferBackup: true,
      timeoutMs: VISION_TIMEOUT_MS,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                `Du prüfst Google-Fotos für die Website eines Betriebs (Kategorie: ${category}).`,
                `Bewerte jedes Bild, Index ab 0 in der gezeigten Reihenfolge.`,
                `Antworte NUR mit JSON: {"photos":[{"i":0,"motiv":"${MOTIVE.join("|")}","overlay":bool,"collage":bool,"qualitaet":1-5,"hero":1-5}]}`,
                `overlay = sichtbares App-Symbol, runder Profilbild-Kreis, Wasserzeichen, eingeblendeter Text oder Rahmen.`,
                `collage = aus mehreren Bildern zusammengesetzt oder gespiegelt.`,
                `hero = wie gut das Bild als großes Titelbild genau diesen Betrieb zeigt (Räume, Arbeit, Ergebnisse, Team schlagen Himmel, Landschaft, Grafiken).`,
              ].join("\n"),
            },
            ...thumbs.map(url => ({
              type: "image_url" as const,
              image_url: { url },
            })),
          ],
        },
      ],
    });
    const content = response.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map(part => ("text" in part ? part.text : "")).join("")
          : "";
    return parseVisionRatings(text, thumbs.length);
  } catch (err) {
    console.warn(
      "[Fotoprüfung] Bildmodell nicht verfügbar, nur Spiegel-/Größenprüfung:",
      String((err as Error)?.message ?? err).slice(0, 160)
    );
    return null;
  }
}

function isLandscape(c: PhotoSize): boolean {
  return c.width >= STAGE_MIN_WIDTH && c.width / c.height >= STAGE_MIN_RATIO;
}

/** Vom Betrieb selbst: nach R2 gespiegelte Google-Fotos tragen `/gmb-`. */
export function isOwnPhoto(url: string): boolean {
  return url.includes("/gmb-");
}

/** Aussortieren: Overlay, Collage, Spiegelung, zu klein. */
export function isFlawed(c: PhotoCheck): boolean {
  return (
    c.mirrored ||
    Math.min(c.width, c.height) < MIN_SHORT_SIDE ||
    c.vision?.overlay === true ||
    c.vision?.collage === true
  );
}

function score(c: PhotoCheck): number {
  return (c.vision?.heroScore ?? 3) * 2 + (c.vision?.quality ?? 3);
}

/** Größtes Querformat, das die volle Breite trägt — oder keins. */
export function pickStagePhoto(sizes: PhotoSize[]): string | undefined {
  return sizes
    .filter(isLandscape)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url;
}

/**
 * Pure Auswahl aus den Prüfergebnissen. Ungeprüfte URLs (Laden
 * fehlgeschlagen) bleiben, wie sie sind — besser ein ungeprüftes Foto als
 * eine leere Seite.
 */
export function curateImages(images: V2Images, checks: PhotoCheck[]): V2Images {
  const byUrl = new Map(checks.map(c => [c.url, c]));
  const ok = (url: string | undefined): url is string =>
    Boolean(url) && !(byUrl.get(url!) && isFlawed(byUrl.get(url!)!));
  const clean = checks.filter(c => !isFlawed(c));
  // Eigene Google-Fotos vor Stockbildern: Ein schönes Unsplash-Motiv im
  // Titelbild sähe aus wie das Team des Betriebs (Befund Wetzel 2026-10-05).
  // Nur eigene Fotos, die als Titelbild taugen — ein Magazin auf dem
  // Schoß (Bramhoff) soll nicht vor einem passenden Stockbild stehen.
  const own = clean.filter(
    c => isOwnPhoto(c.url) && (c.vision?.heroScore ?? 3) >= 3
  );
  const usable = own.length > 0 ? own : clean;
  const rated = usable.some(c => c.vision);

  // Bühne nur mit einem Querformat, das der Betrieb auch zeigen will.
  const stage = rated
    ? usable
        .filter(c => isLandscape(c) && (c.vision?.heroScore ?? 0) >= 4)
        .sort(
          (a, b) =>
            score(b) - score(a) || b.width * b.height - a.width * a.height
        )[0]?.url
    : pickStagePhoto(usable);

  const bestRated = [...usable].sort((a, b) => score(b) - score(a))[0]?.url;
  const hero =
    stage ??
    (ok(images.hero) && !rated ? images.hero : bestRated) ??
    images.hero;

  const about =
    ok(images.about) && images.about !== hero
      ? images.about
      : ([...usable]
          .sort((a, b) => score(b) - score(a))
          .find(c => c.url !== hero)?.url ??
        (images.about !== hero ? images.about : undefined));

  const cleanGallery = images.gallery?.filter(ok);
  const gallery =
    cleanGallery && cleanGallery.length > 0 ? cleanGallery : images.gallery;

  return {
    ...images,
    ...(hero ? { hero } : {}),
    ...(about ? { about } : { about: undefined }),
    ...(gallery ? { gallery } : {}),
    heroLandscape: Boolean(stage),
  };
}

/**
 * Prüft alle Fotos einmal und stellt Hero, Über uns und Galerie danach
 * zusammen. `category` gibt dem Bildmodell den Kontext.
 */
export async function withStagePhoto(
  images: V2Images,
  deps: MeasureDeps = {},
  category = ""
): Promise<V2Images> {
  const candidates = Array.from(
    new Set(
      [images.hero, images.about, ...(images.gallery ?? [])].filter(
        (u): u is string => Boolean(u)
      )
    )
  );
  if (candidates.length === 0) return images;
  const inspected = await inspectPhotos(candidates, deps);
  const withThumbs = inspected.filter(c => c.thumb);
  const ratings =
    withThumbs.length > 0
      ? await (deps.rate ?? rateWithModel)(
          withThumbs.map(c => c.thumb!),
          category
        )
      : null;
  const checks: PhotoCheck[] = inspected.map(({ thumb: _t, ...c }) => {
    const index = withThumbs.findIndex(w => w.url === c.url);
    const vision = index >= 0 ? ratings?.[index] : undefined;
    return vision ? { ...c, vision } : c;
  });
  const curated = curateImages(images, checks);
  const dropped = checks.filter(isFlawed).length;
  if (dropped > 0)
    console.log(
      `[Fotoprüfung] ${dropped} von ${checks.length} Fotos aussortiert (Overlay/Collage/Spiegelung/zu klein).`
    );
  return curated;
}
