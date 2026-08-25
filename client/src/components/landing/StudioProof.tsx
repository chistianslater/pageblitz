import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { SectionHead, pillPrimary, startHref } from "./primitives";

/**
 * „Beweis statt Behauptung" (Conversion-Pass 2, Referenz snaplove.de,
 * User-Entscheid 2026-08-25): Echte Studio-Screenshots statt Stimmungs-
 * bildern — der Besucher sieht das tatsächliche Werkzeug, nicht eine
 * Illustration davon.
 *
 * Quellen: die Visual-Test-Baselines (tests/visual/studio.spec.ts-
 * snapshots/, fiktiver Beispielbetrieb „Schreinerei Brandt"), als WebP
 * nach client/public/studio-shots/ konvertiert. Pflege-Hinweis: Bei
 * größeren Studio-UI-Änderungen die Shots neu aus den Baselines erzeugen
 * (sharp, Breite 1200, q82).
 */
const CARDS = [
  {
    src: "/studio-shots/stil.webp",
    alt: "Stil-Auswahl im Pageblitz Studio: drei Style-Pack-Vorschläge mit Live-Vorschau",
    title: "Stil wählen mit echten Inhalten",
    text: "Drei Vorschläge pro Runde — jeder Look sofort mit deinen Texten und Fotos, nicht mit Platzhaltern.",
  },
  {
    src: "/studio-shots/fotos.webp",
    alt: "Fotos-Panel im Pageblitz Studio: Auswahl aus Google-Fotos, Stockbildern und Uploads",
    title: "Fotos ohne Upload-Stress",
    text: "Google-Fotos, Stockbilder oder eigene Aufnahmen — jede Auswahl erscheint sofort auf deiner Seite.",
  },
] as const;

export function StudioProof({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  return (
    <section
      aria-labelledby="lp-studio-proof-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-studio-proof-heading"
          kicker="Dein Studio"
          title="Gezeigt, nicht versprochen: So sieht dein Studio aus."
          text="Keine Illustration, kein Marketing-Mock — das ist die echte Oberfläche, in der du arbeitest."
        />

        {/* Große Bühne: die Übersicht (Checkliste + Live-Vorschau). */}
        <figure className="mt-12">
          <div className="overflow-hidden rounded-[12px] border border-lp-line bg-white shadow-[0_24px_48px_-28px_rgba(29,26,23,0.35)]">
            <img
              src="/studio-shots/uebersicht.webp"
              alt="Pageblitz Studio im Überblick: links die Checkliste mit den Schritten, rechts die Live-Vorschau der Website"
              width={1200}
              height={1161}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 max-w-[44rem] border-t border-lp-line pt-3">
            <span className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Alles auf einen Blick
            </span>
            <p className="mt-1 text-[0.95rem] leading-[1.6] text-lp-muted">
              Links die Checkliste, die dir sagt, was als Nächstes dran ist.
              Rechts deine Website, live. Jede Änderung siehst du sofort.
            </p>
          </figcaption>
        </figure>

        {/* Zwei Detail-Karten (hochformatige Panel-Ausschnitte). */}
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2">
          {CARDS.map(card => (
            <figure key={card.src}>
              <div className="overflow-hidden rounded-[10px] border border-lp-line bg-white">
                <img
                  src={card.src}
                  alt={card.alt}
                  width={420}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              </div>
              <figcaption className="mt-4 border-t border-lp-line pt-3">
                <span className="text-[1.05rem] font-medium tracking-[-0.01em]">
                  {card.title}
                </span>
                <p className="mt-1 text-[0.95rem] leading-[1.6] text-lp-muted">
                  {card.text}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(startHref(billingYearly))}
            className={pillPrimary}
          >
            Selbst ausprobieren — kostenlos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-[0.85rem] text-lp-muted">
            Dein Studio sieht dann so aus — mit deinem Unternehmen darin.
          </span>
        </div>
      </div>
    </section>
  );
}
