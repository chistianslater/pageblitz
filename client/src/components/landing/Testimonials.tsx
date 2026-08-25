import { SectionHead } from "./primitives";

/**
 * Kundenstimmen — Struktur steht, Inhalt kommt vom Betreiber
 * (Conversion-Pass 2, „C", 2026-08-25).
 *
 * WICHTIG: Nur echte, nachweisbare Stimmen eintragen (Name, Betrieb,
 * Ort; idealerweise mit Einverständnis). Erfundene Testimonials sind
 * wettbewerbsrechtlich angreifbar (§ 5 UWG) und zerstören genau das
 * Vertrauen, das sie aufbauen sollen.
 *
 * Solange die Liste leer ist, rendert die Sektion nichts — die Seite
 * zeigt keinen leeren Platzhalter. Sobald mindestens eine echte Stimme
 * existiert, erscheint die Sektion automatisch zwischen Vertrauen und
 * FAQ. Fotos optional (Avatar mit Initialen als Fallback ist bewusst
 * nicht gebaut — lieber ohne Bild als mit Stock-Gesicht).
 */
export interface Testimonial {
  quote: string;
  name: string;
  business: string;
  place?: string;
}

const TESTIMONIALS: Testimonial[] = [
  // Beispiel-Form (bitte durch echte Stimmen ersetzen, dann löschen):
  // {
  //   quote: "…",
  //   name: "…",
  //   business: "…",
  //   place: "…",
  // },
];

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section
      aria-labelledby="lp-testimonials-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-testimonials-heading"
          kicker="Stimmen"
          title="Was Betriebe wie deiner sagen."
        />
        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(t => (
            <li key={t.name} className="border-t border-lp-line pt-5">
              <blockquote>
                <p className="text-[1.05rem] leading-[1.6]">„{t.quote}"</p>
                <footer className="mt-4 text-[0.9rem] text-lp-muted">
                  <span className="font-medium text-lp-ink">{t.name}</span>
                  {" · "}
                  {t.business}
                  {t.place ? `, ${t.place}` : ""}
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
