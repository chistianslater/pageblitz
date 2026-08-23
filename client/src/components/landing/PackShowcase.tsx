import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { getConstitution } from "@shared/stylePacks";
import { PACK_IDS, type PackId } from "@shared/siteContract/types";
import { getPackAccent } from "@/lib/packAccent";

interface PackShowcaseProps {
  isDark: boolean;
}

/** Feste Anzeigereihenfolge — deckungsgleich mit `PACK_IDS` (siehe `shared/siteContract/schema.ts`). */
const PACK_ORDER: readonly PackId[] = PACK_IDS;

interface PackCardProps {
  packId: PackId;
  index: number;
  isDark: boolean;
  animate: boolean;
  onOpen: (packId: PackId, trigger: HTMLElement) => void;
}

function PackCard({ packId, index, isDark, animate, onOpen }: PackCardProps) {
  const constitution = getConstitution(packId);
  const accent = getPackAccent(packId);

  function handleOpen(event: React.MouseEvent<HTMLButtonElement>): void {
    onOpen(packId, event.currentTarget);
  }

  return (
    <motion.article
      aria-label={`${constitution.name}: ${constitution.essence}`}
      initial={animate ? { opacity: 0, y: 24 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 4) * 0.06, duration: 0.5 }}
      className={`group relative rounded-2xl border overflow-hidden transition-colors duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03] hover:border-white/25"
          : "border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
    >
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Live-Vorschau ${constitution.name} öffnen`}
        className="relative block w-full aspect-[16/10] overflow-hidden bg-white border-b text-left cursor-zoom-in"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}
      >
        <img
          src={`/pack-previews/${packId}.webp`}
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          alt={`Vorschau Style Pack ${constitution.name}`}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
          aria-hidden="true"
        />
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <span
            className={`text-xs font-mono tabular-nums ${isDark ? "text-white/30" : "text-gray-600"}`}
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="w-3 h-3 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
        </div>
        <h3
          className={`font-semibold text-lg mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {constitution.name}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-4 min-h-[2.5rem] ${isDark ? "text-white/50" : "text-gray-600"}`}
        >
          {constitution.essence}
        </p>
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
            isDark
              ? "text-lime-300 hover:text-lime-200"
              : "text-lime-700 hover:text-lime-600"
          }`}
        >
          Ansehen
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.article>
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
 * Öffnen (kein vorab geladenes iframe wie im alten Showcase). Eigene
 * Fokusfalle statt `@radix-ui/react-dialog`/`ui/dialog.tsx`: Letzteres ist
 * auf das Dashboard-Farbschema (`--background`-Token, siehe `index.css`)
 * zugeschnitten und würde auf der hell/dunkel umschaltbaren Landingpage
 * (`isDark`-Prop statt CSS-Variablen-Theming) nicht passen. Struktur folgt
 * dem bereits vorhandenen, SSR-sicheren Insel-Panel-Muster
 * (`BookingIsland.tsx`/`ChatIsland.tsx`: `createPortal` nur mit
 * `document`-Check, Escape schließt, Fokus-Rückgabe an den Auslöser) und
 * ergänzt eine echte Tab-Fokusfalle, die dort für ein FAB-Panel nicht nötig
 * war.
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

  const constitution = getConstitution(packId);
  const demoHref = `/demo/${packId}`;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ height: "min(85vh, 720px)" }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3">
          <h3 id={titleId} className="font-semibold text-gray-900">
            {constitution.name}
          </h3>
          <div className="flex items-center gap-4">
            <a
              href={demoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-lime-700 hover:text-lime-600"
            >
              In neuem Tab öffnen
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Vorschau schließen"
              className="rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <iframe
          src={demoHref}
          title={`Live-Vorschau: ${constitution.name}`}
          className="w-full flex-1 border-0"
        />
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}

/**
 * Zeigt alle 14 Style Packs als Grid — je Karte ein statisches Vorschaubild
 * (`client/public/pack-previews/<pack>.webp`, erzeugt von
 * `scripts/build-pack-previews.mjs` via `npm run build:previews`). Klick auf
 * Bild oder „Ansehen" öffnet die Live-Demo (`/demo/<pack>`) in einem Modal
 * statt — wie vorher — 14 sofort ladende iframes gleichzeitig zu rendern
 * (Landingpage-LCP/JS-Gewicht, siehe Task-6-Bericht).
 * Ersetzt den alten v1-Showcase (`WebsiteShowcase`/`LivePreviewCard`), der
 * feste Demo-Daten der (in B4b entfernten) v1-Layouts gerendert hat.
 */
export function PackShowcase({ isDark }: PackShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const animate = !prefersReducedMotion;

  const [openPackId, setOpenPackId] = useState<PackId | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback((packId: PackId, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpenPackId(packId);
  }, []);

  const handleClose = useCallback(() => {
    setOpenPackId(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return (
    <section id="showcase" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.p
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          className={`text-sm font-medium uppercase tracking-widest mb-3 transition-colors duration-500 ${isDark ? "text-white/40" : "text-gray-600"}`}
        >
          14 Stilwelten
        </motion.p>
        <motion.h2
          initial={animate ? { opacity: 0, y: 20 } : undefined}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl transition-colors duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          Ein Look für jedes Handwerk.
        </motion.h2>
        <p
          className={`mt-4 max-w-xl text-base transition-colors duration-500 ${isDark ? "text-white/50" : "text-gray-600"}`}
        >
          Jedes Paket bringt eine eigene, fertig abgestimmte Optik mit —
          Typografie, Farben und Layout passend zur Branche. Du wählst den Stil,
          der zu dir passt, deine Inhalte bleiben gleich.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PACK_ORDER.map((packId, index) => (
          <PackCard
            key={packId}
            packId={packId}
            index={index}
            isDark={isDark}
            animate={animate}
            onOpen={handleOpen}
          />
        ))}
      </div>

      <PreviewModal packId={openPackId} onClose={handleClose} />
    </section>
  );
}
