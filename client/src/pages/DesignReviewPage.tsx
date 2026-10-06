import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  ExternalLink,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import { PACK_SUMMARY } from "@shared/stylePacks/summary";
import {
  SHOWCASES,
  type Showcase,
  type ShowcaseEntry,
} from "@shared/stylePacks/blueprintShowcaseList";

type Viewport = "desktop" | "mobile";

type PreviewTarget = {
  kicker: string;
  title: string;
  src: string;
};

const ENTRY_LABEL: Record<ShowcaseEntry, string> = {
  stage: "Bühne",
  colorfield: "Farbfläche",
};

function bauplanSrc(id: string, entry: ShowcaseEntry, live = false): string {
  return `/demo/bauplan/${id}/${entry}${live ? "?live=1" : ""}`;
}

/** Zwei bis drei Optionen als Pillen-Umschalter (Dialog und Karten). */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  small = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
  small?: boolean;
}) {
  return (
    <div
      className="flex rounded-full border border-lp-line bg-lp-canvas p-1"
      role="group"
      aria-label={label}
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex items-center gap-2 rounded-full px-3 ${
            small ? "h-7 text-[0.74rem]" : "h-9 text-[0.82rem]"
          } ${
            value === option.value
              ? "bg-lp-ink text-lp-canvas"
              : "text-lp-muted hover:text-lp-ink"
          }`}
        >
          {option.icon}
          <span className={option.icon ? "hidden sm:inline" : undefined}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * Interne Übersicht (2026-08-31, Betreiber-Wunsch; seit 2026-10-06 mit den
 * Branchen-Bauplänen): oben, was ein Kunde der jeweiligen Branche heute
 * bekommt, darunter die 20 Packs als Rohfassung. Hinter dem Admin-Login
 * (AdminRoute in App.tsx). Kein localStorage.
 */
function PreviewDialog({
  target,
  viewport,
  onViewportChange,
  onClose,
  controls,
}: {
  target: PreviewTarget | null;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onClose: () => void;
  controls?: ReactNode;
}) {
  useEffect(() => {
    if (!target) return;
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
  }, [target, onClose]);

  if (!target) return null;

  return createPortal(
    <div
      className="lp fixed inset-0 z-[100] flex flex-col bg-lp-ink/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vorschau ${target.title}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface">
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-lp-line px-4 py-2 sm:px-5">
          <div className="mr-auto min-w-0">
            <p className="text-[0.72rem] uppercase tracking-[0.14em] text-lp-muted">
              {target.kicker}
            </p>
            <h2 className="truncate text-[1.05rem] font-medium text-lp-ink">
              {target.title}
            </h2>
          </div>
          {controls}
          <Segmented
            label="Vorschaugröße"
            value={viewport}
            onChange={onViewportChange}
            options={[
              {
                value: "desktop",
                label: "Desktop",
                icon: <Monitor className="h-4 w-4" aria-hidden="true" />,
              },
              {
                value: "mobile",
                label: "Mobil",
                icon: <Smartphone className="h-4 w-4" aria-hidden="true" />,
              },
            ]}
          />
          <a
            href={target.src}
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
              key={`${target.src}-${viewport}`}
              src={target.src}
              title={`Vorschau ${target.title}`}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

/** Verkleinerte Live-Ansicht einer Seite als Kachelbild. */
function ScaledFrame({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / FRAME_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={box}
      className="relative aspect-[16/10] w-full overflow-hidden bg-white"
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 origin-top-left border-0"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

function BauplanCard({
  showcase,
  onOpen,
}: {
  showcase: Showcase;
  onOpen: (entry: ShowcaseEntry) => void;
}) {
  const [entry, setEntry] = useState<ShowcaseEntry>("stage");
  return (
    <article className="overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface">
      <button
        type="button"
        onClick={() => onOpen(entry)}
        aria-label={`${showcase.label} ansehen`}
        className="group relative block w-full overflow-hidden border-b border-lp-line text-left"
      >
        <ScaledFrame
          src={bauplanSrc(showcase.id, entry)}
          title={`${showcase.label} – ${ENTRY_LABEL[entry]}`}
        />
        <span className="absolute right-3 bottom-3 inline-flex h-9 items-center gap-2 rounded-full bg-lp-ink px-3 text-[0.78rem] font-medium text-lp-canvas">
          Ansehen
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-3 p-5">
        <div className="mr-auto min-w-0">
          <h3 className="text-[1.2rem] font-medium">{showcase.label}</h3>
          <p className="mt-0.5 text-[0.84rem] text-lp-muted">
            Beispiel: {showcase.sample}
          </p>
        </div>
        <Segmented
          small
          label="Einstieg"
          value={entry}
          onChange={setEntry}
          options={[
            { value: "stage", label: ENTRY_LABEL.stage },
            { value: "colorfield", label: ENTRY_LABEL.colorfield },
          ]}
        />
      </div>
    </article>
  );
}

type OpenState =
  | { kind: "pack"; packId: string }
  | { kind: "bauplan"; showcase: Showcase; entry: ShowcaseEntry; live: boolean }
  | null;

function previewTarget(open: OpenState): PreviewTarget | null {
  if (!open) return null;
  if (open.kind === "pack") {
    const summary = PACK_SUMMARY.find(pack => pack.id === open.packId);
    return {
      kicker: "Pack (Rohfassung)",
      title: summary?.name ?? open.packId,
      src: `/demo/${open.packId}`,
    };
  }
  return {
    kicker: `${open.showcase.group} · ${ENTRY_LABEL[open.entry]}`,
    title: `${open.showcase.label} – ${open.showcase.sample}`,
    src: bauplanSrc(open.showcase.id, open.entry, open.live),
  };
}

function groupedShowcases(): [string, Showcase[]][] {
  const groups = new Map<string, Showcase[]>();
  for (const showcase of SHOWCASES)
    groups.set(showcase.group, [
      ...(groups.get(showcase.group) ?? []),
      showcase,
    ]);
  return Array.from(groups.entries());
}

export default function DesignReviewPage() {
  const [open, setOpen] = useState<OpenState>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const target = previewTarget(open);

  const bauplanControls =
    open?.kind === "bauplan" ? (
      <>
        <Segmented
          label="Einstieg"
          value={open.entry}
          onChange={entry => setOpen({ ...open, entry })}
          options={[
            { value: "stage", label: ENTRY_LABEL.stage },
            { value: "colorfield", label: ENTRY_LABEL.colorfield },
          ]}
        />
        <Segmented
          label="Ansicht"
          value={open.live ? "live" : "preview"}
          onChange={mode => setOpen({ ...open, live: mode === "live" })}
          options={[
            { value: "preview", label: "Vorschau" },
            { value: "live", label: "Fertige Seite" },
          ]}
        />
      </>
    ) : undefined;

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
          <nav className="flex gap-4 text-[0.82rem] text-lp-muted">
            <a href="#bauplaene" className="hover:text-lp-ink">
              Baupläne
            </a>
            <a href="#packs" className="hover:text-lp-ink">
              {PACK_SUMMARY.length} Packs
            </a>
          </nav>
        </div>
      </header>

      <main className="lp-container py-10 sm:py-16">
        <div className="grid gap-8 border-b border-lp-line pb-10 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <p className="lp-kicker">Design-Review</p>
            <h1 className="mt-4 max-w-[14ch] text-[clamp(2.5rem,6vw,5.75rem)] leading-[0.94] tracking-[-0.045em]">
              Was jede Branche bekommt.
            </h1>
          </div>
          <p className="max-w-[40rem] text-[1rem] leading-7 text-lp-muted">
            Je Branche ein Beispielbetrieb, so wie eine neu erzeugte Seite
            aussieht: Einstieg Bühne (Querformat-Foto) oder Farbfläche, dazu der
            Bauplan der Branche. „Vorschau" zeigt die Platzhalter, die der Kunde
            im Studio sieht, „Fertige Seite" die Live-Fassung.
          </p>
        </div>

        <section id="bauplaene" className="scroll-mt-24">
          {groupedShowcases().map(([group, showcases]) => (
            <div key={group} className="mt-12">
              <h2 className="flex items-baseline gap-3 text-[1.5rem] font-medium tracking-[-0.02em]">
                {group}
                <span className="text-[0.8rem] font-normal text-lp-muted">
                  {showcases.length}{" "}
                  {showcases.length === 1 ? "Beispiel" : "Beispiele"}
                </span>
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {showcases.map(showcase => (
                  <BauplanCard
                    key={showcase.id}
                    showcase={showcase}
                    onOpen={entry =>
                      setOpen({ kind: "bauplan", showcase, entry, live: false })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section
          id="packs"
          className="mt-20 scroll-mt-24 border-t border-lp-line pt-12"
        >
          <h2 className="text-[1.5rem] font-medium tracking-[-0.02em]">
            Die {PACK_SUMMARY.length} Packs (Rohfassung)
          </h2>
          <p className="mt-2 max-w-[44rem] text-[0.95rem] leading-7 text-lp-muted">
            Farben, Schriften und Grundformen jeder Richtung — ohne Einstieg und
            ohne Bauplan, so wie die Packs angelegt sind.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {PACK_SUMMARY.map((pack, index) => (
              <article
                key={pack.id}
                className="overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface"
              >
                <button
                  type="button"
                  onClick={() => setOpen({ kind: "pack", packId: pack.id })}
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
                      <h3 className="text-[1.3rem] font-medium">{pack.name}</h3>
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
        </section>
      </main>

      <PreviewDialog
        target={target}
        viewport={viewport}
        onViewportChange={setViewport}
        onClose={() => setOpen(null)}
        controls={bauplanControls}
      />
    </div>
  );
}
