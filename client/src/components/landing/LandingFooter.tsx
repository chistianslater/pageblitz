import type { FormEvent } from "react";
import { SEO_INDUSTRY_LINKS } from "@shared/seoIndustryLinks";
import { HeroForm } from "./LandingHero";
import { Wordmark, textLink } from "./primitives";

interface FinalCtaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

/** Schluss-CTA als Volt-Bühne (Spec §4.10): der eine flächige Volt-Moment
    der Seite. Risiko-Umkehr als Schlusswort — die Vorschau kostet nichts
    und verpflichtet zu nichts. Gleiche Einstiegsfrage/Handler wie im Hero. */
export function FinalCta(props: FinalCtaProps) {
  return (
    <section aria-labelledby="lp-final-heading" className="lp-section">
      <div className="lp-container">
        <div className="relative rounded-3xl bg-lp-volt px-6 py-12 text-lp-volt-ink sm:px-10 lg:px-14 lg:py-16 xl:pr-[20rem]">
          {/* Illustrative Persona (KI-generiert, Magnific 2026-08-29) — keine
              echte Kundin, daher bewusst ohne Namen oder Zitat. */}
          <img
            src="/personas/gastgeberin.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute right-6 bottom-0 hidden h-[calc(100%+2.5rem)] w-auto select-none xl:block"
          />
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <h2 id="lp-final-heading" className="lp-h2">
                Sehen kostet nichts.
              </h2>
              <p className="mt-5 max-w-[32rem] text-[1.08rem] leading-[1.55] text-lp-volt-ink/75">
                Deine fertige Vorschau liegt in 3 Minuten vor dir — kostenlos
                und unverbindlich. Gefällt sie dir nicht, hat dich der Blick
                nichts gekostet. Gefällt sie dir, schaltest du sie mit einem
                Klick live.
              </p>
            </div>
            <div className="lg:col-span-6">
              <HeroForm {...props} idPrefix="final" size="lg" tone="volt" />
              <p className="mt-4 font-[family-name:var(--lp-mono)] text-[0.74rem] uppercase tracking-[0.02em] text-lp-volt-ink/65">
                Kostenlos ansehen · keine Kreditkarte · monatlich kündbar
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Branchen-Verlinkung: die Branchenseiten unter /website-erstellen/* sind
 * serverseitig gerenderte Routen — bewusst <a href> statt wouter-<Link>, ein
 * Client-Side-Navigate würde dort im SPA-404 landen.
 */
export function IndustryLinks() {
  return (
    <section
      id="branchen"
      aria-labelledby="lp-industries-heading"
      className="border-t border-lp-line py-12 [scroll-margin-top:4.5rem]"
    >
      <div className="lp-container">
        <h2 id="lp-industries-heading" className="lp-kicker mb-5 !font-medium">
          Website erstellen – nach Branche
        </h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
          {SEO_INDUSTRY_LINKS.map(industry => (
            <li key={industry.slug}>
              <a
                href={`/website-erstellen/${industry.slug}`}
                className="text-[0.9rem] text-lp-muted transition-colors hover:text-lp-ink"
              >
                Website für {industry.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-lp-line py-12">
      <div className="lp-container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark markClassName="text-lp-volt" />
          <p className="mt-5 text-[1.15rem] tracking-[-0.015em] text-lp-ink">
            Fragen?{" "}
            <a href="mailto:hallo@pageblitz.de" className={textLink}>
              Schreib uns →
            </a>
          </p>
          <p className="mt-3 text-[0.85rem] text-lp-muted">
            © {new Date().getFullYear()} Pageblitz. Alle Rechte vorbehalten.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem]">
          <li>
            <a
              href="/impressum"
              className="text-lp-muted transition-colors hover:text-lp-ink"
            >
              Impressum
            </a>
          </li>
          <li>
            <a
              href="/datenschutz"
              className="text-lp-muted transition-colors hover:text-lp-ink"
            >
              Datenschutz
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new Event("pageblitz:open-cookie-settings")
                )
              }
              className="text-lp-muted transition-colors hover:text-lp-ink"
            >
              Cookie-Einstellungen
            </button>
          </li>
        </ul>
      </div>
    </footer>
  );
}
