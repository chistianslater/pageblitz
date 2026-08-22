import { describe, expect, test } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AddonsList } from "./AddonsPanel";

describe("AddonsList", () => {
  test("Summe für gallery + menu jährlich zeigt 27,70 €", () => {
    // 19,90 € Basis (jährlich) + 3,90 € Galerie + 3,90 € Speisekarte.
    // Abweichung vom Task-Brief (dort: gallery+aiChat = 33,70 €): laut
    // Controller-Ruling zählt aiChat nicht in die Summe (siehe unten).
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ gallery: true, menu: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    expect(html).toContain("27,70 €");
  });

  test("aiChat/booking/team sind als 'bald verfügbar' gesperrt und zählen nie in die Summe", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ aiChat: true, booking: true, team: true }}
        onToggle={() => {}}
        interval="yearly"
      />
    );
    const lockedMatches = html.match(/bald verfügbar/g) ?? [];
    expect(lockedMatches.length).toBe(3);
    // Nur Basispreis — keines der drei gesperrten Add-ons darf mitzählen,
    // obwohl `value` sie (defensiv getestet) auf true stehen hat.
    expect(html).toContain("19,90 €");
    expect(html).not.toContain("29,80 €");

    const disabledMatches = html.match(/disabled=""/g) ?? [];
    expect(disabledMatches.length).toBe(3);
  });

  test("bindbare Add-ons sind umschaltbar und als aktiv markiert", () => {
    const html = renderToStaticMarkup(
      <AddonsList
        value={{ contactForm: true }}
        onToggle={() => {}}
        interval="monthly"
      />
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });
});
