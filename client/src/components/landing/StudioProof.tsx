import { SectionHead } from "./primitives";

/**
 * „Dein Studio" als Strukturzeichnungen (2026-08-25, User-Feedback:
 * Beispiel-Screenshots waren unscharf + zeigten wieder dasselbe Pack wie
 * der Hero). Statt Rasterbildern zeichnen drei CSS-Schemata das PRINZIP:
 * Übersicht (Checkliste + Live-Vorschau), Designrichtung (drei Kandidaten,
 * einer aktiv), Fotos wählen (Grid mit Auswahl). Vorteile: immer scharf,
 * kein Pack-Bezug, altert nicht mit UI-Änderungen.
 *
 * Gleichförmiges 3er-Grid (gleiche Kartenhöhe) — das Vorgänger-Layout
 * (große Bühne + zwei Hochformat-Karten) wirkte unaufgeräumt.
 */
function DiagramOverview() {
  return (
    <div className="lps-sketch" role="img" aria-label="Schema des Studios: links eine Checkliste, rechts die Website-Vorschau">
      <div className="lps-studio">
        <div className="lps-rail">
          <span className="lps-rail-title" />
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className="lps-check" data-done={i <= 2 || undefined}>
              <i />
            </span>
          ))}
        </div>
        <div className="lps-stage">
          <span className="lps-toolbar" />
          <span className="lps-view">
            <i className="lps-v-h" />
            <i className="lps-v-p" />
            <i className="lps-v-p short" />
          </span>
        </div>
      </div>
    </div>
  );
}

function DiagramStyle() {
  return (
    <div
      className="lps-sketch"
      role="img"
      aria-label="Schema der Designrichtungs-Auswahl: drei Karten, die mittlere ist ausgewählt"
    >
      <div className="lps-styles">
        {[0, 1, 2].map(i => (
          <div key={i} className="lps-style-card" data-active={i === 1 || undefined}>
            <span className="lps-style-thumb" />
            <span className="lps-style-line" />
            <span className="lps-style-pill" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DiagramPhotos() {
  return (
    <div className="lps-sketch" role="img" aria-label="Schema der Foto-Auswahl: Raster mit neun Fotos, zwei sind ausgewählt">
      <div className="lps-grid">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="lps-photo" data-picked={i === 1 || i === 5 || undefined} />
        ))}
      </div>
    </div>
  );
}

const CARDS = [
  {
    Diagram: DiagramOverview,
    title: "Alles auf einen Blick",
    text: "Links die Checkliste, rechts deine Website — live. Du siehst immer, was als Nächstes dran ist.",
  },
  {
    Diagram: DiagramStyle,
    title: "Designrichtung mit eigenen Inhalten",
    text: "Drei Vorschläge pro Runde — jeder Look sofort mit deinen Texten und Fotos, nicht mit Platzhaltern.",
  },
  {
    Diagram: DiagramPhotos,
    title: "Fotos ohne Upload-Stress",
    text: "Google-Fotos, Stockbilder oder eigene Aufnahmen — jede Auswahl erscheint sofort auf deiner Seite.",
  },
] as const;

export function StudioProof() {
  return (
    <section
      aria-labelledby="lp-studio-proof-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-studio-proof-heading"
          kicker="Dein Studio"
          title="So arbeitest du. Gezeigt, nicht versprochen."
          text="Drei Prinzipien deines Studios — als Struktur gezeichnet, damit klar ist, wie es sich anfühlt."
          billboard
          echo
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(card => (
            <figure key={card.title} className="lp-stage-card flex flex-col p-6">
              <card.Diagram />
              <figcaption className="mt-5">
                <span className="text-[1.25rem] font-medium tracking-[-0.02em]">
                  {card.title}
                </span>
                <p className="mt-2 text-[0.95rem] leading-[1.55] text-lp-muted">
                  {card.text}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-8 max-w-[42rem] border-t border-lp-line pt-4 text-[0.9rem] text-lp-muted">
          Keine versteckten Menüs, kein leeres Dashboard: Du siehst immer den
          nächsten Schritt und daneben sofort das Ergebnis.
        </p>
      </div>
    </section>
  );
}
