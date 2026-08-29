import { ArrowUpRight } from "lucide-react";
import type { PackId } from "@shared/siteContract/types";
import { Kicker, textLink } from "./primitives";

/**
 * „Für wen" (Layout-Revision 2026-08-25): ruhiges, gleichmäßiges 2×2-Raster
 * statt asymmetrischem 7/5-Bento neben einer riesigen Textspalte. Der Kopf
 * spannt über die volle Breite; jede Branchenkarte hat dasselbe Verhältnis,
 * dieselbe Informationsmenge und ist als Ganzes klickbar.
 *
 * Werkbank ist bewusst NICHT dabei — das Pack trägt bereits den Hero-Morph.
 * So zeigt die Sektion zusätzliche visuelle Bandbreite statt „Maßarbeit"
 * zum dritten Mal zu wiederholen.
 */
interface Tile {
  packId: PackId;
  industry: string;
  examples: string;
  alt: string;
  promise: string;
}

const TILES: Tile[] = [
  {
    packId: "zunft",
    industry: "Handwerk & Handel",
    examples: "Bäckerei, Manufaktur, Fachgeschäft",
    alt: "Vorschau einer Pageblitz-Website für eine traditionelle Bäckerei",
    promise: "Tradition sichtbar machen, Sortiment klar verkaufen.",
  },
  {
    packId: "kanzlei",
    industry: "Kanzlei & Beratung",
    examples: "Steuerberatung, Anwaltskanzlei, Coaching",
    alt: "Vorschau einer Website in der Designrichtung Kanzlei",
    promise: "Vertrauen und Kompetenz auf den ersten Blick.",
  },
  {
    packId: "gusto",
    industry: "Gastronomie",
    examples: "Restaurant, Café, Bistro, Weinbar",
    alt: "Vorschau einer Website in der Designrichtung Gusto",
    promise: "Atmosphäre zeigen, Reservierungen gewinnen.",
  },
  {
    packId: "morgenlicht",
    industry: "Praxis & Gesundheit",
    examples: "Zahnarzt, Physiotherapie, Kosmetik, Heilpraktik",
    alt: "Vorschau einer Website in der Designrichtung Morgenlicht",
    promise: "Beruhigen, informieren und Termine ermöglichen.",
  },
];

export function ForWhom() {
  return (
    <section
      aria-labelledby="lp-forwhom-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <div className="grid gap-8 border-b border-lp-line pb-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <Kicker className="mb-4">Für wen</Kicker>
            <h2 id="lp-forwhom-heading" className="lp-h2 max-w-[44rem]">
              Für lokale Betriebe, die online so gut aussehen wollen, wie sie
              arbeiten.
            </h2>
          </div>
          <p className="max-w-[30rem] text-[1.05rem] leading-[1.6] text-lp-muted lg:col-span-4">
            Kein Einheitslook: Pageblitz verbindet deine Inhalte mit einer
            kuratierten Designrichtung und passt Farben, Schrift und
            Bildwirkung an deinen Betrieb an.
          </p>
        </div>

        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {TILES.map((tile, index) => (
            <article key={tile.packId} className="group">
              <a
                href={`/demo/${tile.packId}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${tile.industry}: Demo in neuem Tab öffnen`}
                className="block overflow-hidden rounded-[32px] bg-white"
              >
                <img
                  src={`/pack-previews/${tile.packId}.webp`}
                  alt={tile.alt}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="lp-zoom aspect-[16/10] w-full object-cover object-top"
                />
              </a>
              <div className="mt-4 grid grid-cols-[2.25rem_1fr] gap-3 border-t border-lp-line pt-3">
                <span className="lp-num pt-1 text-[1.65rem]" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[1.25rem] font-medium tracking-[-0.01em]">
                      {tile.industry}
                    </h3>
                    <a
                      href={`/demo/${tile.packId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${textLink} shrink-0 text-[0.9rem]`}
                    >
                      Demo
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                  <p className="mt-1 text-[0.95rem] leading-[1.55]">
                    {tile.promise}
                  </p>
                  <p className="mt-2 text-[0.85rem] text-lp-muted">
                    {tile.examples}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-lp-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[42rem] text-[0.95rem] text-lp-muted">
            Auch für Friseur, Fitnessstudio, Fotograf, Immobilien und viele
            mehr.
          </p>
          <a href="#branchen" className={`${textLink} shrink-0`}>
            Alle Branchen ansehen
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
