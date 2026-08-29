import React from "react";
import {
  Bot,
  CalendarDays,
  Check,
  Files,
  Images,
  MessageSquareText,
  ReceiptText,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  ADDON_NAMES,
  BOOKABLE_ADDON_KEYS,
  addonPrice,
  formatEuro,
  PRICING,
  type AddOnKey,
} from "@shared/pricing";
import {
  Kicker,
  PRICE_MONTHLY,
  PRICE_YEARLY,
  pillPrimary,
  startHref,
} from "./primitives";

// Muss der Leistungsliste im Server-Prerender entsprechen
// (server/seo/homePage.ts PLAN_FEATURES).
const INCLUDED = [
  "KI-generierte Website",
  "SSL-Zertifikat",
  "DSGVO-konformer Datenschutz & Impressum",
  "Premium Cloud Hosting",
  "Website-Inhalte jederzeit mit Studio-KI ändern",
  "Chat-Support",
];

/** Hochwertige, konsistente Line-Icons statt Plattform-/OS-Emojis. */
const ADDON_ICONS: Record<AddOnKey, LucideIcon> = {
  contactForm: MessageSquareText,
  gallery: Images,
  menu: UtensilsCrossed,
  pricelist: ReceiptText,
  aiChat: Bot,
  booking: CalendarDays,
  team: UsersRound,
  subpages: Files,
};

/** Anker-Zeilen neben der Preis-Karte (Spec §4.8) — der Agenturvergleich
 *  im selben Blickfeld wie der Preis statt als eigene Tabellen-Sektion.
 *  Muss inhaltlich zum Prerender passen (server/seo/homePage.ts). */
const ANCHORS: Array<{ kicker: string; agency: string; us: string }> = [
  {
    kicker: "Einmalig",
    agency: "Agentur: 2.000–8.000 €",
    us: "Pageblitz: 0 €",
  },
  {
    kicker: "Monatlich",
    agency: "Agentur: 50–150 € Hosting & Wartung",
    us: `Pageblitz: ab ${PRICE_YEARLY}`,
  },
  {
    kicker: "Zeit",
    agency: "Agentur: 4–12 Wochen",
    us: "Pageblitz: 3 Minuten",
  },
];

interface PricingProps {
  billingYearly: boolean;
  onBillingChange: (yearly: boolean) => void;
}

/**
 * Preis-Sektion „Nachtschicht" (Spec §4.8): links die Preis-Karte als
 * Kaufmoment (Panel + der zweite und letzte schwere Schatten der Seite),
 * rechts der kompakte Agentur-Anker — Ankereffekt im selben Blickfeld,
 * die frühere breite Vergleichstabelle entfällt.
 */
