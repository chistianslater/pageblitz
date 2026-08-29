import React from "react";
import { PRICE_YEARLY } from "./primitives";

/**
 * Beweis-Streifen direkt unter dem Hero (Spec §4.3): Preis- und Zeitanker
 * gegen die Agentur (durchgestrichen) plus Risikoumkehr — beantwortet die
 * drei größten Einwände, bevor Skepsis entsteht. Ersetzt die alte
 * Zähler-ProofBar (Counter/easeOutCubic, Conversion-Pass 2026-08-25).
 */

interface Anchor {
  kicker: string;
  /** Durchgestrichener Alt-Wert + Screenreader-Langform. */
  strike?: { text: string; label: string };
  value: string;
  text: string;
}

const ANCHORS: Anchor[] = [
  {
    kicker: "Statt Agentur",
    strike: { text: "2.000–8.000 €", label: "statt 2.000 bis 8.000 Euro" },
    value: `${PRICE_YEARLY}/Monat`,
    text: "Keine Einrichtungskosten, kein Projekthonorar, monatlich kündbar.",
  },
  {
    kicker: "Statt Wartezeit",
    strike: { text: "4–12 Wochen", label: "statt 4 bis 12 Wochen" },
    value: "3 Minuten",
    text: "Von der Eingabe deines Firmennamens bis zur fertigen Vorschau.",
  },
  {
    kicker: "Dein Risiko",
    value: "0 €",
    text: "Erst sehen, dann entscheiden. Gefällt dir die Website nicht, zahlst du nichts.",
  },
];

export function ProofBar() {
  return (
    <section aria-label="Pageblitz im Vergleich zur Webagentur">
      <div className="lp-container">
        <div className="grid border-y border-lp-line md:grid-cols-3">
          {ANCHORS.map((anchor, i) => (
            <div
              key={anchor.kicker}
              className={`px-1 py-6 md:px-8 md:py-7 ${
                i > 0 ? "border-t border-lp-line md:border-t-0 md:border-l" : ""
              }`}
            >
              <p className="lp-kicker">{anchor.kicker}</p>
              <p className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-lp-ink">
                {anchor.strike ? (
                  <s
                    aria-label={anchor.strike.label}
                    className="mr-2 font-medium text-lp-faint"
                  >
                    {anchor.strike.text}
                  </s>
                ) : null}
                {anchor.value}
              </p>
              <p className="mt-1.5 text-[0.9rem] leading-[1.45] text-lp-muted">
                {anchor.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
