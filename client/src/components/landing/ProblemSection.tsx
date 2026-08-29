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
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-8">
            <Kicker className="mb-5">Ohne Website</Kicker>
            <h2
              id="lp-problem-heading"
              className="lp-h2 lp-h2--billboard max-w-[18ch]"
            >
              <span className="block">
                Jeden Tag suchen Kunden — und wählen einen anderen.
              </span>
              <span className="lp-echo" aria-hidden="true">
                Jeden Tag suchen Kunden — und wählen einen anderen.
              </span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="max-w-[30rem] text-[1.12rem] leading-[1.5] text-lp-muted">
              Nicht weil deine Arbeit schlechter ist. Sondern weil neue Kunden
              sie online nicht sehen.
            </p>
            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={`${pillPrimary} mt-8`}
            >
              Website kostenlos erstellen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ol className="mt-16 grid gap-5 md:grid-cols-3">
          {LOSSES.map((loss, index) => (
            <li
              key={loss.title}
              className="lp-stage-card flex min-h-[18rem] flex-col p-8"
            >
              <span className="lp-num text-[3.25rem]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-auto pt-10 text-[1.35rem] leading-[1.15] tracking-[-0.02em]">
                {loss.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-[1.55] text-lp-muted">
                {loss.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
