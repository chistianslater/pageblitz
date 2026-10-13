/**
 * Alle Preis-Anzeigetexte — EINE Stelle für jeden Kontext (Landing, SEO,
 * Studio, Checkout, Konto, Postkarte, Chat-Prompts, JSON-LD). Zahlen kommen
 * ausschließlich aus shared/pricing.ts, Daten aus shared/pricingTerm.ts.
 * Wer einen Preis zeigt, importiert von hier — kein Literal anderswo
 * (server/pricingLiterals.test.ts).
 *
 * Keine relativen Importe außer ./pricing und ./pricingTerm: vite.config.ts
 * lädt diese Datei für den index.html-Platzhalter (`renderIndexHtmlPricing`).
 */
import {
  PLANS,
  TRIAL_DAYS,
  VAT,
  YEARLY_SAVINGS_CENTS,
  formatDecimal,
  formatEuro,
  formatEuroShort,
  type Tariff,
} from "./pricing";
import {
  computeCancellation,
  formatDateDe,
  isWithinNotice,
  termStateAt,
  cancelDeadline,
  TermUnknownError,
  type CancellationReason,
} from "./pricingTerm";

const Y = PLANS.yearly;
const M = PLANS.monthly;

/** „19,90 €" */
export const PRICE_YEARLY = formatEuro(Y.centsPerMonth);
/** „24,90 €" */
export const PRICE_MONTHLY = formatEuro(M.centsPerMonth);

/** „inkl. 19 % MwSt." */
export const VAT_NOTE = `inkl. ${VAT.ratePercent} % MwSt.`;
/** „Alle Preise inkl. 19 % MwSt." */
export const VAT_NOTE_ALL = `Alle Preise ${VAT_NOTE}`;

export const TARIFF_LABEL: Record<Tariff, string> = {
  yearly: "Jahrestarif",
  monthly: "Monatstarif",
};

/** „60 €" */
export const YEARLY_SAVINGS = formatEuroShort(YEARLY_SAVINGS_CENTS);
/** „spare 60 € im Jahr" */
export const YEARLY_SAVINGS_TEXT = `spare ${YEARLY_SAVINGS} im Jahr`;

/** „ab 19,90 €/Monat*" — nur zusammen mit PRICE_FOOTNOTE auf derselben Seite. */
export const PRICE_FROM_SHORT = `ab ${PRICE_YEARLY}/Monat*`;

/** Vollständige Bedingungen in einem Satz (ohne Sternchen). */
/** Zielgruppe (B2B) — steht in jeder Preis-Fußnote. */
export const B2B_NOTE = "Angebot nur für Gewerbetreibende und Selbstständige.";

// Pflicht-Häkchen vor dem Checkout (B2B + AGB): shared/agb.ts CHECKOUT_CONSENT.

export const PRICE_FULL =
  `${PRICE_YEARLY}/Monat bei ${Y.termMonths} Monaten Laufzeit, danach ` +
  `Verlängerung um ${Y.renewMonths} Monate; monatlich kündbar: ` +
  `${PRICE_MONTHLY}/Monat. ${VAT_NOTE_ALL} ${B2B_NOTE}`;

/** Fußnote zu PRICE_FROM_SHORT bzw. jedem „*" hinter einem Preis. */
export const PRICE_FOOTNOTE = `* ${PRICE_FULL}`;

/** „bei 12 Monaten Laufzeit" — Bedingung des Jahrestarifs. */
export const YEARLY_CONDITION = `bei ${Y.termMonths} Monaten Laufzeit`;

/**
 * „ab 19,90 €/Monat bei 12 Monaten Laufzeit" — für Stellen ohne Fußnote
 * (Meta-Descriptions, FAQ-Antworten, Fließtext, Chat).
 */
export const PRICE_FROM_INLINE = `ab ${PRICE_YEARLY}/Monat ${YEARLY_CONDITION}`;

/** Ein Satz für Fließtext/FAQ: beide Tarife, MwSt., Test. */
export const PRICE_SENTENCE =
  `${PRICE_YEARLY}/Monat bei ${Y.termMonths} Monaten Laufzeit oder ` +
  `${PRICE_MONTHLY}/Monat monatlich kündbar, jeweils ${VAT_NOTE}`;

/** Kanonische FAQ-Antwort „Was kostet …?" der SEO-Branchenseiten. */
export const PRICE_FAQ_ANSWER =
  `Mit Pageblitz zahlst du ${PRICE_SENTENCE} – ohne Einrichtungsgebühr. ` +
  `Die ersten ${TRIAL_DAYS} Tage sind gratis.`;

