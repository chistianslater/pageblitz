import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  removalRule,
  withRestoredSection,
  withoutSection,
} from "./sectionRemoval";

const doc = {
  version: 2,
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    {
      type: "usp",
      headline: "Darum wir",
      items: [{ title: "a" }, { title: "b" }],
    },
    { type: "gallery", images: [{ url: "https://x/1.jpg", alt: "Werkstatt" }] },
    { type: "contact", phone: "0231 1" },
  ],
  sectionOrder: ["hero", "gallery", "usp", "contact"],
  hiddenSections: ["usp"],
} as unknown as WebsiteDataV2;

describe("removalRule", () => {
  test("Einstieg und Kontakt sind Pflicht — mit Begründung", () => {
    const hero = removalRule("hero");
    const contact = removalRule("contact");
    expect(hero.allowed).toBe(false);
    expect(contact.allowed).toBe(false);
    if (hero.allowed || contact.allowed) throw new Error("unreachable");
    expect(hero.reason).toMatch(/Einstieg/);
    expect(contact.reason).toMatch(/Kontakt/);
  });

  test("freie Abschnitte lassen sich entfernen, ohne Extra-Hinweis", () => {
    expect(removalRule("usp")).toEqual({ allowed: true });
    expect(removalRule("story", { gallery: true })).toEqual({ allowed: true });
  });

  test("gebuchtes Extra bleibt gebucht — Hinweis statt Kündigung", () => {
    const rule = removalRule("gallery", { gallery: true });
    expect(rule.allowed).toBe(true);
    if (!rule.allowed) throw new Error("unreachable");
    expect(rule.addonNote).toMatch(/Bildergalerie.*bleibt gebucht/);
  });

  test("Extra-Abschnitt ohne Buchung: kein Hinweis", () => {
    expect(removalRule("gallery", {})).toEqual({ allowed: true });
  });
});

describe("withoutSection", () => {
  test("entfernt Abschnitt, Reihenfolge- und Ausblende-Eintrag", () => {
    const next = withoutSection(doc, "usp");
    expect(next.sections.map(s => s.type)).toEqual([
      "hero",
      "gallery",
      "contact",
    ]);
    expect(next.sectionOrder).toEqual(["hero", "gallery", "contact"]);
    expect(next.hiddenSections).toBeUndefined();
  });

  test("lässt das Original unverändert", () => {
    withoutSection(doc, "usp");
    expect(doc.sections).toHaveLength(4);
    expect(doc.sectionOrder).toHaveLength(4);
  });

  test("Pflicht-Abschnitt → Fehler", () => {
    expect(() => withoutSection(doc, "hero")).toThrow(/Einstieg/);
  });

  test("fehlender Abschnitt → Fehler", () => {
    expect(() => withoutSection(doc, "faq")).toThrow(/nicht auf der Seite/);
  });
});

describe("withRestoredSection", () => {
  test("holt Inhalt, Position und Ausblendung aus dem alten Stand zurück", () => {
    const removed = withoutSection(doc, "usp");
    const restored = withRestoredSection(removed, doc, "usp");
    expect(restored.sections.find(s => s.type === "usp")).toEqual(
      doc.sections[1]
    );
    expect(restored.sectionOrder).toEqual([
      "hero",
      "gallery",
      "usp",
      "contact",
    ]);
    expect(restored.hiddenSections).toEqual(["usp"]);
  });

  test("Nachbar fehlt inzwischen → nächster vorhandener Vorgänger", () => {
    const removed = withoutSection(withoutSection(doc, "usp"), "gallery");
    const restored = withRestoredSection(removed, doc, "usp");
    expect(restored.sectionOrder).toEqual(["hero", "usp", "contact"]);
  });

  test("Abschnitt schon da → Fehler", () => {
    expect(() => withRestoredSection(doc, doc, "usp")).toThrow(/schon/);
  });

  test("alter Stand ohne den Abschnitt → Fehler", () => {
    const removed = withoutSection(doc, "usp");
    expect(() => withRestoredSection(removed, removed, "usp")).toThrow(
      /nicht mehr/
    );
  });
});
