import { describe, expect, test } from "vitest";
import {
  ADDON_TERM_NOTE,
  B2B_CONFIRM_LABEL,
  cancellationHint,
  CHECKOUT_FOOTER,
  HOME_META_DESCRIPTION,
  HOME_OG_DESCRIPTION,
  POSTCARD_LETTER_PRICE,
  POSTCARD_PRICE,
  PRICE_CARD_NOTE,
  PRICE_FAQ_ANSWER,
  PRICE_FOOTNOTE,
  PRICE_FROM_INLINE,
  PRICE_FROM_SHORT,
  PRICE_FULL,
  PRICE_LLMS_TXT,
  PRICE_MONTHLY,
  PRICE_PROMPT_FACTS,
  PRICE_SENTENCE,
  PRICE_YEARLY,
  TARIFF_LABEL,
  TARIFF_SUMMARY,
  TARIFF_SWITCH_NOTE,
  TARIFF_TERM_SHORT,
  TERM_COMPARISON,
  VAT_NOTE,
  VAT_NOTE_ALL,
  YEARLY_SAVINGS,
  YEARLY_SAVINGS_TEXT,
  accountPlanLine,
  accountTermLines,
  cancelButtonHint,
  checkoutTermLine,
  checkoutTotalLine,
  pricingJsonLdOffers,
  renderIndexHtmlPricing,
  stripeBaseDescription,
  trialThenText,
} from "./pricingText";

const t = (iso: string) => Math.floor(Date.parse(iso) / 1000);

describe("Grundtexte", () => {
  test("Preise, MwSt., Ersparnis", () => {
    expect(PRICE_YEARLY).toBe("19,90 €");
    expect(PRICE_MONTHLY).toBe("24,90 €");
    expect(VAT_NOTE).toBe("inkl. 19 % MwSt.");
    expect(VAT_NOTE_ALL).toBe("Alle Preise inkl. 19 % MwSt.");
    expect(YEARLY_SAVINGS).toBe("60 €");
    expect(YEARLY_SAVINGS_TEXT).toBe("spare 60 € im Jahr");
    expect(TARIFF_LABEL).toEqual({
      yearly: "Jahrestarif",
      monthly: "Monatstarif",
    });
  });

  test("Kurzform mit Fußnote und Vollform", () => {
    expect(PRICE_FROM_SHORT).toBe("ab 19,90 €/Monat*");
    expect(PRICE_FULL).toBe(
      "19,90 €/Monat bei 12 Monaten Laufzeit, danach Verlängerung um 12 Monate; monatlich kündbar: 24,90 €/Monat. Alle Preise inkl. 19 % MwSt. Angebot nur für Gewerbetreibende und Selbstständige."
    );
    expect(B2B_CONFIRM_LABEL).toBe(
      "Ich bestelle als Unternehmer oder Selbstständiger (§ 14 BGB). Das Angebot richtet sich nicht an Verbraucher."
    );
    expect(PRICE_FOOTNOTE).toBe(`* ${PRICE_FULL}`);
    expect(PRICE_FROM_INLINE).toBe("ab 19,90 €/Monat bei 12 Monaten Laufzeit");
    expect(PRICE_SENTENCE).toBe(
      "19,90 €/Monat bei 12 Monaten Laufzeit oder 24,90 €/Monat monatlich kündbar, jeweils inkl. 19 % MwSt."
    );
    expect(PRICE_FAQ_ANSWER).toBe(
      "Mit Pageblitz zahlst du 19,90 €/Monat bei 12 Monaten Laufzeit oder 24,90 €/Monat monatlich kündbar, jeweils inkl. 19 % MwSt. – ohne Einrichtungsgebühr. Die ersten 7 Tage sind gratis."
    );
  });

  test("Tarif-Texte", () => {
    expect(TARIFF_TERM_SHORT).toEqual({
      yearly: "12 Monate Laufzeit, monatlich abgebucht",
      monthly: "monatlich kündbar",
    });
    expect(TARIFF_SUMMARY.yearly).toBe(
      "19,90 €/Monat bei 12 Monaten Laufzeit, monatlich abgebucht. Verlängert sich um 12 Monate, wenn du nicht spätestens 1 Monat vor Laufzeitende kündigst."
    );
    expect(TARIFF_SUMMARY.monthly).toBe(
      "24,90 €/Monat, monatlich kündbar zum Ende des Abrechnungsmonats."
    );
    expect(ADDON_TERM_NOTE).toBe(
      "Extras sind monatlich kündbar – auch im Jahrestarif – und enden spätestens mit deinem Abo."
    );
    expect(PRICE_CARD_NOTE.yearly).toBe(
      "Jahrestarif · 12 Monate Laufzeit, monatlich abgebucht · spare 60 € im Jahr · Keine Einrichtungsgebühr"
    );
    expect(PRICE_CARD_NOTE.monthly).toBe(
      "Monatstarif · monatlich kündbar · Keine Einrichtungsgebühr"
    );
    expect(TERM_COMPARISON).toBe(
      "12 Monate (19,90 €/Monat) oder monatlich kündbar (24,90 €/Monat)"
    );
    expect(trialThenText("yearly")).toBe(
      "7 Tage gratis · danach 19,90 €/Monat bei 12 Monaten Laufzeit · inkl. 19 % MwSt."
    );
    expect(trialThenText("monthly")).toBe(
      "7 Tage gratis · danach 24,90 €/Monat · monatlich kündbar · inkl. 19 % MwSt."
    );
    expect(TARIFF_SWITCH_NOTE.monthly).toBe(
      "Wechsel in den Jahrestarif (19,90 €/Monat) jederzeit möglich: gilt ab der nächsten Abbuchung, ab dann 12 Monate Laufzeit."
    );
    expect(TARIFF_SWITCH_NOTE.yearly).toBe(
      "Ein Wechsel in den Monatstarif ist nur zum Laufzeitende möglich – schreib uns dafür rechtzeitig vor der Kündigungsfrist."
    );
  });
});