/** Laufzeit-Kurzform je Tarif. */
export const TARIFF_TERM_SHORT: Record<Tariff, string> = {
  yearly: `${Y.termMonths} Monate Laufzeit, monatlich abgebucht`,
  monthly: "monatlich kündbar",
};

/** Tarif-Zusammenfassung für Preiskarten. */
export const TARIFF_SUMMARY: Record<Tariff, string> = {
  yearly:
    `${PRICE_YEARLY}/Monat bei ${Y.termMonths} Monaten Laufzeit, monatlich ` +
    `abgebucht. Verlängert sich um ${Y.renewMonths} Monate, wenn du nicht ` +
    `spätestens ${Y.noticeMonths} Monat vor Laufzeitende kündigst.`,
  monthly: `${PRICE_MONTHLY}/Monat, monatlich kündbar zum Ende des Abrechnungsmonats.`,
};

/** Zeile unter dem Preis auf der Preiskarte (Landing + Prerender). */
export const PRICE_CARD_NOTE: Record<Tariff, string> = {
  yearly: `${TARIFF_LABEL.yearly} · ${TARIFF_TERM_SHORT.yearly} · ${YEARLY_SAVINGS_TEXT} · Keine Einrichtungsgebühr`,
  monthly: `${TARIFF_LABEL.monthly} · ${TARIFF_TERM_SHORT.monthly} · Keine Einrichtungsgebühr`,
};

/** Hinweis zu den Extras (gilt in beiden Tarifen). */
export const ADDON_TERM_NOTE =
  "Extras sind monatlich kündbar – auch im Jahrestarif – und enden spätestens mit deinem Abo.";

/** Vertragslaufzeit in Vergleichstabellen. */
export const TERM_COMPARISON = `${Y.termMonths} Monate (${PRICE_YEARLY}/Monat) oder monatlich kündbar (${PRICE_MONTHLY}/Monat)`;

/** „7 Tage gratis, danach 19,90 €/Monat bei 12 Monaten Laufzeit" — Fußzeile Preiskarte je Tarif. */
export function trialThenText(tariff: Tariff): string {
  return tariff === "yearly"
    ? `${TRIAL_DAYS} Tage gratis · danach ${PRICE_YEARLY}/Monat bei ${Y.termMonths} Monaten Laufzeit · ${VAT_NOTE}`
    : `${TRIAL_DAYS} Tage gratis · danach ${PRICE_MONTHLY}/Monat · monatlich kündbar · ${VAT_NOTE}`;
}

// ── Checkout (Studio) ───────────────────────────────────────────────────

/** Zeile unter dem Gesamtbetrag im Checkout. */
export function checkoutTotalLine(totalCents: number): string {
  return `${TRIAL_DAYS} Tage gratis, dann ${formatEuro(totalCents)} / Monat`;
}

/** Laufzeit-/Kündigungsbedingungen direkt am Bezahl-Button. */
export function checkoutTermLine(tariff: Tariff): string {
  const trial = `In den ${TRIAL_DAYS} Testtagen kostenlos kündbar.`;
  return tariff === "yearly"
    ? `${Y.termMonths} Monate Laufzeit ab der ersten Zahlung, danach ` +
        `Verlängerung um ${Y.renewMonths} Monate; Kündigung bis ` +
        `${Y.noticeMonths} Monat vor Laufzeitende. ${trial}`
    : `Monatlich kündbar zum Ende des Abrechnungsmonats. ${trial}`;
}

/** Fußzeile des Checkouts. */
export const CHECKOUT_FOOTER = `${VAT_NOTE_ALL} · sichere Zahlung über Stripe`;

/** Beschreibung der Basis-Position in Stripe (Rechnung/Checkout-Seite). */
export function stripeBaseDescription(tariff: Tariff): string {
  return tariff === "yearly"
    ? `${PRICE_YEARLY}/Monat · ${TARIFF_LABEL.yearly}, ${Y.termMonths} Monate Laufzeit · ${VAT_NOTE}`
    : `${PRICE_MONTHLY}/Monat · ${TARIFF_LABEL.monthly}, monatlich kündbar · ${VAT_NOTE}`;
}

/** Text neben dem Checkout-Button in Stripe (custom_text.submit). */
export function stripeSubmitNote(tariff: Tariff): string {
  return checkoutTermLine(tariff);
}

// ── Konto ───────────────────────────────────────────────────────────────

export interface AccountSubscriptionView {
  tariff: Tariff;
  status: string;
  /** Unix-Sekunden: Ende Testphase bzw. laufender Abrechnungsmonat. */
  currentPeriodEnd: number | null;
  termStartedAt: number | null;
  /** Stripe `billing_cycle_anchor` (siehe shared/pricingTerm.ts termBoundary). */
  billingAnchorAt?: number | null;
  cancelEffectiveAt: number | null;
}

