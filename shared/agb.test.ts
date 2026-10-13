import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  AGB_PROVIDER,
  AGB_SECTIONS,
  AGB_VERSION,
  CHECKOUT_CONSENT_TEXT,
  agbToMarkdown,
} from "./agb";
import { PRICE_MONTHLY, PRICE_YEARLY } from "./pricingText";
import { ADDON_KEYS, ADDON_NAMES, TRIAL_DAYS } from "./pricing";

const ROOT = path.resolve(import.meta.dirname, "..");

describe("AGB-Daten", () => {
  test("Fassung ist ein ISO-Datum", () => {
    expect(AGB_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("Checkout-Häkchen: B2B + AGB in einem Satz", () => {
    expect(CHECKOUT_CONSENT_TEXT).toBe(
      "Ich bestelle als Unternehmer oder Selbstständiger (§ 14 BGB) und akzeptiere die AGB."
    );
  });

  test("Anbieter = Impressum (Name, Anschrift, USt-IdNr.)", () => {
    const impressum = fs.readFileSync(
      path.join(ROOT, "client/src/pages/PageblitzImpressum.tsx"),
      "utf-8"
    );
    for (const value of [
      AGB_PROVIDER.owner,
      AGB_PROVIDER.street,
      AGB_PROVIDER.zipCity,
      AGB_PROVIDER.vatId,
      AGB_PROVIDER.email,
    ]) {
      expect(impressum).toContain(value);
    }
  });

  test("Querverweise zeigen auf die richtigen Paragraphen", () => {
    const ids = AGB_SECTIONS.map(s => s.id);
    // § 3 Abs. 3 = Extras, § 13 = Rechtstexte der Kundenwebsite
    expect(ids[2]).toBe("leistungen");
    expect(AGB_SECTIONS[2].paragraphs[2]).toMatch(/^Gegen gesondertes Entgelt/);
    expect(ids[12]).toBe("rechtstexte");
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("Preise, Testtage und alle Extras kommen aus der Preisquelle", () => {
    const md = agbToMarkdown();
    expect(md).toContain(`Jahrestarif ${PRICE_YEARLY} pro Monat`);
    expect(md).toContain(`Monatstarif ${PRICE_MONTHLY} pro Monat`);
    expect(md).toContain(`Die ersten ${TRIAL_DAYS} Tage`);
    for (const key of ADDON_KEYS) expect(md).toContain(ADDON_NAMES[key]);
  });

  test("Kernregeln Laufzeit/Kündigung stehen drin", () => {
    const md = agbToMarkdown();
    expect(md).toContain("Die Mindestlaufzeit beträgt 12 Monate");
    expect(md).toContain("spätestens 1 Monat vor Ablauf");
    expect(md).toContain("zum Ende des laufenden Abrechnungsmonats");
    expect(md).toContain("Verträge mit Verbrauchern (§ 13 BGB) schließt der Anbieter nicht");
  });

  test("docs/agb-entwurf.md enthält exakt den aktuellen AGB-Text", () => {
    const doc = fs.readFileSync(path.join(ROOT, "docs/agb-entwurf.md"), "utf-8");
    expect(
      doc.includes(agbToMarkdown()),
      "docs/agb-entwurf.md ist veraltet — Text unterhalb der Markierung mit agbToMarkdown() neu erzeugen"
    ).toBe(true);
  });
});
