/**
 * Unsplash stock photo search
 * Requires UNSPLASH_ACCESS_KEY env var (free at unsplash.com/oauth/applications)
 * Rate limit: 50 req/hour (demo) – covered by 5-min in-memory cache
 */

const UNSPLASH_BASE = "https://api.unsplash.com";

// Simple in-memory TTL cache – keyed by "query:page:perPage"
const cache = new Map<string, { data: StockSearchResult; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface StockPhoto {
  id: string;
  url: string;         // full-res landscape (w=1600)
  thumb: string;       // thumbnail (w=400)
  photographer: string;
  photographerUrl: string;
}

export interface StockSearchResult {
  photos: StockPhoto[];
  total: number;
  totalPages: number;
}

export async function searchStockPhotos(
  query: string,
  page = 1,
  perPage = 12
): Promise<StockSearchResult> {
  const empty: StockSearchResult = { photos: [], total: 0, totalPages: 0 };

  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    console.warn("[stockPhotos] UNSPLASH_ACCESS_KEY not set");
    return empty;
  }

  const cacheKey = `${query.toLowerCase().trim()}:${page}:${perPage}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const params = new URLSearchParams({
      query,
      per_page: String(perPage),
      page: String(page),
      orientation: "landscape",
    });
    const res = await fetch(`${UNSPLASH_BASE}/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${apiKey}` },
    });

    if (!res.ok) {
      console.warn(`[stockPhotos] Unsplash error ${res.status}`);
      return empty;
    }

    const data = await res.json();
    const result: StockSearchResult = {
      photos: (data.results || []).map((p: any) => ({
        id: String(p.id),
        // Append utm params for Unsplash attribution compliance
        url:  p.urls.regular  + "&utm_source=pageblitz&utm_medium=referral",
        thumb: p.urls.small   + "&utm_source=pageblitz&utm_medium=referral",
        photographer: p.user?.name ?? "Unbekannt",
        photographerUrl: (p.user?.links?.html ?? "https://unsplash.com") + "?utm_source=pageblitz&utm_medium=referral",
      })),
      total: data.total ?? 0,
      totalPages: data.total_pages ?? 0,
    };

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (e) {
    console.error("[stockPhotos] fetch failed:", e);
    return empty;
  }
}
