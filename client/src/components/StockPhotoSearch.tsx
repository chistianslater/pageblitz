import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Loader2, ChevronRight } from "lucide-react";

interface StockPhotoSearchProps {
  /** Called when user clicks a photo – receives full-res URL */
  onSelect: (url: string) => void;
  /** Optional initial search query */
  defaultQuery?: string;
  /** Number of photos per page (default 12) */
  perPage?: number;
  /** Extra className on the root element */
  className?: string;
}

export default function StockPhotoSearch({
  onSelect,
  defaultQuery = "",
  perPage = 12,
  className = "",
}: StockPhotoSearchProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultQuery);
  const [page, setPage] = useState(1);
  const [allPhotos, setAllPhotos] = useState<{ id: string; url: string; thumb: string; photographer: string; photographerUrl: string }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce input 500ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
      setAllPhotos([]);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const { data, isFetching } = trpc.onboarding.searchStockPhotos.useQuery(
    { query: debouncedQuery, page, perPage },
    { enabled: debouncedQuery.length >= 2 }
  );

  // Append newly loaded photos when page changes or first load
  useEffect(() => {
    if (!data?.photos.length) return;
    setAllPhotos(prev =>
      page === 1 ? data.photos : [...prev, ...data.photos.filter(p => !prev.some(x => x.id === p.id))]
    );
  }, [data, page]);

  const hasMore = data ? page < data.totalPages : false;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Stichwort eingeben, z.B. „Friseur", „Büro", „Restaurant"…"
          className="w-full bg-slate-700/60 text-white text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-600 outline-none focus:border-blue-500 placeholder-slate-500 transition-colors"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Empty state */}
      {debouncedQuery.length < 2 && (
        <p className="text-slate-500 text-xs text-center py-4">
          Mindestens 2 Zeichen eingeben um zu suchen
        </p>
      )}

      {/* No results */}
      {debouncedQuery.length >= 2 && !isFetching && allPhotos.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-4">
          Keine Bilder gefunden für „{debouncedQuery}"
        </p>
      )}

      {/* Photo grid */}
      {allPhotos.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {allPhotos.map(photo => (
              <button
                key={photo.id}
                onClick={() => onSelect(photo.url)}
                title={`Foto von ${photo.photographer} auf Unsplash`}
                className="group relative aspect-video rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all focus:outline-none focus:ring-blue-500"
              >
                <img
                  src={photo.thumb}
                  alt={`Foto von ${photo.photographer}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                {/* Photographer attribution on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[9px] truncate leading-tight">
                    {photo.photographer}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isFetching}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white py-2 transition-colors disabled:opacity-50"
            >
              {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
              Mehr laden
            </button>
          )}

          {/* Unsplash attribution */}
          <p className="text-slate-600 text-[10px] text-center">
            Fotos von{" "}
            <a href="https://unsplash.com?utm_source=pageblitz&utm_medium=referral"
              target="_blank" rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors">
              Unsplash
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
