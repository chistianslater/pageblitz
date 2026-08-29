import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { HeroBuildLive } from "./HeroBuildLive";
import { Kicker, PRICE_YEARLY, pillPrimary } from "./primitives";

export interface HeroFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  /** Eindeutige id-Basis, weil das Formular zweimal auf der Seite steht. */
  idPrefix: string;
  /** Größere Variante für den Hero, kompaktere für den Schluss-CTA. */
  size?: "lg" | "md";
  /** Hero braucht in der schmalen 5/12-Spalte einen klaren Stack. */
  layout?: "inline" | "stacked";
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
  layout = "inline",
}: HeroFormProps) {
  const inputId = `${idPrefix}-business-name`;
  const h = size === "lg" ? "h-14" : "h-12";
  return (
    <div className="w-full max-w-[36rem]">
      <form
        onSubmit={onSubmit}
        className={`flex w-full flex-col gap-3 ${
          layout === "inline" ? "sm:flex-row" : ""
        }`}
      >
        <div
          className={
            layout === "inline"
              ? "min-w-0 flex-1"
              : "flex w-full flex-col gap-2"
          }
        >
          <label
            htmlFor={inputId}
            className={
              layout === "stacked"
                ? "text-[0.88rem] font-medium text-lp-ink"
                : "sr-only"
            }
          >
            Wie heißt dein Unternehmen?
          </label>
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder={
              layout === "stacked"
                ? "z. B. Schreinerei Brandt"
                : "Wie heißt dein Unternehmen?"
            }
            autoComplete="organization"
            className={`${h} w-full min-w-0 rounded-full border border-lp-line bg-white px-4 text-[1rem] text-lp-ink placeholder:text-lp-muted focus-visible:border-lp-accent focus-visible:outline-2 sm:px-5`}
          />
        </div>
        <button
          type="submit"
          className={`${pillPrimary} ${h} shrink-0 px-7 ${
            layout === "stacked" ? "w-full" : ""
          } ${size === "lg" ? "text-[1rem]" : ""}`}
        >
        Website kostenlos erstellen
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
      {/* Reibungsabbau direkt am CTA (Conversion-Pass 2026-08-25): Die drei
          häufigsten Einwände — Kosten, Kreditkarte, Ergebnis-Risiko —
          werden beantwortet, bevor sie entstehen. */}
      <p className="mt-3 text-[0.85rem] text-lp-muted">
        Starte mit deinem Firmennamen. Die Vorschau ist kostenlos und braucht
        keine Kreditkarte.
      </p>
    </div>
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
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--lp-volt)]"
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
      className="lp-container pt-8 pb-16 lg:pt-10 lg:pb-24"
    >
      <Kicker className="lp-rise lp-rise-1 mb-6">
        Webagentur: 2.000–8.000 € · Pageblitz ab {PRICE_YEARLY}/Monat
      </Kicker>
      <h1 id="lp-hero-heading" className="lp-h1 lp-h1--hero lp-rise lp-rise-2">
        Deine Website
        <br />
        in 3&nbsp;Minuten.
      </h1>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="lp-rise lp-rise-3 max-w-[32rem] text-[1.12rem] leading-[1.5] text-lp-muted">
            Deine Kunden suchen dich bei Google. Pageblitz baut aus deinem
            Google-Profil automatisch eine fertige Vorschau — ohne Webdesigner,
            Wartezeit oder vierstelliges Budget.
          </p>
          <div className="lp-rise lp-rise-4 mt-8">
            <HeroForm
              {...props}
              idPrefix="hero"
              size="lg"
              layout="stacked"
            />
          </div>
          <TrustLine className="lp-rise lp-rise-5 mt-8" />
        </div>
        <div className="lg:col-span-7 lp-rise lp-rise-6">
          <HeroBuildLive />
        </div>
      </div>
    </section>
  );
}