export function Pricing({ billingYearly, onBillingChange }: PricingProps) {
  const [, navigate] = useLocation();
  const price = billingYearly ? PRICE_YEARLY : PRICE_MONTHLY;
  const savedPerYear = formatEuro(
    (PRICING.base.monthly - PRICING.base.yearly) * 12
  );

  return (
    <section
      id="pricing"
      aria-labelledby="lp-pricing-heading"
      className="lp-section lp-band border-t border-lp-line"
    >
      <div className="lp-container">
        <div className="max-w-[44rem]">
          <Kicker className="mb-4">Preise</Kicker>
          <h2 id="lp-pricing-heading" className="lp-h2">
            Ein Preis. Alles inklusive.
          </h2>
          <p className="mt-5 max-w-[32rem] text-[1.05rem] leading-[1.55] text-lp-muted">
            Website, Hosting, SSL und rechtliche Seiten — ohne
            Einrichtungsgebühr oder Mindestlaufzeit.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
          {/* Preis-Karte: Panel + schwerer Schatten (bewusst ohne Hairline —
              Elevation nur über den Schatten, Spec §2). */}
          <div className="rounded-3xl bg-lp-panel p-6 shadow-[var(--lp-shadow-heavy)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Kicker>Pageblitz Website</Kicker>
                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="lp-display text-[clamp(3rem,2.4rem+2.5vw,4.75rem)] leading-none text-lp-ink">
                    {price}
                  </span>
                  <span className="pb-1.5 text-[0.95rem] text-lp-muted">
                    / Monat
                  </span>
                </div>
                <p className="mt-2 text-[0.85rem] text-lp-muted">
                  {billingYearly
                    ? `Jährlich · spart ${savedPerYear} pro Jahr`
                    : "Monatlich · jederzeit kündbar"}
                </p>
              </div>

              <div
                role="group"
                aria-label="Abrechnung"
                className="inline-flex self-start overflow-hidden rounded-full border border-lp-line text-[0.82rem] font-medium"
              >
                <button
                  type="button"
                  aria-pressed={billingYearly}
                  onClick={() => onBillingChange(true)}
                  className={`px-4 py-2 transition-colors ${
                    billingYearly
                      ? "bg-lp-volt text-lp-volt-ink"
                      : "text-lp-muted hover:text-lp-ink"
                  }`}
                >
                  Jährlich
                </button>
                <button
                  type="button"
                  aria-pressed={!billingYearly}
                  onClick={() => onBillingChange(false)}
                  className={`px-4 py-2 transition-colors ${
                    !billingYearly
                      ? "bg-lp-volt text-lp-volt-ink"
                      : "text-lp-muted hover:text-lp-ink"
                  }`}
                >
                  Monatlich
                </button>
              </div>
            </div>

            <ul className="mt-7 grid border-t border-lp-line pt-2 sm:grid-cols-2 sm:gap-x-8">
              {INCLUDED.map(item => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-lp-line py-3 text-[0.92rem] text-lp-ink"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-lp-volt"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-2xl bg-lp-panel-2 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="lp-kicker">Optionale Extras</h3>
                  <p className="mt-1.5 text-[0.82rem] text-lp-muted">
                    Nur auswählen, was dein Betrieb wirklich braucht.
                  </p>
                </div>
                <span className="text-[0.72rem] text-lp-faint">
                  Jederzeit anpassbar
                </span>
              </div>
              <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
                {BOOKABLE_ADDON_KEYS.map(key => {
                  const Icon = ADDON_ICONS[key];
                  return (
                    <li
                      key={key}
                      className="flex items-center gap-2.5 border-t border-lp-line py-2.5 text-[0.84rem] text-lp-ink"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0 text-lp-volt"
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">{ADDON_NAMES[key]}</span>
                      <span className="shrink-0 tabular-nums text-lp-muted">
                        + {formatEuro(addonPrice(key))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={`${pillPrimary} mt-7 h-14 w-full px-8 text-[1rem]`}
            >
              Website kostenlos erstellen
            </button>
            <p className="mt-3 text-center text-[0.82rem] text-lp-muted">
              Vorschau ohne Kreditkarte · 7 Tage gratis · danach jederzeit
              kündbar
            </p>
          </div>

          {/* Anker-Block: rationaler Vergleich im selben Blickfeld. */}
          <aside
            aria-labelledby="lp-compare-heading"
            className="lg:sticky lg:top-28"
          >
            <h3 id="lp-compare-heading" className="sr-only">
              Pageblitz im Vergleich zur Webagentur
            </h3>
            <ul className="divide-y divide-[var(--lp-line)] border-y border-lp-line">
              {ANCHORS.map(row => (
                <li key={row.kicker} className="py-5">
                  <p className="lp-kicker">{row.kicker}</p>
                  <p className="mt-1.5 text-[0.95rem] text-lp-faint">
                    <s aria-label={row.agency}>{row.agency}</s>
                  </p>
                  <p className="text-[1.05rem] font-bold text-lp-ink">
                    {row.us}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.95rem] leading-[1.55] text-lp-muted">
              Änderungen inklusive statt Stundenabrechnung, DSGVO und Impressum
              automatisch, keine Mindestlaufzeit.
            </p>
            <p className="mt-3 text-[1.05rem] font-bold text-lp-ink">
              Ersparnis im ersten Jahr: bis zu 8.000&nbsp;€.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
