import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Kicker, pillPrimary, startHref } from "./primitives";

/**
 * Problem-Aktivierung (Conversion-Pass 2026-08-25): Die Seite startete
 * bisher sofort mit der Lösung — ohne den Schmerz ist das Angebot
 * beliebig. Drei konkrete Verlust-Szenarien, bewusst ohne erfundene
 * Statistiken (unangreifbare Formulierungen), dann direkt der Ausweg
 * per CTA.
 *
 * Layout-Revision 2026-08-26: breite Headline + drei eigenständige Karten
 * statt 4/8-Kopf + nummerierter Liste. Diese Formel gehört bereits dem
 * folgenden Ablauf und ließ beide Sektionen wie Duplikate aussehen.
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
      className="lp-section border-y border-lp-line"
    >
      <div className="lp-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <Kicker className="mb-4">Ohne Website</Kicker>
            <h2 id="lp-problem-heading" className="lp-h2 max-w-[46rem]">
              Jeden Tag suchen Kunden — und wählen einen anderen.
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-[30rem] text-[1.05rem] leading-[1.6] text-lp-muted">
              Nicht weil deine Arbeit schlechter ist. Sondern weil neue Kunden
              sie online nicht sehen.
            </p>
            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={`${pillPrimary} mt-6`}
            >
              Website kostenlos erstellen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {LOSSES.map((loss, index) => (
            <li
              key={loss.title}
              className="flex min-h-[15rem] flex-col rounded-[32px] bg-lp-surface p-7"
            >
              <span
                className="lp-num text-[2.75rem] text-lp-ink/15"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-auto pt-8 text-[1.2rem] leading-snug tracking-[-0.01em]">
                {loss.title}
              </h3>
              <p className="mt-3 text-[0.92rem] leading-[1.6] text-lp-muted">
                {loss.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
