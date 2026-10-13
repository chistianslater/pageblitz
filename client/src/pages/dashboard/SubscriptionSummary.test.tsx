import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import {
  SubscriptionSummary,
  activeAddOnKeys,
  toAccountView,
  type SubscriptionRow,
} from "./SubscriptionSummary";

const t = (iso: string) => Math.floor(Date.parse(iso) / 1000);
const noop = () => {};

function render(
  row: Partial<SubscriptionRow>,
  now: string,
  preview: { endsAt: number; reason: "term_end" | "next_term_end" | "trial" | "monthly" } | null = null
) {
  const subscription: SubscriptionRow = {
    status: "active",
    billingInterval: "yearly",
    addOns: {},
    currentPeriodEnd: t("2027-05-31T12:00:00Z"),
    termStartedAt: t("2027-01-31T12:00:00Z"),
    cancelEffectiveAt: null,
    ...row,
  };
  return renderToStaticMarkup(
    <SubscriptionSummary
      subscription={subscription}
      websiteSlug="brandt"
      nowSec={t(now)}
      onCancel={noop}
      onWithdraw={noop}
      onSwitchToYearly={noop}
      onOpenPortal={noop}
      preview={preview}
    />
  );
}

describe("SubscriptionSummary (Konto)", () => {
  test("Jahrestarif: Tarif, Preis, Laufzeitzeile, Kündigungswirkung — kein festes 19,90 mehr im Monatstarif", () => {
    const html = render({}, "2027-05-10T08:00:00Z");
    expect(html).toContain("Jahrestarif · 19,90 €/Monat");
    expect(html).toContain("Alle Preise inkl. 19 % MwSt.");
    expect(html).toContain(
      "Läuft bis 31.01.2028, verlängert sich um 12 Monate, Kündigung bis 31.12.2027"
    );
    expect(html).toContain("Kündigst du jetzt, endet dein Abo am 31.01.2028.");
    expect(html).toContain("Monatstarif ist nur zum Laufzeitende möglich");
  });

  test("Monatstarif zeigt 24,90 € und den Wechsel in den Jahrestarif", () => {
    const html = render(
      { billingInterval: "monthly", termStartedAt: null },
      "2027-05-10T08:00:00Z"
    );
    expect(html).toContain("Monatstarif · 24,90 €/Monat");
    expect(html).not.toContain("19,90 €/Monat · ");
    expect(html).toContain(
      "Monatlich kündbar, nächster Abrechnungstag 31.05.2027."
    );
    expect(html).toContain("In den Jahrestarif wechseln");
  });

  test("Extras aus shared/pricing, inkl. Team/Unterseiten, mit Gesamtsumme", () => {
    const html = render(
      { addOns: { gallery: true, aiChat: true, team: true } },
      "2027-05-10T08:00:00Z"
    );
    expect(html).toContain("Bildergalerie");
    expect(html).toContain("KI-Chat");
    expect(html).toContain("Team");
    // 19,90 + 3,90 + 9,90 + 3,90
    expect(html).toContain("37,60 €/Monat");
    expect(html).toContain("Extras sind monatlich kündbar");
  });

  test("gekündigt: Enddatum, Zurücknehmen statt Kündigen", () => {
    const html = render(
      {
        status: "canceling",
        cancelEffectiveAt: t("2028-01-31T12:00:00Z"),
      },
      "2027-05-10T08:00:00Z"
    );
    expect(html).toContain("Gekündigt zum 31.01.2028");
    expect(html).toContain("Kündigung zurücknehmen");
    expect(html).not.toContain(">Kündigen<");
  });

  test("Testphase: kostenlos kündbar zum Testende", () => {
    const html = render(
      {
        status: "trialing",
        termStartedAt: null,
        currentPeriodEnd: t("2027-01-31T12:00:00Z"),
      },
      "2027-01-27T08:00:00Z"
    );
    expect(html).toContain("Testphase bis 31.01.2027");
    expect(html).toContain("es wird nichts abgebucht");
  });

  test("Hilfsfunktionen", () => {
    expect(
      activeAddOnKeys({ features: { menu: true }, subpages: true })
    ).toEqual(["menu", "subpages"]);
    expect(
      toAccountView({
        status: "active",
        billingInterval: null,
        addOns: null,
        currentPeriodEnd: null,
        termStartedAt: null,
        cancelEffectiveAt: null,
      }).tariff
    ).toBe("monthly");
  });
});

describe("Kündigen nie gesperrt (Review 2026-10-13)", () => {
  test("Jahrestarif ohne Laufzeitbeginn: Kündigen-Knopf da, Hinweis statt Sperre", () => {
    const html = render({ termStartedAt: null }, "2027-06-10T08:00:00Z");
    expect(html).toContain(">Kündigen<");
    expect(html).toContain("Das genaue Enddatum berechnen wir beim Bestätigen");
  });
  test("Server-Vorschau hat Vorrang und zeigt das Datum, das Stripe bekommt", () => {
    const html = render({ termStartedAt: null }, "2027-06-10T08:00:00Z", {
      endsAt: t("2028-02-29T12:00:00Z"),
      reason: "term_end",
    });
    expect(html).toContain("Kündigst du jetzt, endet dein Abo am 29.02.2028.");
  });
});