describe("Checkout", () => {
  test("Gesamt-, Laufzeit- und Fußzeile", () => {
    expect(checkoutTotalLine(2380)).toBe("7 Tage gratis, dann 23,80 € / Monat");
    expect(checkoutTermLine("yearly")).toBe(
      "12 Monate Laufzeit ab der ersten Zahlung, danach Verlängerung um 12 Monate; Kündigung bis 1 Monat vor Laufzeitende. In den 7 Testtagen kostenlos kündbar."
    );
    expect(checkoutTermLine("monthly")).toBe(
      "Monatlich kündbar zum Ende des Abrechnungsmonats. In den 7 Testtagen kostenlos kündbar."
    );
    expect(CHECKOUT_FOOTER).toBe(
      "Alle Preise inkl. 19 % MwSt. · sichere Zahlung über Stripe"
    );
  });
  test("Stripe-Positionsbeschreibung", () => {
    expect(stripeBaseDescription("yearly")).toBe(
      "19,90 €/Monat · Jahrestarif, 12 Monate Laufzeit · inkl. 19 % MwSt."
    );
    expect(stripeBaseDescription("monthly")).toBe(
      "24,90 €/Monat · Monatstarif, monatlich kündbar · inkl. 19 % MwSt."
    );
  });
});

describe("Konto", () => {
  const anchor = t("2027-01-31T12:00:00Z");
  const yearly = {
    tariff: "yearly" as const,
    status: "active",
    currentPeriodEnd: t("2027-06-30T12:00:00Z"),
    termStartedAt: anchor,
    cancelEffectiveAt: null,
  };

  test("accountPlanLine", () => {
    expect(accountPlanLine("yearly")).toBe("Jahrestarif · 19,90 €/Monat");
    expect(accountPlanLine("monthly")).toBe("Monatstarif · 24,90 €/Monat");
  });

  test("Jahrestarif innerhalb der Frist: exakte Zeile", () => {
    expect(accountTermLines(yearly, t("2027-05-01T10:00:00Z"))).toEqual([
      "Läuft bis 31.01.2028, verlängert sich um 12 Monate, Kündigung bis 31.12.2027",
    ]);
    expect(cancelButtonHint(yearly, t("2027-05-01T10:00:00Z"))).toBe(
      "Kündigst du jetzt, endet dein Abo am 31.01.2028."
    );
  });

  test("Jahrestarif im letzten Monat: Verlängerung steht fest", () => {
    expect(accountTermLines(yearly, t("2028-01-10T10:00:00Z"))).toEqual([
      "Läuft bis 31.01.2028 und verlängert sich danach um 12 Monate bis 31.01.2029; nächste Kündigung bis 31.12.2028",
    ]);
    expect(cancelButtonHint(yearly, t("2028-01-10T10:00:00Z"))).toBe(
      "Die Kündigungsfrist für das aktuelle Laufzeitende ist verstrichen – kündigst du jetzt, endet dein Abo am 31.01.2029."
    );
  });

  test("Testphase", () => {
    const trial = {
      ...yearly,
      status: "trialing",
      termStartedAt: null,
      currentPeriodEnd: t("2027-01-31T12:00:00Z"),
    };
    expect(accountTermLines(trial, t("2027-01-26T10:00:00Z"))).toEqual([
      "Testphase bis 31.01.2027 – bis dahin kostenlos kündbar.",
      "Danach 12 Monate Laufzeit ab der ersten Zahlung, Verlängerung um je 12 Monate.",
    ]);
    expect(cancelButtonHint(trial, t("2027-01-26T10:00:00Z"))).toBe(
      "Kündigst du jetzt, endet dein Abo zum Testende am 31.01.2027 – es wird nichts abgebucht."
    );
    expect(
      accountTermLines(
        { ...trial, tariff: "monthly" },
        t("2027-01-26T10:00:00Z")
      )
    ).toEqual(["Testphase bis 31.01.2027 – bis dahin kostenlos kündbar."]);
  });

  test("Monatstarif", () => {
    const monthly = {
      ...yearly,
      tariff: "monthly" as const,
      termStartedAt: null,
    };
    expect(accountTermLines(monthly, t("2027-06-10T10:00:00Z"))).toEqual([
      "Monatlich kündbar, nächster Abrechnungstag 30.06.2027.",
    ]);
    expect(cancelButtonHint(monthly, t("2027-06-10T10:00:00Z"))).toBe(
      "Kündigst du jetzt, endet dein Abo am 30.06.2027."
    );
  });

  test("Gekündigt", () => {
    expect(
      accountTermLines(
        { ...yearly, cancelEffectiveAt: t("2028-01-31T12:00:00Z") },
        t("2027-06-10T10:00:00Z")
      )
    ).toEqual([
      "Gekündigt zum 31.01.2028. Bis dahin bleibt deine Website online.",
    ]);
  });

  test("Jahrestarif ohne Laufzeitbeginn (Wechsel ausstehend)", () => {
    const pending = { ...yearly, termStartedAt: null };
    expect(accountTermLines(pending, t("2027-06-10T10:00:00Z"))).toEqual([
      "Die 12 Monate Laufzeit beginnen mit der nächsten Zahlung.",
    ]);
    expect(cancelButtonHint(pending, t("2027-06-10T10:00:00Z"))).toBeNull();
  });
});

