/**
 * Fotos je Betrieb von Unsplash (2026-10-07, Betreiber: „Je mehr Fotos,
 * desto besser, nur müssen diese halt hochwertig sein"). Statt eines festen
 * Satzes je Grobbranche („Handwerk" für Maler bis Schreinerei) wird zur
 * Google-Kategorie gesucht: „Schreinerei" → Holzwerkstatt, Hobelspäne,
 * Möbel. Eigene Google-Fotos bleiben vorn, Unsplash füllt auf.
 *
 * Unsplash-Regeln: Bilder werden direkt von Unsplash geladen, die Nutzung
 * wird gemeldet (`download_location`) und der Fotograf im Seitenfuß genannt
 * (`photoCredits` im Dokument).
 */
import {
  germanQueryFallback,
  searchStockPhotos,
  type StockPhoto,
} from "../_core/stockPhotos";
import type { BlueprintId } from "../../shared/stylePacks/blueprints";
import { CATEGORY_ENGLISH } from "./categoryEnglish";
import { categoryKey } from "./industryFamily";

/** Darunter wirken Fotos auf großen Flächen weich. */
const MIN_WIDTH = 2400;
const PER_PAGE = 30;

export type PhotoCredit = { name: string; url: string; match: string };

export type UnsplashFill = { urls: string[]; credits: PhotoCredit[] };

/** Szene je Familie — schärft die Suche Richtung Betrieb statt Symbolbild. */
const FAMILY_SCENE: Partial<Record<BlueprintId, string>> = {
  beauty: "salon",
  trade: "workshop",
  health: "clinic",
  advice: "office",
  retail: "shop",
  auto: "garage",
  courses: "class",
  stay: "hotel",
  creative: "studio",
  industry: "production",
};

/** Englischer Suchbegriff: gepflegte Übersetzung, dann Google-Tabelle. */
export function unsplashQuery(category: string, family: BlueprintId): string {
  const cat = category.trim();
  const base = (
    germanQueryFallback(cat) ??
    CATEGORY_ENGLISH[categoryKey(cat)] ??
    cat
  ).toLowerCase();
  const scene = FAMILY_SCENE[family];
  return scene && !base.includes(scene) ? `${base} ${scene}` : base;
}

function sized(photo: StockPhoto): string | undefined {
  if (!photo.raw) return undefined;
  const sep = photo.raw.includes("?") ? "&" : "?";
  return `${photo.raw}${sep}w=1800&q=80&auto=format&fit=crop`;
}

export type FillDeps = {
  search?: typeof searchStockPhotos;
  track?: (downloadLocation: string) => void;
};

function trackUse(downloadLocation: string): void {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return;
  void fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${key}` },
  }).catch(() => undefined);
}

/**
 * Bis zu `count` hochauflösende Querformate zur Kategorie. Leer, wenn die
 * Suche scheitert oder nichts Brauchbares liefert — nie ein Abbruch.
 */
export async function unsplashFill(
  category: string,
  family: BlueprintId,
  count: number,
  deps: FillDeps = {}
): Promise<UnsplashFill> {
  if (count <= 0) return { urls: [], credits: [] };
  const search = deps.search ?? searchStockPhotos;
  const query = unsplashQuery(category, family);
  const result = await search(query, 1, PER_PAGE, "high");
  const picked = result.photos
    .filter(
      p => (p.width ?? 0) >= MIN_WIDTH && (p.width ?? 0) > (p.height ?? 0)
    )
    .slice(0, count);
  const track = deps.track ?? trackUse;
  const urls: string[] = [];
  const credits: PhotoCredit[] = [];
  for (const photo of picked) {
    const url = sized(photo);
    if (!url || !photo.raw) continue;
    urls.push(url);
    credits.push({
      name: photo.photographer,
      url: photo.photographerUrl,
      match: photo.raw.split("?")[0],
    });
    if (photo.downloadLocation) track(photo.downloadLocation);
  }
  return { urls, credits };
}
