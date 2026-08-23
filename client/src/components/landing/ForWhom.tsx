import { ArrowUpRight } from "lucide-react";
import { PACK_SUMMARY } from "@shared/stylePacks/summary";
import type { PackId } from "@shared/siteContract/types";
import { SectionHead, textLink } from "./primitives";

/**
 * „Für wen": vier große Bildkacheln (Demo-Bilder aus client/public/demo, die
 * auch die Live-Demos nutzen) statt Emoji-Mini-Karten. Bento-Raster 7/5 und
 * 5/7 Spalten, Bildunterschrift mit Hairline: Branche, Pack + Essenz, Link zur
 * echten Demo.
 */
interface Tile {
  packId: PackId;
  industry: string;
  examples: string;
  image: string;
  alt: string;
  span: "wide" | "narrow";
}

const TILES: Tile[] = [
  {
    packId: "werkbank",
    industry: "Handwerk",
    examples: "Schreinerei, Elektro, Sanitär, Bau",
    image: "/demo/werkbank-hero.webp",
    alt: "Schreiner hobelt ein Werkstück in seiner Werkstatt",
    span: "wide",
  },
  {
    packId: "kanzlei",
    industry: "Kanzlei & Beratung",
    examples: "Steuerberatung, Anwaltskanzlei, Coaching",
    image: "/demo/kanzlei-hero.webp",
    alt: "Ruhiger Schreibtisch einer Kanzlei mit Lampe und Akten",
    span: "narrow",
  },
  {
    packId: "gusto",
    industry: "Gastronomie",
    examples: "Restaurant, Café, Bistro, Weinbar",
    image: "/demo/gusto-hero.webp",
    alt: "Angerichteter Teller im Kerzenlicht eines Restaurants",
    span: "narrow",
  },
  {
    packId: "morgenlicht",
    industry: "Praxis & Wellness",
    examples: "Physiotherapie, Kosmetik, Heilpraktik, Studio",
    image: "/demo/morgenlicht-hero.webp",
    alt: "Heller Empfangsbereich einer Praxis mit Pflanzen",
    span: "wide",
  },
];

function essenceOf(packId: PackId): { name: string; essence: string } {
  const pack = PACK_SUMMARY.find(p => p.id === packId);
  return { name: pack?.name ?? packId, essence: pack?.essence ?? "" };
}

export function ForWhom() {
  return (
    <section
      aria-labelledby="lp-forwhom-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHead
              id="lp-forwhom-heading"
              kicker="Für wen"
              title="Für Betriebe, die über Google gefunden werden wollen."
              text="Für alle, die Kunden über das Internet gewinnen wollen – ohne IT-Kenntnisse. Vier Beispiele aus den 14 Stilwelten:"
            />
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-12 lg:col-span-8">
            {TILES.map(tile => {
              const { name, essence } = essenceOf(tile.packId);
              return (
                <figure
                  key={tile.packId}
                  className={
                    tile.span === "wide" ? "sm:col-span-7" : "sm:col-span-5"
                  }
                >
                  <a
                    href={`/demo/${tile.packId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Demo ${name} (${tile.industry}) in neuem Tab öffnen`}
                    className="group block overflow-hidden rounded-[10px] border border-lp-line bg-white"
                  >
                    <img
                      src={tile.image}
                      alt={tile.alt}
                      width={1600}
                      height={1067}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--lp-ease)] group-hover:scale-[1.03]"
                    />
                  </a>
                  <figcaption className="mt-4 border-t border-lp-line pt-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[1.25rem] font-medium tracking-[-0.01em]">
                        {tile.industry}
                      </span>
                      <a
                        href={`/demo/${tile.packId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${textLink} shrink-0 text-[0.9rem]`}
                      >
                        Demo ansehen
                        <ArrowUpRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                    <p className="mt-1 text-[0.9rem] text-lp-muted">
                      {tile.examples}
                    </p>
                    <p className="mt-2 text-[0.85rem] text-lp-muted">
                      <span className="text-lp-ink">Style Pack {name}</span> —{" "}
                      {essence}
                    </p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
        <p className="mt-12 max-w-[40rem] border-t border-lp-line pt-5 text-[0.95rem] text-lp-muted">
          Außerdem für Friseur, Zahnarzt, Fitnessstudio, Fotograf, Immobilien
          und viele mehr —{" "}
          <a href="#branchen" className={textLink}>
            alle Branchen
          </a>
          . Wenn du ein lokales Unternehmen hast, ist Pageblitz für dich.
        </p>
      </div>
    </section>
  );
}