describe("Postkarte, Prompts, llms.txt", () => {
  test("Postkarten-Preise", () => {
    expect(POSTCARD_PRICE).toBe(
      "ab 19,90 €/Monat (12 Mon. Laufzeit, inkl. MwSt.)"
    );
    expect(POSTCARD_LETTER_PRICE).toBe(
      "19,90 € im Monat bei 12 Monaten Laufzeit (inkl. MwSt.)"
    );
  });
  test("Prompt-Fakten", () => {
    expect(PRICE_PROMPT_FACTS).toBe(
      [
        "- Jahrestarif: 19,90 €/Monat, monatlich abgebucht, 12 Monate Mindestlaufzeit ab der ersten Zahlung nach den Testtagen; verlängert sich um 12 Monate, Kündigung bis 1 Monat vor Laufzeitende",
        "- Monatstarif: 24,90 €/Monat, monatlich kündbar",
        "- 7 Tage kostenlos testen; Kündigung in den Testtagen kostet nichts",
        "- Alle Preise inkl. 19 % MwSt.; Extras sind monatlich kündbar, auch im Jahrestarif",
      ].join("\n")
    );
    expect(PRICE_LLMS_TXT).toBe(
      "Jahrestarif 19,90 €/Monat bei 12 Monaten Laufzeit (Verlängerung um 12 Monate, Kündigung 1 Monat zum Laufzeitende) oder 24,90 €/Monat monatlich kündbar, inkl. 19 % MwSt., 7 Tage gratis testen"
    );
  });
});

