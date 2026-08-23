import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { SectionHead, pillPrimary, startHref, textLink } from "./primitives";

/**
 * „So funktioniert's": vier nummerierte Schritte in der Checklisten-Optik des
 * Studios (Hairline-Zeilen, große Nummer als typografisches Element). Der
 * GMB-Import ist Schritt 1, keine eigene Bühne. Darunter die Leistungen, die
 * immer dabei sind (ehemalige Feature-Karten, ohne Icons).
 */
const STEPS = [
  {
    title: "Firmenname eingeben – oder Google-Profil übernehmen",
    text: "Du hast ein Google-Unternehmensprofil? Name, Adresse, Öffnungszeiten, Fotos und Bewertungen werden automatisch übernommen. Kein Abtippen, kein Aufwand.",
  },
  {
    title: "Stil wählen",
    text: "Aus 14 Stilwelten schlägt Pageblitz passende vor. Du wählst den Look, der zu dir passt – Typografie, Farben und Layout sind fertig abgestimmt, deine Inhalte bleiben gleich.",
  },
  {
    title: "Texte und Bilder prüfen",
    text: "Die Checkliste führt dich durch Fotos, Texte, Angebot, Rechtliches und Extras. Die KI schreibt die Texte passend zu deiner Branche – du änderst, was dir nicht gefällt.",
  },
  {
    title: "Freischalten – und live",
    text: "Mit einem Klick ist deine Website online: unter deiner Domain oder einer kostenlosen .pageblitz.de-Adresse. Hosting und SSL sind dabei.",
  },
] as const;

const INCLUDED = [
  [
    "Sofort fertige Texte",
    "Leistungen, Über uns und Seitentitel – passend zur Branche.",
  ],
  [
    "Auf jedem Handy gut",
    "Die Website passt sich automatisch an – ohne dein Zutun.",
  ],
  [
    "Bei Google gefunden",
    "SEO-Grundlagen, strukturierte Daten und schnelle Ladezeiten.",
  ],
  [
    "Kein Anwalt nötig",
    "Impressum, Datenschutz und Cookie-Banner werden erzeugt.",
  ],
  [
    "Eigene Domain",
    "Bestehende Domain verbinden oder .pageblitz.de-Subdomain nutzen.",
  ],
  [
    "Änderungen per Chat",
    "Texte, Farben und Bilder jederzeit anpassen – ohne Technik.",
  ],
] as const;

export function HowItWorks({ billingYearly }: { billingYearly: boolean }) {
  const [, navigate] = useLocation();
  return (
    <section
      id="ablauf"
      aria-labelledby="lp-how-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHead
            id="lp-how-heading"
            kicker="So funktioniert's"
            title="Vier Schritte. Eine Checkliste. Keine Technik."
            text="Das Studio führt dich in der Reihenfolge, in der auch eine Agentur arbeiten würde – nur in Minuten statt Wochen."
          />
          <div className="mt-8 flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={pillPrimary}
            >
              Jetzt GMB-Daten importieren
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-[0.85rem] text-lp-muted">
              7 Tage gratis testen · jederzeit kündbar
            </p>
          </div>
        </div>

        <ol className="lg:col-span-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-lp-line py-6 last:border-b sm:grid-cols-[5.5rem_1fr] sm:gap-6 sm:py-8"
            >
              <span className="lp-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[40rem]">
                <h3 className="text-[1.25rem] leading-snug tracking-[-0.01em] sm:text-[1.5rem]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[1rem] leading-[1.6] text-lp-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="lp-container mt-16 lg:mt-20">
        <p className="lp-kicker mb-5">Immer dabei</p>
        <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map(([title, text]) => (
            <div key={title} className="border-t border-lp-line py-4 sm:py-5">
              <dt className="font-medium">{title}</dt>
              <dd className="mt-1 text-[0.9rem] leading-[1.55] text-lp-muted">
                {text}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[0.95rem] text-lp-muted">
          KI-Chat und Terminbuchung gibt es als Extras –{" "}
          <a href="#pricing" className={textLink}>
            zu den Preisen
          </a>
          .
        </p>
      </div>
    </section>
  );
}
