import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Monitor,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import { PACK_SUMMARY } from "@shared/stylePacks/summary";
import type { PackId } from "@shared/siteContract/types";
import {
  enablePreviewLayoutChrome,
  type LayoutOverlay,
} from "./onboarding-v2/previewLayoutChrome";
import {
  LAYOUT_STORAGE_KEY,
  REVIEW_STORAGE_KEY,
  VERDICT_LABELS,
  describeLayoutOverlay,
  formatReviewExport,
  parsePackLayoutMap,
  type PackLayoutMap,
  type Review,
  type Reviews,
  type Verdict,
} from "./designReviewModel";

type Filter = "all" | Verdict;
type Viewport = "desktop" | "mobile";

function readReviews(): Reviews {
  try {
    const value = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    return value ? (JSON.parse(value) as Reviews) : {};
  } catch {
    return {};
  }
}

function readLayouts(): PackLayoutMap {
  try {
    const value = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return value ? parsePackLayoutMap(JSON.parse(value)) : {};
  } catch {
    return {};
  }
}

function PreviewDialog({
  packId,
  viewport,
  overlay,
  onViewportChange,
  onOverlayChange,
  onClose,
}: {
  packId: PackId | null;
  viewport: Viewport;
  overlay: LayoutOverlay;
  onViewportChange: (viewport: Viewport) => void;
  onOverlayChange: (overlay: LayoutOverlay) => void;
  onClose: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;
  const onOverlayChangeRef = useRef(onOverlayChange);
  onOverlayChangeRef.current = onOverlayChange;

  useEffect(() => {
    if (!packId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [packId, onClose]);

  if (!packId) return null;
  const summary = PACK_SUMMARY.find(pack => pack.id === packId);
  const layoutSummary = describeLayoutOverlay(overlay);
  const attachChrome = (iframe: HTMLIFrameElement) => {
    const doc = iframe.contentDocument;
    if (!doc) return;
    enablePreviewLayoutChrome(doc, null, () => {}, {
      overlay: overlayRef.current,
      onOverlayChange: next => onOverlayChangeRef.current(next),
    });
  };

  return createPortal(
    <div
      className="lp fixed inset-0 z-[100] flex flex-col bg-lp-ink/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Live-Prüfung ${summary?.name ?? packId}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface">
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-lp-line px-4 py-2 sm:px-5">
          <div className="mr-auto min-w-0">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-lp-muted">
              Live-Prüfung
            </p>
            <h2 className="truncate text-[1.05rem] font-medium text-lp-ink">
              {summary?.name ?? packId}
            </h2>
            <p className="mt-0.5 text-[0.75rem] text-lp-muted">
              {layoutSummary
                ? layoutSummary
                : "Layout-Button in der Vorschau: am Desktop per Hover auffächern."}
            </p>
          </div>
          <div
            className="flex rounded-full border border-lp-line bg-lp-canvas p-1"
            aria-label="Vorschaugröße"
          >
            <button
              type="button"
              aria-pressed={viewport === "desktop"}
              onClick={() => onViewportChange("desktop")}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-[0.82rem] ${
                viewport === "desktop"
                  ? "bg-lp-ink text-lp-canvas"
                  : "text-lp-muted"
              }`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              aria-pressed={viewport === "mobile"}
              onClick={() => onViewportChange("mobile")}
              className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-[0.82rem] ${
                viewport === "mobile"
                  ? "bg-lp-ink text-lp-canvas"
                  : "text-lp-muted"
              }`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Mobil</span>
            </button>
          </div>
          {layoutSummary ? (
            <button
              type="button"
              onClick={() => {
                onOverlayChange({});
                const doc = iframeRef.current?.contentDocument;
                if (doc) {
                  enablePreviewLayoutChrome(doc, null, () => {}, {
                    overlay: {},
                    onOverlayChange: next => onOverlayChangeRef.current(next),
                  });
                }
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-lp-line px-3 text-[0.82rem] text-lp-ink"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Pack-Default</span>
            </button>
          ) : null}
          <a
            href={`/demo/${packId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-lp-line px-3 text-[0.82rem] text-lp-ink"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Neuer Tab</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Live-Prüfung schließen"
            className="grid h-10 w-10 place-items-center rounded-full border border-lp-line text-lp-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-[#d8d6d1] p-2 sm:p-5">
          <div
            className="h-full overflow-hidden bg-white shadow-[0_24px_60px_-32px_rgba(0,0,0,.55)] transition-[width] duration-300"
            style={{ width: viewport === "mobile" ? 390 : "100%" }}
          >
            <iframe
              ref={iframeRef}
              key={`${packId}-${viewport}`}
              src={`/demo/${packId}`}
              title={`Live-Vorschau ${summary?.name ?? packId}`}
              className="h-full w-full border-0 bg-white"
              onLoad={event => attachChrome(event.currentTarget)}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function DesignReviewPage() {
  const [reviews, setReviews] = useState<Reviews>({});
  const [layouts, setLayouts] = useState<PackLayoutMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [openPack, setOpenPack] = useState<PackId | null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReviews(readReviews());
    setLayouts(readLayouts());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
  }, [layouts, hydrated]);

  const reviewFor = (packId: PackId): Review =>
    reviews[packId] ?? { verdict: "pending", note: "" };

  const updateReview = (packId: PackId, patch: Partial<Review>) => {
    setReviews(current => ({
      ...current,
      [packId]: { ...reviewFor(packId), ...current[packId], ...patch },
    }));
  };

  const updateLayout = (packId: PackId, overlay: LayoutOverlay) => {
    setLayouts(current => {
      const next = { ...current };
      if (Object.keys(overlay).length === 0) delete next[packId];
      else next[packId] = overlay;
      return next;
    });
  };

  const counts = useMemo(
    () =>
      PACK_SUMMARY.reduce(
        (result, pack) => {
          result[reviewFor(pack.id).verdict] += 1;
          return result;
        },
        { pending: 0, approved: 0, changes: 0 }
      ),
    [reviews]
  );

  const visiblePacks = PACK_SUMMARY.filter(
    pack => filter === "all" || reviewFor(pack.id).verdict === filter
  );

  const copyFeedback = async () => {
    const text = formatReviewExport({
      packs: PACK_SUMMARY,
      reviewFor,
      layouts,
      pendingCount: counts.pending,
    });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="lp min-h-screen bg-lp-canvas text-lp-ink">
      <header className="sticky top-0 z-30 border-b border-lp-line bg-lp-canvas/95 backdrop-blur-[3px]">
        <div className="lp-container flex min-h-[4.5rem] flex-wrap items-center gap-4 py-3">
          <a href="/" className="mr-auto flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-lp-ink font-semibold text-lp-canvas">
              ↯
            </span>
            <span className="font-medium">Pageblitz</span>
          </a>
          <div className="hidden items-center gap-5 text-[0.8rem] text-lp-muted sm:flex">
            <span>{counts.approved} passen</span>
            <span>{counts.changes} Korrekturen</span>
            <span>{counts.pending} offen</span>
          </div>
          <button
            type="button"
            onClick={copyFeedback}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-lp-ink px-4 text-[0.85rem] font-medium text-lp-canvas"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Kopiert" : "Feedback kopieren"}
          </button>
        </div>
      </header>

      <main className="lp-container py-10 sm:py-16">
        <div className="grid gap-8 border-b border-lp-line pb-10 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="lp-kicker">Design-Review</p>
            <h1 className="mt-4 max-w-[13ch] text-[clamp(2.5rem,6vw,5.75rem)] leading-[0.94] tracking-[-0.045em]">
              Alle Richtungen auf einen Blick.
            </h1>
          </div>
          <p className="max-w-[40rem] text-[1rem] leading-7 text-lp-muted">
            Öffne jede Richtung als echte Website, prüfe Desktop und Mobil und
            probiere die Sektions-Layouts direkt in der Vorschau. Notizen und
            gewählte Layouts bleiben auf diesem Gerät gespeichert.
          </p>
        </div>

        <div className="my-8 flex flex-wrap gap-2" aria-label="Review filtern">
          {(
            [
              ["all", `Alle ${PACK_SUMMARY.length}`],
              ["pending", `Offen ${counts.pending}`],
              ["changes", `Korrektur ${counts.changes}`],
              ["approved", `Passt ${counts.approved}`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`h-10 rounded-full border px-4 text-[0.85rem] ${
                filter === value
                  ? "border-lp-ink bg-lp-ink text-lp-canvas"
                  : "border-lp-line bg-lp-surface text-lp-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePacks.map((pack, index) => {
            const review = reviewFor(pack.id);
            const layoutSummary = describeLayoutOverlay(layouts[pack.id]);
            return (
              <article
                key={pack.id}
                className="overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpenPack(pack.id)}
                  aria-label={`${pack.name} live prüfen`}
                  className="group relative block w-full overflow-hidden border-b border-lp-line bg-white text-left"
                >
                  <img
                    src={`/pack-previews/${pack.id}.webp`}
                    width={800}
                    height={500}
                    loading="lazy"
                    decoding="async"
                    alt=""
                    className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
                  />
                  <span className="absolute right-3 bottom-3 inline-flex h-9 items-center gap-2 rounded-full bg-lp-ink px-3 text-[0.78rem] font-medium text-lp-canvas">
                    Live prüfen
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="mt-1 text-[0.72rem] tabular-nums text-lp-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[1.3rem] font-medium">
                          {pack.name}
                        </h2>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: pack.accent }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-1 text-[0.88rem] leading-6 text-lp-muted">
                        {pack.essence}
                      </p>
                      {layoutSummary ? (
                        <p className="mt-2 text-[0.78rem] leading-5 text-lp-ink">
                          {layoutSummary}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className="mt-5 grid grid-cols-3 rounded-[10px] border border-lp-line p-1"
                    aria-label={`Bewertung ${pack.name}`}
                  >
                    {(["pending", "approved", "changes"] as const).map(
                      verdict => (
                        <button
                          key={verdict}
                          type="button"
                          aria-pressed={review.verdict === verdict}
                          onClick={() => updateReview(pack.id, { verdict })}
                          className={`h-9 rounded-[7px] text-[0.76rem] ${
                            review.verdict === verdict
                              ? verdict === "changes"
                                ? "bg-[#fff0eb] text-[#a13a1d]"
                                : verdict === "approved"
                                  ? "bg-[#e7f4ed] text-[#176142]"
                                  : "bg-lp-canvas text-lp-ink"
                              : "text-lp-muted"
                          }`}
                        >
                          {VERDICT_LABELS[verdict]}
                        </button>
                      )
                    )}
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 flex items-center gap-2 text-[0.76rem] font-medium text-lp-muted">
                      <MessageSquare
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Korrektur oder Anmerkung
                    </span>
                    <textarea
                      value={review.note}
                      onChange={event =>
                        updateReview(pack.id, { note: event.target.value })
                      }
                      placeholder="Zum Beispiel: Hero auf Mobil zu eng …"
                      rows={3}
                      className="w-full resize-y rounded-[9px] border border-lp-line bg-lp-canvas px-3 py-2.5 text-[0.85rem] leading-6 outline-none transition-colors placeholder:text-lp-muted/65 focus:border-lp-ink"
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <PreviewDialog
        packId={openPack}
        viewport={viewport}
        overlay={openPack ? (layouts[openPack] ?? {}) : {}}
        onViewportChange={setViewport}
        onOverlayChange={overlay => {
          if (openPack) updateLayout(openPack, overlay);
        }}
        onClose={() => setOpenPack(null)}
      />
    </div>
  );
}