/** „Jahrestarif · 19,90 €/Monat" */
export function accountPlanLine(tariff: Tariff): string {
  return `${TARIFF_LABEL[tariff]} · ${formatEuro(PLANS[tariff].centsPerMonth)}/Monat`;
}

/**
 * Laufzeit-Zeilen fürs Konto. Für den Jahrestarif mit laufender Laufzeit
 * exakt: „Läuft bis TT.MM.JJJJ, verlängert sich um 12 Monate, Kündigung bis
 * TT.MM.JJJJ".
 */
export function accountTermLines(
  view: AccountSubscriptionView,
  nowSec: number
): string[] {
  if (view.cancelEffectiveAt) {
    return [
      `Gekündigt zum ${formatDateDe(view.cancelEffectiveAt)}. Bis dahin bleibt deine Website online.`,
    ];
  }
  if (view.status === "trialing") {
    const lines = [
      view.currentPeriodEnd
        ? `Testphase bis ${formatDateDe(view.currentPeriodEnd)} – bis dahin kostenlos kündbar.`
        : "Testphase – bis zum Testende kostenlos kündbar.",
    ];
    if (view.tariff === "yearly") {
      lines.push(
        `Danach ${Y.termMonths} Monate Laufzeit ab der ersten Zahlung, Verlängerung um je ${Y.renewMonths} Monate.`
      );
    }
    return lines;
  }
  if (view.tariff === "monthly") {
    return [
      view.currentPeriodEnd
        ? `Monatlich kündbar, nächster Abrechnungstag ${formatDateDe(view.currentPeriodEnd)}.`
        : "Monatlich kündbar.",
    ];
  }
  if (view.termStartedAt == null) {
    return [
      `Die ${Y.termMonths} Monate Laufzeit beginnen mit der nächsten Zahlung.`,
    ];
  }
  const state = termStateAt(view.termStartedAt, nowSec, view.billingAnchorAt);
  if (isWithinNotice(nowSec, state.deadline)) {
    return [
      `Läuft bis ${formatDateDe(state.termEnd)}, verlängert sich um ${Y.renewMonths} Monate, Kündigung bis ${formatDateDe(state.deadline)}`,
    ];
  }
  return [
    `Läuft bis ${formatDateDe(state.termEnd)} und verlängert sich danach um ${Y.renewMonths} Monate bis ${formatDateDe(state.nextTermEnd)}; nächste Kündigung bis ${formatDateDe(cancelDeadline(state.nextTermEnd))}`,
  ];
}

/** Satz zur Wirkung einer Kündigung (lokal berechnet oder vom Server). */
export function cancellationHint(result: {
  endsAt: number;
  reason: CancellationReason;
}): string {
  const date = formatDateDe(result.endsAt);
  if (result.reason === "trial") {
    return `Kündigst du jetzt, endet dein Abo zum Testende am ${date} – es wird nichts abgebucht.`;
  }
  if (result.reason === "next_term_end") {
    return `Die Kündigungsfrist für das aktuelle Laufzeitende ist verstrichen – kündigst du jetzt, endet dein Abo am ${date}.`;
  }
  return `Kündigst du jetzt, endet dein Abo am ${date}.`;
}

/** Fallback, solange das Enddatum (noch) nicht vorliegt — Kündigen bleibt möglich. */
export const CANCEL_HINT_PENDING =
  "Das genaue Enddatum berechnen wir beim Bestätigen nach deinen Vertragsregeln und zeigen es dir danach an.";

/**
 * Hinweis am Kündigen-Button: wann das Abo endet, wenn heute gekündigt wird.
 * null, wenn sich das Datum lokal nicht berechnen lässt (dann gilt die
 * Server-Vorschau `customer.cancellationPreview`).
 */
export function cancelButtonHint(
  view: AccountSubscriptionView,
  nowSec: number
): string | null {
  try {
    const result = computeCancellation({
      tariff: view.tariff,
      requestedAt: nowSec,
      inTrial: view.status === "trialing",
      currentPeriodEnd: view.currentPeriodEnd,
      termStartedAt: view.termStartedAt,
      billingAnchor: view.billingAnchorAt,
    });
    return cancellationHint(result);
  } catch (err) {
    if (err instanceof TermUnknownError) return null;
    throw err;
  }
}

/** Hinweis zum Tarifwechsel im Konto. */
export const TARIFF_SWITCH_NOTE: Record<Tariff, string> = {
  monthly:
    `Wechsel in den ${TARIFF_LABEL.yearly} (${PRICE_YEARLY}/Monat) jederzeit möglich: ` +
    `gilt ab der nächsten Abbuchung, ab dann ${Y.termMonths} Monate Laufzeit.`,
  yearly:
    `Ein Wechsel in den ${TARIFF_LABEL.monthly} ist nur zum Laufzeitende möglich – ` +
    "schreib uns dafür rechtzeitig vor der Kündigungsfrist.",
};

