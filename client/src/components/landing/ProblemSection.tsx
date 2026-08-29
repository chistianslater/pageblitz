import React from "react";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Kicker, pillPrimary, startHref } from "./primitives";

/**
 * Problem-Sektion (Verlustaversion, Spec §4.4): drei konkrete
 * Verlust-Szenarien — bewusst ohne erfundene Statistiken —, dann der
 * frühere Manifesto-Kernsatz als große Schlusszeile und der Ausweg per CTA.
 * ManifestoBand ist damit aufgelöst (Nachtschicht-Relaunch 2026-08-29).
 */
const LOSSES = [
  {
    title: "Kunden suchen — und finden dich nicht",
    text: "Lokale Betriebe werden zuerst bei Google gesucht. Ein Eintrag ohne Website wirkt nicht verbindlich.",
  },
  {
    title: "Deine Bewertungen arbeiten nicht für dich",
    text: "Gute Rezensionen überzeugen nur, wenn man sie sieht — auf deiner Website statt im Google-Kleingedruckten.",
  },
  {
    title: "Der Mitbewerber mit Website bekommt den Auftrag",
    text: "Bei gleicher Leistung gewinnt, wer professioneller aussieht — rund um die Uhr.",
  },
] as const;

export function ProblemSection({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  return (
    <section
      aria-labelledby="lp-problem-heading"
      className="lp-section lp-glowspot lp-glowspot--left"
    >
      <div className="lp-container">
        <Kicker className="mb-4">Ohne Website</Kicker>
        <h2 id="lp-problem-heading" className="lp-h2 max-w-[24ch]">
          Jeden Tag suchen Kunden — und wählen einen anderen.
        </h2>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {LOSSES.map(loss => (
            <li
              key={loss.title}
              className="rounded-2xl border border-lp-line p-6"
            >
              <h3 className="text-[1.15rem] font-bold leading-[1.2] tracking-[-0.015em] text-lp-ink">
                {loss.title}
              </h3>
              <p className="mt-2.5 text-[0.95rem] leading-[1.55] text-lp-muted">
                {loss.text}
              </p>
            </li>
          ))}
        </ul>

        {/* Schlusszeile + Persona als EIN Moment: Der stolze Handwerker
            bezieht sich direkt auf „Nicht weil deine Arbeit schlechter
            ist" — seine Arbeit ist gut, man sieht sie nur nicht.
            (KI-Persona, Magnific 2026-08-29, bewusst ohne Namen.) */}
        <div className="mt-14 grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="lp-h2 max-w-[38rem]">
              Nicht weil deine Arbeit schlechter ist. Sondern weil man sie{" "}
              <em className="not-italic text-lp-volt">online nicht sieht.</em>
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
          <div className="hidden lg:col-span-4 lg:flex lg:justify-end">
            <div className="pointer-events-none relative -mb-[var(--lp-section)] select-none">
              <img
                src="/personas/handwerker-laptop.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-[30rem] w-auto"
              />
              {/* Schwebendes Suchergebnis am Laptop: DIE Botschaft der
                  Sektion in einem Blick. */}
              <div
                aria-hidden="true"
                className="lp-float absolute top-[34%] -left-24 -rotate-3 rounded-xl border border-lp-line bg-lp-panel px-4 py-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,.8)]"
              >
                <p className="font-[family-name:var(--lp-mono)] text-[0.66rem] tracking-[0.03em] text-lp-faint">
                  google.de · „schreinerei in deiner nähe"
                </p>
                <p className="mt-1 text-[0.9rem] font-bold text-lp-ink">
                  Keine Website gefunden
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
