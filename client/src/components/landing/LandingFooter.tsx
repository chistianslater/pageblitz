import type { FormEvent } from "react";
import { SEO_INDUSTRY_LINKS } from "@shared/seoIndustryLinks";
import { HeroForm, TrustLine } from "./LandingHero";
import { Wordmark } from "./primitives";

interface FinalCtaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

/** Schluss: dieselbe Einstiegsfrage wie im Hero, gleicher Handler. Seit
    2026-08-25 als dunkler Kontrast-Block (lp-final-dark, siehe index.css). */
export function FinalCta(props: FinalCtaProps) {
  return (
    <section
      aria-labelledby="lp-final-heading"
      className="lp-section lp-final-dark"
    >
      <div className="lp-container grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <p className="lp-kicker mb-4">Jetzt loslegen</p>
          <h2 id="lp-final-heading" className="lp-h1">
            Erst sehen. Dann entscheiden.
          </h2>
          {/* Risiko-Umkehr als Schlusswort (Conversion-Pass 2026-08-25):
              Der letzte Zweifel vor dem Absprung ist das Ergebnis-Risiko —
              die Antwort: die Vorschau kostet nichts und verpflichtet zu
              nichts. */}
          <p className="mt-6 max-w-[32rem] text-[1.1rem] leading-[1.6] text-lp-muted">
            Deine fertige Website liegt in 3 Minuten vor dir — kostenlos und
            unverbindlich. Gefällt sie dir nicht, hat dich der Blick nichts
            gekostet. Gefällt sie dir, ist sie mit einem Klick live.
          </p>
        </div>
        <div className="lg:col-span-6">
          <HeroForm {...props} idPrefix="final" size="lg" />
          <TrustLine className="mt-6" />
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
    <footer className="border-t border-lp-line py-10">
      <div className="lp-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Wordmark />
        <p className="text-[0.85rem] text-lp-muted">
          © {new Date().getFullYear()} Pageblitz. Alle Rechte vorbehalten.
        </p>
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
