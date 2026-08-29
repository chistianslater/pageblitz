import { SectionHead, textLink } from "./primitives";

/**
 * „So funktioniert's": vier nummerierte Schritte in der Checklisten-Optik des
 * Studios (Hairline-Zeilen, große Nummer als typografisches Element). Der
 * GMB-Import ist Schritt 1, keine eigene Bühne. Darunter die Leistungen, die
 * immer dabei sind (ehemalige Feature-Karten, ohne Icons).
 */
const STEPS = [
  {
    title: "Firmenname eingeben – oder Google-Profil übernehmen",
    text: "Name, Adresse, Öffnungszeiten, Fotos und Bewertungen werden automatisch übernommen.",
  },
  {
    title: "Designrichtung bestimmen",
    text: "Pageblitz startet mit einer kuratierten Richtung; Farben, Schriften und Bildwirkung passt du anschließend an.",
  },
  {
    title: "Texte und Bilder prüfen",
    text: "Die Checkliste führt durch Fotos, Texte, Angebot und Rechtliches; die KI hilft beim Formulieren.",
  },
  {
    title: "Freischalten – und live",
    text: "Gefällt dir die Vorschau, schaltest du sie mit einem Klick unter deiner Domain frei.",
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
    "Eigene Domain",
    "Bestehende Domain verbinden oder .pageblitz.de-Subdomain nutzen.",
  ],
] as const;

export function HowItWorks() {
  return (
    <section
      id="ablauf"
      aria-labelledby="lp-how-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead
            id="lp-how-heading"
            kicker="So funktioniert's"
            title="Vier Schritte. Eine Checkliste. Keine Technik."
            text="Das Studio führt dich in der Reihenfolge, in der auch eine Agentur arbeiten würde – nur in Minuten statt Wochen."
            billboard
            echo
          />
        </div>

        <ol className="lg:col-span-7">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[4.75rem_1fr] gap-4 border-t border-lp-line py-7 last:border-b sm:grid-cols-[7rem_1fr] sm:gap-7 sm:py-9"
            >
              <span className="lp-num text-[clamp(2.4rem,1.6rem+1.8vw,3.6rem)]" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[40rem]">
                <h3 className="text-[1.3rem] leading-snug tracking-[-0.015em] sm:text-[1.6rem]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[1rem] leading-[1.55] text-lp-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="lp-container mt-16 lg:mt-20">
        <p className="lp-kicker mb-6">Immer dabei</p>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUDED.map(([title, text]) => (
            <div key={title} className="lp-stage-card p-7">
              <dt className="text-[1.2rem] font-medium tracking-[-0.015em]">
                {title}
              </dt>
              <dd className="mt-3 text-[0.95rem] leading-[1.55] text-lp-muted">
                {text}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[0.95rem] text-lp-muted">
          KI-Chat für deine Website-Besucher und Terminbuchung gibt es als
          Extras –{" "}
          <a href="#pricing" className={textLink}>
            zu den Preisen
          </a>
          .
        </p>
      </div>
    </section>
  );
}
