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
 * Pricing-Revision 2026-08-25: fokussierte Preis-Karte als eigenständiger
 * Kaufmoment, danach ein breiter Agenturvergleich. Das vorherige 7/5-Layout
 * quetschte Preis, Inklusivleistungen, Extras und Vergleich in eine Bühne.
 *
 * Struktur orientiert sich am starken Aufbau der Branchen-Landingpages
 * (User-Referenz): erst ein klares Angebot, dann rationaler Vergleich —
 * optisch aber vollständig in der neuen Pageblitz-Sprache.
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
      <div className="lp-container">
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="lp-kicker mb-4">Preise</p>
          <h2 id="lp-pricing-heading" className="lp-h2">
            Ein Preis. Alles inklusive.
          </h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[1.05rem] leading-[1.6] text-lp-muted">
            Website, Hosting, SSL und rechtliche Seiten — ohne
            Einrichtungsgebühr oder Mindestlaufzeit.
          </p>
        </div>

        {/* Ein fokussiertes Angebot statt verteilter Preisfragmente. */}
        <div className="mx-auto mt-10 max-w-[42rem] rounded-[18px] border border-lp-line bg-lp-surface p-6 shadow-[0_28px_60px_-42px_rgba(29,26,23,0.55)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="lp-kicker">Pageblitz Website</p>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-[clamp(3.25rem,2.4rem+3vw,5rem)] leading-none tracking-[-0.035em]">
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
                className={`px-4 py-2 transition-colors ${
                  !billingYearly
                    ? "bg-lp-ink text-lp-canvas"
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
                className="flex items-start gap-3 border-b border-lp-line py-3 text-[0.92rem]"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-lp-accent"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

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

        {/* Extras transparent, aber visuell nachgeordnet. */}
        <div className="mx-auto mt-10 max-w-[56rem]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="lp-kicker">Extras nach Bedarf</p>
              <p className="mt-2 text-[0.9rem] text-lp-muted">
                Nur dazubuchen, was deine Website wirklich braucht.
              </p>
            </div>
            <span className="text-[0.8rem] text-lp-muted">
              Jederzeit zu- und abbuchbar
            </span>
          </div>
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {BOOKABLE_ADDON_KEYS.map(key => (
              <li
                key={key}
                className="flex items-baseline justify-between gap-3 border-t border-lp-line py-3 text-[0.88rem]"
              >
                <span>{ADDON_NAMES[key]}</span>
                <span className="shrink-0 tabular-nums text-lp-muted">
                  + {formatEuro(addonPrice(key))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vergleich als eigenständiger rationaler Beweis nach dem Angebot. */}
        <aside
          className="mx-auto mt-20 max-w-[64rem]"
          aria-labelledby="lp-compare-heading"
        >
          <div className="text-center">
            <p className="lp-kicker mb-4">Der Vergleich</p>
            <h3 id="lp-compare-heading" className="lp-h2">
              Pageblitz vs. Webagentur
            </h3>
            <p className="mx-auto mt-4 max-w-[36rem] text-[0.95rem] text-lp-muted">
              Professionell online gehen — ohne monatelanges Projekt und
              vierstellige Vorleistung.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface">
            <table className="w-full table-fixed border-collapse text-[0.72rem] sm:text-[0.92rem]">
              <caption className="sr-only">
                Vergleich Webagentur und Pageblitz
              </caption>
              <colgroup>
                <col className="w-[32%]" />
                <col className="w-[34%]" />
                <col className="w-[34%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-lp-line text-left">
                  <th scope="col" className="p-3 sm:p-4"></th>
                  <th
                    scope="col"
                    className="p-3 font-medium text-lp-muted sm:p-4"
                  >
                    Webagentur
                  </th>
                  <th
                    scope="col"
                    className="bg-[#eef5f1] p-3 font-medium text-lp-accent sm:p-4"
                  >
                    Pageblitz
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([label, agency, us]) => (
                  <tr
                    key={label}
                    className="border-b border-lp-line last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="break-words p-2 text-left align-top font-medium sm:p-4"
                    >
                      {label}
                    </th>
                    <td className="break-words p-2 align-top text-lp-muted sm:p-4">
                      {agency}
                    </td>
                    <td className="break-words bg-[#eef5f1] p-2 align-top font-medium text-lp-accent sm:p-4">
                      {us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-[0.85rem] text-lp-muted">
            Potenzielle Ersparnis im ersten Jahr: bis zu 8.000 €.
          </p>
        </aside>
      </div>
    </section>
  );
}