// ── Postkarte (Druck, Feldlängen siehe server/postkarten/heymail.ts) ───

/** Abbinder-Preis, druckfest ohne Fußnote: „ab 19,90 €/Monat (12 Mon. Laufzeit, inkl. MwSt.)" */
export const POSTCARD_PRICE = `ab ${PRICE_YEARLY}/Monat (${Y.termMonths} Mon. Laufzeit, inkl. MwSt.)`;

/** Preis im Anschreiben (Rückseite): „19,90 € im Monat bei 12 Monaten Laufzeit (inkl. MwSt.)" */
export const POSTCARD_LETTER_PRICE = `${PRICE_YEARLY} im Monat bei ${Y.termMonths} Monaten Laufzeit (inkl. MwSt.)`;

// ── Chat-Prompts / llms.txt ─────────────────────────────────────────────

/** Faktenzeilen für KI-Prompts (Landing-/Support-Chat). */
export const PRICE_PROMPT_FACTS = [
  `- Jahrestarif: ${PRICE_YEARLY}/Monat, monatlich abgebucht, ${Y.termMonths} Monate Mindestlaufzeit ab der ersten Zahlung nach den Testtagen; verlängert sich um ${Y.renewMonths} Monate, Kündigung bis ${Y.noticeMonths} Monat vor Laufzeitende`,
  `- Monatstarif: ${PRICE_MONTHLY}/Monat, monatlich kündbar`,
  `- ${TRIAL_DAYS} Tage kostenlos testen; Kündigung in den Testtagen kostet nichts`,
  `- ${VAT_NOTE_ALL}; Extras sind monatlich kündbar, auch im Jahrestarif`,
].join("\n");

/** Kurzfassung für llms.txt. */
export const PRICE_LLMS_TXT = `Jahrestarif ${PRICE_YEARLY}/Monat bei ${Y.termMonths} Monaten Laufzeit (Verlängerung um ${Y.renewMonths} Monate, Kündigung ${Y.noticeMonths} Monat zum Laufzeitende) oder ${PRICE_MONTHLY}/Monat monatlich kündbar, ${VAT_NOTE}, ${TRIAL_DAYS} Tage gratis testen`;

// ── Schema.org ──────────────────────────────────────────────────────────

/** Zwei Offer-Einträge (Jahres- und Monatstarif) für JSON-LD. */
export function pricingJsonLdOffers(): Array<Record<string, unknown>> {
  const offer = (tariff: Tariff) => {
    const plan = PLANS[tariff];
    const price = formatDecimal(plan.centsPerMonth);
    return {
      "@type": "Offer",
      name: `Pageblitz ${TARIFF_LABEL[tariff]}`,
      description: TARIFF_SUMMARY[tariff],
      price,
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "EUR",
        valueAddedTaxIncluded: VAT.included,
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "MON",
        },
        ...(plan.termMonths > 0
          ? {
              billingDuration: {
                "@type": "QuantitativeValue",
                value: plan.termMonths,
                unitCode: "MON",
              },
            }
          : {}),
      },
    };
  };
  return [offer("yearly"), offer("monthly")];
}

/** Meta-Description der Startseite (index.html). */
export const HOME_META_DESCRIPTION = `Deine Website? Schon fast fertig. Individuelle Designs für deinen Betrieb. Kostenlosen Entwurf ansehen, ohne Kreditkarte. Live ${PRICE_FROM_INLINE}.`;
/** OG-/Twitter-Description der Startseite. */
export const HOME_OG_DESCRIPTION = `Individuelle Designs für deinen Betrieb. Entwurf kostenlos ansehen. Live ${PRICE_FROM_INLINE}.`;

/**
 * Setzt die Preis-Platzhalter in client/index.html ein (Vite-Plugin in
 * vite.config.ts, Build und Dev): `%PB_META_DESCRIPTION%`,
 * `%PB_OG_DESCRIPTION%` und `%PB_OFFERS_JSON%`.
 */
export function renderIndexHtmlPricing(html: string): string {
  const attr = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return html
    .replaceAll("%PB_META_DESCRIPTION%", attr(HOME_META_DESCRIPTION))
    .replaceAll("%PB_OG_DESCRIPTION%", attr(HOME_OG_DESCRIPTION))
    .replaceAll(
      "%PB_OFFERS_JSON%",
      JSON.stringify(pricingJsonLdOffers()).replace(/</g, "\\u003c")
    );
}
