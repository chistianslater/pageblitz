import React, { type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { HeroBuildLive } from "./HeroBuildLive";
import { pillPrimary } from "./primitives";

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
    <form
      onSubmit={onSubmit}
      className={`flex w-full max-w-[32rem] flex-col gap-2.5 ${
        layout === "inline" ? "sm:flex-row" : ""
      }`}
    >
      <label htmlFor={inputId} className="sr-only">
        Wie heißt dein Betrieb?
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Wie heißt dein Betrieb?"
        autoComplete="organization"
        className={`${h} w-full min-w-0 rounded-xl border border-lp-line bg-[rgba(255,255,255,0.05)] px-5 text-[1rem] text-lp-ink placeholder:text-lp-faint focus-visible:border-lp-volt focus-visible:outline-2`}
      />
      <button
        type="submit"
        className={`${pillPrimary} ${h} shrink-0 px-6 ${
          layout === "stacked" ? "w-full" : ""
        } ${size === "lg" ? "text-[1rem]" : ""}`}
      >
        Meine Website ansehen
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

/**
 * Einwandbehandlung direkt am CTA (Mono-Chrome): Kosten, Kreditkarte,
 * Bindung — beantwortet, bevor die Frage entsteht.
 */
export function RiskLine({ className = "" }: { className?: string }) {
  return (
    <p
      className={`font-[family-name:var(--lp-mono)] text-[0.74rem] uppercase tracking-[0.02em] text-lp-faint ${className}`}
    >
      <span className="text-lp-volt">Kostenlos ansehen</span> · keine
      Kreditkarte · monatlich kündbar
    </p>
  );
}

const TRUST = ["7 Tage gratis", "Monatlich kündbar", "Keine Kreditkarte"];

/** Punkt-Aufzählung für den Schluss-CTA (FinalCta im LandingFooter). */
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

/**
 * Hero „Nachtschicht" (Spec §4.2): links Klartext-Versprechen + Namensfeld,
 * rechts die HeroBuildLive-Bühne auf einer Panel-Fläche, die rechts aus dem
 * Viewport läuft. Kein Kicker — der Agentur-Anker sitzt im Beweis-Streifen
 * direkt darunter.
 */
export function LandingHero(props: Omit<HeroFormProps, "idPrefix" | "size">) {
  return (
    <section
      aria-labelledby="lp-hero-heading"
      className="lp-hero-glow relative overflow-hidden"
    >
      <div className="lp-container">
        <div className="grid items-center gap-10 pt-10 pb-14 lg:grid-cols-12 lg:gap-12 lg:pt-16 lg:pb-20">
          <div className="lg:col-span-5">
            <h1
              id="lp-hero-heading"
              className="lp-rise lp-rise-1 lp-h1 lp-h1--hero"
            >
              Die fertige Website für deinen Betrieb —{" "}
              <em className="not-italic text-lp-volt">in 3&nbsp;Minuten.</em>
            </h1>
            <p className="lp-rise lp-rise-2 mt-6 max-w-[30rem] text-[1.12rem] leading-[1.55] text-lp-muted">
              Tipp deinen Firmennamen ein. Pageblitz holt Fotos, Bewertungen
              und Öffnungszeiten aus deinem Google-Profil und baut daraus eine
              echte Website.{" "}
              <strong className="font-semibold text-lp-ink">
                Du siehst das Ergebnis, bevor du irgendetwas bezahlst.
              </strong>
            </p>
            <div className="lp-rise lp-rise-3 mt-8">
              <HeroForm {...props} idPrefix="hero" size="lg" layout="stacked" />
            </div>
            <RiskLine className="lp-rise lp-rise-4 mt-4" />
          </div>
          <div className="lp-rise lp-rise-5 lg:col-span-7">
            <div className="lp-hero-stage">
              <HeroBuildLive />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
