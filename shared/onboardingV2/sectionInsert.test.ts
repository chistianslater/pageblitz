import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../siteContract/types";
import {
  INSERTABLE_SECTION_TYPES,
  INSERT_META,
  insertCandidates,
  insertSectionMessage,
  orderWithInsert,
  insertAddonCandidates,
} from "./sectionInsert";

const doc: WebsiteDataV2 = {
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections: [
    { type: "hero", headline: "H" },
    { type: "services", headline: "L", items: [{ title: "A" }] },
    { type: "about", headline: "Ü", body: "B" },
    { type: "quote", text: "Z" },
    { type: "contact" },
  ],
};

describe("Sektion einfügen (Plus-Zonen, 2026-09-03)", () => {
  test("sechs faktenfreie Typen mit Label und Erklärung", () => {
    expect(INSERTABLE_SECTION_TYPES).toEqual([
      "story",
      "usp",
      "notice",
      "stats",
      "process",
      "quote",
    ]);
    for (const type of INSERTABLE_SECTION_TYPES) {
      expect(INSERT_META[type].label.length).toBeGreaterThan(2);
      expect(INSERT_META[type].hint.length).toBeGreaterThan(10);
    }
  });

  test("Kandidaten markieren, was die Seite schon hat", () => {
    const list = insertCandidates(doc);
    expect(list.map(c => c.type)).toEqual([...INSERTABLE_SECTION_TYPES]);
    expect(list.find(c => c.type === "quote")?.present).toBe(true);
    expect(list.find(c => c.type === "process")?.present).toBe(false);
  });

  test("orderWithInsert setzt den neuen Typ direkt hinter die Ziel-Sektion (Dokument-Reihenfolge)", () => {
    expect(orderWithInsert(doc, "process", "services")).toEqual([
      "hero",
      "services",
      "process",
      "about",
      "quote",
      "contact",
    ]);
  });

  test("orderWithInsert respektiert eine eigene Reihenfolge und verschiebt einen schon vorhandenen Typ", () => {
    const ordered = {
      ...doc,
      sectionOrder: ["hero", "about", "services", "quote", "contact"] as const,
    };
    expect(orderWithInsert(ordered as WebsiteDataV2, "quote", "hero")).toEqual([
      "hero",
      "quote",
      "about",
      "services",
      "contact",
    ]);
  });

  test("orderWithInsert: unbekannte Ziel-Sektion → null; hinter contact nicht erlaubt", () => {
    expect(orderWithInsert(doc, "process", "gallery")).toBeNull();
    expect(orderWithInsert(doc, "process", "contact")).toBeNull();
  });

  test("Einfüge-Wunsch nennt Typ und Position und schützt Fakten", () => {
    const msg = insertSectionMessage("process", "services");
    expect(msg).toMatch(/Ablauf/);
    expect(msg).toMatch(/Leistungen/);
    expect(msg).toMatch(/erfinde|belegt|Fakten/i);
    expect(msg.length).toBeLessThanOrEqual(500);
  });
});

describe("insertAddonCandidates (kostenpflichtige Extras im Einfügen-Dialog, 2026-09-04)", () => {
  test("bietet genau die vier Sektions-Extras mit Preis an", () => {
    const list = insertAddonCandidates({});
    expect(list.map(c => c.key)).toEqual([
      "gallery",
      "team",
      "menu",
      "pricelist",
    ]);
    expect(list.every(c => c.priceLabel === "3,90 €")).toBe(true);
    expect(list.every(c => c.hint.length > 0)).toBe(true);
    expect(list.map(c => c.label)).toContain("Bildergalerie");
  });

  test("bereits gebuchte Extras sind als aktiv markiert", () => {
    const list = insertAddonCandidates({ gallery: true });
    expect(list.find(c => c.key === "gallery")?.active).toBe(true);
    expect(list.find(c => c.key === "team")?.active).toBe(false);
  });

  test("nur echte Sektionen — kein KI-Chat, keine Buchung, keine Unterseiten", () => {
    const keys = insertAddonCandidates({}).map(c => String(c.key));
    for (const fremd of ["aiChat", "booking", "subpages", "contactForm"]) {
      expect(keys).not.toContain(fremd);
    }
  });
});
