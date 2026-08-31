import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ExternalLink, Monitor, Smartphone, X } from "lucide-react";
import { PACK_SUMMARY } from "@shared/stylePacks/summary";
import type { PackId } from "@shared/siteContract/types";

type Viewport = "desktop" | "mobile";

/**
 * Interne Pack-Galerie (2026-08-31, Betreiber-Wunsch): früher ein volles
 * Review-Tool mit Verdicts/Notizen/Layout-Kuratierung — auf reine Vorschau
 * reduziert („mir reicht die Vorschau") und in App.tsx hinter den
 * Admin-Login gelegt (AdminRoute). Kein localStorage mehr.
 */
function PreviewDialog({
  packId,
  viewport,
  onViewportChange,
  onClose,
}: {
  packId: PackId | null;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onClose: () => void;
}) {
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

  return createPortal(
    <div
      className="lp fixed inset-0 z-[100] flex flex-col bg-lp-ink/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vorschau ${summary?.name ?? packId}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface">
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-lp-line px-4 py-2 sm:px-5">
          <div className="mr-auto min-w-0">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-lp-muted">
              Vorschau
            </p>
            <h2 className="truncate text-[1.05rem] font-medium text-lp-ink">
              {summary?.name ?? packId}
            </h2>
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
            aria-label="Vorschau schließen"
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
              key={`${packId}-${viewport}`}
              src={`/demo/${packId}`}
              title={`Vorschau ${summary?.name ?? packId}`}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function DesignReviewPage() {
  const [openPack, setOpenPack] = useState<PackId | null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");

  return (
    <div className="lp min-h-screen bg-lp-canvas text-lp-ink">
      <header className="sticky top-0 z-30 border-b border-lp-line bg-lp-canvas/95 backdrop-blur-[3px]">
        <div className="lp-container flex min-h-[4.5rem] flex-wrap items-center gap-4 py-3">
          <a href="/admin" className="mr-auto flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[7px] bg-lp-ink font-semibold text-lp-canvas">
              ↯
            </span>
            <span className="font-medium">Pageblitz</span>
          </a>
          <span className="text-[0.8rem] text-lp-muted">
            {PACK_SUMMARY.length} Richtungen
          </span>
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
            Öffne jede Richtung als echte Website — Desktop und Mobil direkt
            in der Vorschau, oder im neuen Tab.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PACK_SUMMARY.map((pack, index) => (
            <article
              key={pack.id}
              className="overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface"
            >
              <button
                type="button"
                onClick={() => setOpenPack(pack.id)}
                aria-label={`${pack.name} ansehen`}
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
                  Ansehen
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>

              <div className="flex items-start gap-4 p-5">
                <span className="mt-1 text-[0.72rem] tabular-nums text-lp-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[1.3rem] font-medium">{pack.name}</h2>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: pack.accent }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1 text-[0.88rem] leading-6 text-lp-muted">
                    {pack.essence}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <PreviewDialog
        packId={openPack}
        viewport={viewport}
        onViewportChange={setViewport}
        onClose={() => setOpenPack(null)}
      />
    </div>
  );
}
