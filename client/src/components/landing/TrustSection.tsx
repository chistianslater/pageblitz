import { Scale, Lock, FileCheck, RefreshCcw } from "lucide-react";
import { SectionHead } from "./primitives";

/**
 * Vertrauens-Sektion (Conversion-Pass 2, Referenz-Analyse snaplove.de
 * 2026-08-25): Dort funktioniert „In sicheren Händen" als eigene Bühne
 * sehr gut — Pageblitz hatte dieselben Fakten (Rechtssicherheit, SSL,
 * Kündbarkeit) nur als Kleinpunkt in einer Feature-Liste. Für die
 * skeptische Zielgruppe (lokale Betriebe, keine Technik) gehört das
 * sichtbar vor die FAQ.
 *
 * Bewusst nur belegbare Produktfakten — keine Standort-Behauptungen oder
 * Zertifikate, die das Produkt nicht hergibt.
 */
const TRUST_ITEMS = [
  {
    icon: Scale,
    title: "Rechtssicher ohne Anwalt",
    text: "Impressum, Datenschutzerklärung und Cookie-Banner werden aus deinen Angaben automatisch erzeugt — kein Extra, keine Anwaltskosten.",
  },
  {
    icon: Lock,
    title: "SSL & Hosting immer dabei",
    text: "Verschlüsselte Verbindung, schnelles Cloud-Hosting und deine Domain — eingerichtet ohne dein Zutun.",
  },
  {
    icon: FileCheck,
    title: "Deine Inhalte gehören dir",
    text: "Texte, Fotos und Daten stammen von dir — und bleiben deins. Änderungen machst du jederzeit im Studio, auf Wunsch mit KI-Unterstützung.",
  },
  {
    icon: RefreshCcw,
    title: "Monatlich kündbar",
    text: "Keine Mindestlaufzeit, keine Kündigungsgebühr, kein Kleingedrucktes. Wenn Pageblitz nichts für dich ist, gehst du einfach.",
  },
] as const;

export function TrustSection() {
  return (
    <section
      aria-labelledby="lp-trust-heading"
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container">
        <SectionHead
          id="lp-trust-heading"
          kicker="Sicher & fair"
          title="In sicheren Händen — ohne Kleingedrucktes."
          text="Alles, worauf es bei einer Unternehmens-Website wirklich ankommt, ist eingebaut — nicht dazugekauft."
        />
        <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map(item => (
            <li key={item.title} className="border-t border-lp-line pt-5">
              <item.icon
                className="h-5 w-5 text-lp-accent"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h3 className="mt-3 text-[1.05rem] font-medium tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-[1.6] text-lp-muted">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
