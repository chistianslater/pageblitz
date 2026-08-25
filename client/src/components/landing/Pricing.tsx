import { Check } from "lucide-react";
import { useLocation } from "wouter";
import {
  ADDON_NAMES,
  BOOKABLE_ADDON_KEYS,
  addonPrice,
  formatEuro,
  PRICING,
} from "@shared/pricing";
import {
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

// Vergleichszeilen wie im Prerender (server/seo/homePage.ts COMPARISON).
const COMPARISON: Array<[string, string, string]> = [
  ["Einmalige Kosten", "2.000 – 8.000 €", "0 €"],
  ["Zeit bis zur Website", "4 – 12 Wochen", "3 Minuten"],
  ["Monatliche Kosten", "50 – 150 € Hosting & Wartung", `ab ${PRICE_YEARLY}`],
  ["Änderungen & Updates", "Stundenabrechnung (~80 €/h)", "Inklusive"],
  ["Vertragslaufzeit", "Oft 12–24 Monate", "Monatlich kündbar"],
  ["DSGVO & Impressum", "Meist extra", "Automatisch inklusive"],
];

interface PricingProps {
  billingYearly: boolean;
  onBillingChange: (yearly: boolean) => void;
}

/**
 * Preisliste in Listenform mit Hairlines: Basis + Add-ons ausschließlich aus
 * shared/pricing.ts, Billing-Toggle (bestehend, steuert auch die
 * `?billing=`-Parameter aller Start-Links), rechts der Agentur-Vergleich.
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
      className="lp-section border-t border-lp-line"
    >
      <div className="lp-container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="lp-kicker mb-4">Preise</p>
          <h2 id="lp-pricing-heading" className="lp-h2">
            Ein Preis. Alles inklusive.
          </h2>

          <div
            role="group"
            aria-label="Abrechnung"
            className="mt-8 inline-flex items-center gap-3"
          >
            <span className="inline-flex overflow-hidden rounded-full border border-lp-line text-[0.85rem] font-medium">
              <button
                type="button"
                aria-pressed={billingYearly}
                onClick={() => onBillingChange(true)}
                className={`px-4 py-1.5 transition-colors ${
                  billingYearly
                    ? "bg-lp-ink text-lp-canvas"
                    : "text-lp-muted hover:text-lp-ink"
                }`}
              >
                Jährlich
              </button>
              <button
                type="button"
                aria-pressed={!billingYearly}
                onClick={() => onBillingChange(false)}
                className={`px-4 py-1.5 transition-colors ${
                  !billingYearly
                    ? "bg-lp-ink text-lp-canvas"
                    : "text-lp-muted hover:text-lp-ink"
                }`}
              >
                Monatlich
              </button>
            </span>
            <span className="text-[0.8rem] text-lp-muted">
              {billingYearly
                ? `Spart ${savedPerYear} im Jahr`
                : "Jederzeit kündbar"}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-2">
            <span className="text-[clamp(3.5rem,2.5rem+4vw,6rem)] leading-[0.95] tracking-[-0.03em]">
              {price}
            </span>
            <span className="pb-2 text-[1.05rem] text-lp-muted">
              pro Monat
              <span className="block text-[0.85rem]">
                {billingYearly
                  ? "bei jährlicher Zahlung, monatlich abgebucht"
                  : "bei monatlicher Zahlung"}
              </span>
            </span>
          </div>
          <p className="mt-4 text-[0.95rem] text-lp-muted">
            Die ersten 7 Tage sind kostenlos. Danach{" "}
            {billingYearly
              ? `${PRICE_YEARLY}/Monat (jährlich)`
              : `${PRICE_MONTHLY}/Monat`}{" "}
            · jederzeit kündbar.
          </p>

          <div className="mt-10 rounded-[14px] border border-lp-line bg-lp-surface p-6 sm:p-7">
            <h3 className="lp-kicker">Inklusive</h3>
            <ul className="mt-3 grid sm:grid-cols-2 sm:gap-x-8">
              {INCLUDED.map(item => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-t border-lp-line py-3 text-[0.95rem]"
                >
                  <Check
                    className="mt-1 h-4 w-4 shrink-0 text-lp-accent"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="lp-kicker mt-8">Extras nach Bedarf</h3>
            <ul className="mt-3 grid sm:grid-cols-2 sm:gap-x-8">
              {BOOKABLE_ADDON_KEYS.map(key => (
                <li
                  key={key}
                  className="flex items-baseline justify-between gap-3 border-t border-lp-line py-2.5 text-[0.9rem]"
                >
                  <span>{ADDON_NAMES[key]}</span>
                  <span className="shrink-0 tabular-nums text-lp-muted">
                    + {formatEuro(addonPrice(key))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(startHref(billingYearly))}
              className={`${pillPrimary} h-14 px-8 text-[1rem]`}
            >
              Website kostenlos erstellen
            </button>
            <span className="text-[0.85rem] text-lp-muted">
              Keine Einrichtungsgebühr · keine Mindestlaufzeit
            </span>
          </div>
        </div>

        <aside className="lg:col-span-5" aria-labelledby="lp-compare-heading">
          <p className="lp-kicker mb-4">Vergleich</p>
          <h3
            id="lp-compare-heading"
            className="text-[1.5rem] tracking-[-0.01em]"
          >
            Pageblitz vs. Webagentur
          </h3>
          <table className="mt-6 w-full border-collapse text-[0.9rem]">
            <caption className="sr-only">
              Vergleich Webagentur und Pageblitz
            </caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="lp-kicker pb-2 font-medium"></th>
                <th scope="col" className="lp-kicker pb-2 font-medium">
                  Agentur
                </th>
                <th
                  scope="col"
                  className="lp-kicker pb-2 font-medium !text-lp-accent"
                >
                  Pageblitz
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([label, agency, us]) => (
                <tr
                  key={label}
                  className="border-t border-lp-line last:border-b"
                >
                  <th
                    scope="row"
                    className="py-3 pr-3 text-left align-top font-medium"
                  >
                    {label}
                  </th>
                  <td className="py-3 pr-3 align-top text-lp-muted">
                    {agency}
                  </td>
                  <td className="py-3 align-top font-medium text-lp-accent">
                    {us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[0.85rem] text-lp-muted">
            Ersparnis im ersten Jahr: bis zu 8.000 €.
          </p>
        </aside>
      </div>
    </section>
  );
}