describe("Schema.org und index.html", () => {
  test("zwei Offer-Einträge mit UnitPriceSpecification", () => {
    const [yearly, monthly] = pricingJsonLdOffers();
    expect(yearly).toMatchObject({
      "@type": "Offer",
      name: "Pageblitz Jahrestarif",
      price: "19.90",
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "19.90",
        priceCurrency: "EUR",
        valueAddedTaxIncluded: true,
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "MON",
        },
        billingDuration: {
          "@type": "QuantitativeValue",
          value: 12,
          unitCode: "MON",
        },
      },
    });
    expect(monthly).toMatchObject({
      name: "Pageblitz Monatstarif",
      price: "24.90",
      priceSpecification: { valueAddedTaxIncluded: true },
    });
    expect(
      (monthly.priceSpecification as Record<string, unknown>).billingDuration
    ).toBeUndefined();
  });

  test("Meta-Descriptions", () => {
    expect(HOME_META_DESCRIPTION).toBe(
      "Deine Website? Schon fast fertig. Individuelle Designs für deinen Betrieb. Kostenlosen Entwurf ansehen, ohne Kreditkarte. Live ab 19,90 €/Monat bei 12 Monaten Laufzeit."
    );
    expect(HOME_OG_DESCRIPTION).toBe(
      "Individuelle Designs für deinen Betrieb. Entwurf kostenlos ansehen. Live ab 19,90 €/Monat bei 12 Monaten Laufzeit."
    );
  });

  test("renderIndexHtmlPricing ersetzt alle Platzhalter", () => {
    const html = renderIndexHtmlPricing(
      '<meta content="%PB_META_DESCRIPTION%"><meta content="%PB_OG_DESCRIPTION%"><script>{"offers": %PB_OFFERS_JSON%}</script>'
    );
    expect(html).not.toContain("%PB_");
    const json = JSON.parse(html.match(/<script>(.*)<\/script>/)![1]);
    expect(json.offers).toHaveLength(2);
  });
});

describe("Kündigungshinweis ohne Laufzeitbeginn (Review 2026-10-13)", () => {
  test("cancellationHint formatiert ein Server-Ergebnis", () => {
    expect(
      cancellationHint({ endsAt: t("2028-02-29T12:00:00Z"), reason: "term_end" })
    ).toBe("Kündigst du jetzt, endet dein Abo am 29.02.2028.");
  });
  test("Laufzeitende mit Abrechnungsanker auf Stripe-Grenze", () => {
    expect(
      accountTermLines(
        {
          tariff: "yearly",
          status: "active",
          currentPeriodEnd: null,
          termStartedAt: t("2027-02-28T12:00:00Z"),
          billingAnchorAt: t("2027-01-31T12:00:00Z"),
          cancelEffectiveAt: null,
        },
        t("2027-06-01T00:00:00Z")
      )
    ).toEqual([
      "Läuft bis 29.02.2028, verlängert sich um 12 Monate, Kündigung bis 29.01.2028",
    ]);
  });
});
