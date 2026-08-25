import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { SectionHead, pillPrimary, startHref } from "./primitives";

/**
 * Problem-Aktivierung (Conversion-Pass 2026-08-25): Die Seite startete
 * bisher sofort mit der Lösung — ohne den Schmerz ist das Angebot
 * beliebig. Drei konkrete Verlust-Szenarien, bewusst ohne erfundene
 * Statistiken (unangreifbare Formulierungen), dann direkt der Ausweg
 * per CTA. Liegt zwischen Hero/Proof und den Branchen-Kacheln.
 */
const LOSSES = [
  {
    title: "Kunden suchen — und finden dich nicht",
    text: "Die allermeisten Verbraucher suchen lokale Betriebe zuerst bei Google. Wer dort nur einen Eintrag ohne Website hat, wirkt nicht verbindlich.",
  },
  {
    title: "Deine Bewertungen arbeiten nicht für dich",
    text: "Gute Google-Rezensionen überzeugen nur, wenn man sie sieht. Auf einer eigenen Website sind sie prominent platziert — statt unterzugehen.",
  },
  {
    title: "Der Mitbewerber mit Website bekommt den Auftrag",
    text: "Bei gleicher Leistung gewinnt, wer professioneller aussieht. Eine eigene Website ist heute das Schaufenster — rund um die Uhr.",
  },
] as const;

export function ProblemSection({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  return (
    <section
      aria-labelledby="lp-problem-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHead
            id="lp-problem-heading"
            kicker="Ohne Website"
            title="Jeden Tag suchen Kunden — und wählen einen anderen."
            text="Nicht weil die Arbeit schlechter ist. Sondern weil sie dich online nicht finden."
          />
          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={pillPrimary}
            >
              Website kostenlos erstellen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <ol className="lg:col-span-8">
          {LOSSES.map((loss, index) => (
            <li
              key={loss.title}
              className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-lp-line py-6 last:border-b sm:grid-cols-[3.5rem_1fr] sm:gap-6"
            >
              <span className="lp-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[40rem]">
                <h3 className="text-[1.2rem] leading-snug tracking-[-0.01em] sm:text-[1.35rem]">
                  {loss.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-[1.6] text-lp-muted">
                  {loss.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
