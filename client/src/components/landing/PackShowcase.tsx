import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PACK_SUMMARY, type PackSummary } from "@shared/stylePacks/summary";
import type { PackId } from "@shared/siteContract/types";
import { motionSafeScrollBehavior } from "@/lib/motion";
import { SectionHead, textLink } from "./primitives";

interface PackCardProps {
  summary: PackSummary;
  index: number;
  onOpen: (packId: PackId, trigger: HTMLElement) => void;
}

/**
 * Eine Zelle im Hairline-Raster: Vorschaubild, darunter Nummer, Akzentpunkt,
 * Name, Essenz und „Ansehen". Kein Karten-Schatten, keine Eingangsanimation —
 * das Raster selbst ist die Struktur.
 */
function PackCard({ summary, index, onOpen }: PackCardProps) {
  const { id: packId, name, essence, accent } = summary;

  function handleOpen(event: React.MouseEvent<HTMLButtonElement>): void {
    onOpen(packId, event.currentTarget);
  }

  return (
    <article
      aria-label={`${name}: ${essence}`}
      className="lp-stage-card group flex w-[16rem] shrink-0 snap-start flex-col overflow-hidden sm:w-[18rem]"
    >
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Live-Vorschau ${name} öffnen`}
        className="relative block w-full cursor-zoom-in overflow-hidden bg-[#f3f3f3] text-left focus-visible:outline-offset-[-2px]"
      >
        <img
          src={`/pack-previews/${packId}.webp`}
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          alt={`Vorschau Designrichtung ${name}`}
          className="lp-zoom block aspect-[16/10] w-full object-cover object-top"
        />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-[0.75rem] tabular-nums text-lp-muted"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
        </div>
        <h3 className="text-[1.2rem] leading-tight tracking-[-0.01em]">
          {name}
        </h3>
        <p className="mt-1.5 mb-4 flex-1 text-[0.9rem] leading-[1.55] text-lp-muted">
          {essence}
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className={`${textLink} self-start text-[0.9rem]`}
        >
          Ansehen
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

interface PreviewModalProps {
  packId: PackId | null;
  onClose: () => void;
}

/**
 * Modal für die Live-Vorschau eines Packs — lädt `/demo/<pack>` erst beim
 * Öffnen. Eigene Fokusfalle statt `ui/dialog.tsx` (das ist auf das
 * Dashboard-Farbschema zugeschnitten). Struktur folgt dem SSR-sicheren
 * Insel-Panel-Muster (`BookingIsland.tsx`/`ChatIsland.tsx`: `createPortal`
 * nur mit `document`-Check, Escape schließt, Fokus-Rückgabe an den Auslöser)
 * plus echte Tab-Fokusfalle.
 */
function PreviewModal({ packId, onClose }: PreviewModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!packId) return;
    closeButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [packId, onClose]);

  if (!packId) return null;

  const name = PACK_SUMMARY.find(p => p.id === packId)?.name ?? packId;
  const demoHref = `/demo/${packId}`;

  const modal = (
    <div
      className="lp fixed inset-0 z-[100] flex items-center justify-center bg-lp-ink/60 p-4 sm:p-8"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-lp-surface"
        style={{ height: "min(85vh, 720px)" }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-lp-line px-5 py-3">
          <h3 id={titleId} className="font-medium">
            {name}
          </h3>
          <div className="flex items-center gap-4">
            <a
              href={demoHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${textLink} text-[0.9rem]`}
            >
              In neuem Tab öffnen
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Vorschau schließen"
              className="rounded-full p-1.5 text-lp-muted transition-colors hover:bg-lp-canvas hover:text-lp-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe
          src={demoHref}
          title={`Live-Vorschau: ${name}`}
          className="w-full flex-1 border-0 bg-white"
        />
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

/**
 * Zeigt alle 14 Style Packs als horizontal scrollbares Karussell — je Karte
 * ein statisches Vorschaubild (`client/public/pack-previews/<pack>.webp`,
 * erzeugt von `scripts/build-pack-previews.mjs` via `npm run build:previews`).
 * Der sichtbare Ausschnitt zeigt bewusst nur wenige Karten auf einmal (die
 * Sammlung soll mit der Zeit wachsen, ohne dass die Sektion "voller" wirkt);
 * Pfeiltasten scrollen seitenweise, native Scroll-Snap hält Karten am Rand
 * ausgerichtet. Klick auf Bild oder „Ansehen" öffnet die Live-Demo
 * (`/demo/<pack>`) im Modal statt 14 iframes sofort zu laden (LCP/JS-Gewicht).
 */
export function PackShowcase() {
  const [openPackId, setOpenPackId] = useState<PackId | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const handleOpen = useCallback((packId: PackId, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenPackId(packId);
  }, []);

  const handleClose = useCallback(() => {
    setOpenPackId(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState]);

  function scrollByPage(direction: 1 | -1): void {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: motionSafeScrollBehavior(),
    });
  }

  return (
    <section
      id="showcase"
      aria-labelledby="lp-showcase-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            id="lp-showcase-heading"
            kicker="Designrichtungen"
            title="Welche Richtung passt zu deinem Betrieb?"
            text="Diese Richtungen sind professionelle Ausgangspunkte, keine fertigen Vorlagen. Deine Inhalte, Farben, Schriften und Bilder formen daraus deine Website."
            billboard
            echo
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollPrev}
              aria-label="Vorherige Designrichtungen"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-lp-line text-lp-ink transition-colors hover:border-lp-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              disabled={!canScrollNext}
              aria-label="Weitere Designrichtungen"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-lp-line text-lp-ink transition-colors hover:border-lp-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="pb-carousel-track mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {PACK_SUMMARY.map((summary, index) => (
            <PackCard
              key={summary.id}
              summary={summary}
              index={index}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>

      <PreviewModal packId={openPackId} onClose={handleClose} />
    </section>
  );
}
