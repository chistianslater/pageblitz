import {
  CalendarCheck,
  FileText,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
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
const TRUST_ITEMS: ReadonlyArray<{
  tag: string;
  title: string;
  text: string;
  Icon: LucideIcon;
}> = [
  {
    Icon: Scale,
    tag: "Recht",
    title: "Rechtssicher ohne Anwalt",
    text: "Impressum, Datenschutzerklärung und Cookie-Banner werden aus deinen Angaben automatisch erzeugt — kein Extra, keine Anwaltskosten.",
  },
  {
    Icon: ShieldCheck,
    tag: "Hosting",
    title: "SSL & Hosting immer dabei",
    text: "Verschlüsselte Verbindung, schnelles Cloud-Hosting und deine Domain — eingerichtet ohne dein Zutun.",
  },
  {
    Icon: FileText,
    tag: "Inhalte",
    title: "Deine Inhalte gehören dir",
    text: "Texte, Fotos und Daten stammen von dir — und bleiben deins. Änderungen machst du jederzeit im Studio, auf Wunsch mit KI-Unterstützung.",
  },
  {
    Icon: CalendarCheck,
    tag: "Vertrag",
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
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {TRUST_ITEMS.map(item => (
            <li
              key={item.title}
              className="flex flex-col rounded-2xl border border-lp-line p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="lp-kicker">{item.tag}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lp-panel-2 text-lp-volt">
                  <item.Icon
                    className="h-5 w-5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <h3 className="mt-4 text-[1.3rem] font-bold leading-[1.15] tracking-[-0.02em] text-lp-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-[1.55] text-lp-muted">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
