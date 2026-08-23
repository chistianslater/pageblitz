import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { StudioFrame } from "./StudioFrame";
import { Kicker, PRICE_YEARLY, pillPrimary } from "./primitives";

export interface HeroFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  /** Eindeutige id-Basis, weil das Formular zweimal auf der Seite steht. */
  idPrefix: string;
  /** Größere Variante für den Hero, kompaktere für den Schluss-CTA. */
  size?: "lg" | "md";
}

/**
 * Einstieg direkt im Hero: Firmenname eintippen → /start?name=… (überspringt
 * den Auswahl-Screen auf /start). Leeres Feld ist erlaubt und führt auf den
 * normalen Weg. Logik (`handleHeroStart`) lebt in LandingPage.tsx.
 */
export function HeroForm({
  value,
  onChange,
  onSubmit,
  idPrefix,
  size = "lg",
}: HeroFormProps) {
  const inputId = `${idPrefix}-business-name`;
  const h = size === "lg" ? "h-14" : "h-12";
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-[36rem] flex-col gap-3 sm:flex-row"
    >
      <label htmlFor={inputId} className="sr-only">
        Unternehmensname
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Wie heißt dein Unternehmen?"
        autoComplete="organization"
        className={`${h} w-full min-w-0 shrink-0 sm:w-auto sm:flex-1 rounded-full border border-lp-line bg-white px-4 sm:px-5 text-[1rem] text-lp-ink placeholder:text-lp-muted focus-visible:border-lp-accent focus-visible:outline-2`}
      />
      <button
        type="submit"
        className={`${pillPrimary} ${h} shrink-0 px-7 ${size === "lg" ? "text-[1rem]" : ""}`}
      >
        Website erstellen
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

const TRUST = [
  "7 Tage gratis",
  `Danach ab ${PRICE_YEARLY}/Monat`,
  "Monatlich kündbar",
];

export function TrustLine({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem] text-lp-muted ${className}`}
    >
      {TRUST.map(item => (
        <li key={item} className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-lp-accent"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LandingHero(props: Omit<HeroFormProps, "idPrefix" | "size">) {
  return (
    <section
      aria-labelledby="lp-hero-heading"
      className="lp-container grid items-center gap-12 pt-10 pb-16 lg:min-h-[calc(100svh-4.25rem)] lg:grid-cols-12 lg:gap-10 lg:pt-4 lg:pb-20"
    >
      <div className="lg:col-span-6">
        <Kicker className="mb-6">
          Webagentur kostet 3.000 €+ · Pageblitz ab {PRICE_YEARLY}/Monat
        </Kicker>
        <h1 id="lp-hero-heading" className="lp-h1 lp-h1--hero">
          Deine professionelle Website in 3&nbsp;Minuten.
        </h1>
        <p className="mt-6 max-w-[30rem] text-[1.1rem] leading-[1.6] text-lp-muted">
          Kein Webdesigner, kein monatelanges Warten, kein vierstelliges Budget.
          Pageblitz erstellt deine Website automatisch – du musst nur dein
          Unternehmen beschreiben.
        </p>
        <div className="mt-8">
          <HeroForm {...props} idPrefix="hero" size="lg" />
        </div>
        <TrustLine className="mt-8 border-t border-lp-line pt-5" />
      </div>
      <div className="lg:col-span-6">
        <StudioFrame />
      </div>
    </section>
  );
}
