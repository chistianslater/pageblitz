import { describe, expect, test } from "vitest";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import {
  entryHeadline,
  entryVariant,
  factChips,
  hoursLabel,
  klarActions,
  monogram,
  ratingFact,
  shortLabel,
} from "./facts";
import {
  kanzleiDoc,
  patchSection,
  physioDoc,
  withComposition,
  withContact,
  withUsp,
  without,
  zahnDoc,
  type Doc,
} from "./testkit";

const bp = (doc: Doc) => blueprintFor(doc.businessCategory, doc.businessName);
const heroOf = (doc: Doc) => doc.sections.find(s => s.type === "hero")! as Extract<
  Doc["sections"][number],
  { type: "hero" }
>;
const variant = (doc: Doc) => entryVariant(doc, heroOf(doc));
const hideHeroMedia = (doc: Doc): Doc => ({
  ...doc,
  designProfile: { ...doc.designProfile!, hiddenElements: ["hero-media"] },
});
const noPhoto = (doc: Doc) =>
  patchSection(doc, "hero", h => {
    const { imageUrl: _drop, ...rest } = h;
    return rest;
  });

describe("Klar: Entscheidungstabelle Einstieg", () => {
  test("großes Querformat → Foto im weichen Rahmen (mit Heute-Karte)", () => {
    expect(variant(zahnDoc())).toBe("photo");
  });
  test("schwaches/Hochformat-Foto → kleines Foto neben der Zeiten-Karte", () => {
    expect(variant(physioDoc())).toBe("small");
    expect(variant(withComposition(zahnDoc(), "portrait"))).toBe("small");
  });
  test("kein Foto → Zeiten-Tabelle trägt den Einstieg", () => {
    expect(variant(kanzleiDoc())).toBe("hours");
    expect(variant(hideHeroMedia(zahnDoc()))).toBe("hours");
  });
  test("weder Foto noch echte Zeiten → nur Text", () => {
    expect(variant(withContact(kanzleiDoc(), { openingHours: [] }))).toBe("text");
  });
  test("ein brauchbares Foto fällt nie weg, auch ohne Zeiten", () => {
    expect(variant(withContact(zahnDoc(), { openingHours: [] }))).toBe("photo");
    expect(variant(withContact(physioDoc(), { openingHours: [] }))).toBe("small");
  });
});

describe("Klar: Überschrift", () => {
  test("Überschrift trägt, wenn sie nicht nur Kicker oder Namen wiederholt", () => {
    const doc = zahnDoc();
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBe("Gut aufgehoben. Von Anfang an.");
  });
  test("Doppel des Kickers → Tagline, sonst keine (der Name trägt)", () => {
    let doc = patchSection(zahnDoc(), "hero", h => ({
      ...h,
      headline: "Zahnarztpraxis in Lüneburg",
    }));
    doc = { ...doc, tagline: "Behutsam von Anfang an." };
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBe("Behutsam von Anfang an.");
    doc = { ...doc, tagline: undefined };
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBeUndefined();
  });
});

describe("Klar: Wege (Termin + Telefon)", () => {
  test("Praxis mit Anruf-Bauplan: Termin zum Kontakt, Telefon als zweiter Knopf", () => {
    const doc = zahnDoc();
    const a = klarActions(doc, bp(doc));
    expect(a.primary).toEqual({ label: "Termin vereinbaren", href: "#kontakt" });
    expect(a.second).toEqual({ label: "04131 555 0142", href: "tel:041315550142" });
    expect(a.phone?.href).toBe("tel:041315550142");
  });
  test("eigener Buchungslink im Einstieg gewinnt", () => {
    const doc = patchSection(zahnDoc(), "hero", h => ({
      ...h,
      ctaHref: "https://termine.example/sommer",
    }));
    expect(klarActions(doc, bp(doc)).primary?.href).toBe("https://termine.example/sommer");
  });
  test("ohne sichtbaren Kontakt: Hauptknopf ruft an, daneben Route oder nichts", () => {
    const doc = without(zahnDoc(), "contact");
    const a = klarActions(doc, bp(doc));
    expect(a.primary).toBeUndefined();
    expect(a.second).toBeUndefined();
  });
  test("Anker-Präfix für Unterseiten", () => {
    const doc = kanzleiDoc();
    expect(klarActions(doc, bp(doc), "/site/x").primary?.href).toBe("/site/x#kontakt");
  });
  test("Kurzform für Kopf und Leiste", () => {
    expect(shortLabel("Termin vereinbaren")).toBe("Termin");
    expect(shortLabel("Erstgespräch vereinbaren")).toBe("Erstgespräch");
    expect(shortLabel("Termin anfragen")).toBe("Termin");
    expect(shortLabel("Jetzt anrufen")).toBe("Jetzt anrufen");
  });
});

describe("Klar: Fakten-Chips nur aus Daten", () => {
  test("Vorteile/Leistungen wörtlich (Liste), Barrierefreiheit aus dem Google-Profil", () => {
    expect(factChips(zahnDoc()).map(c => c.label)).toEqual([
      "Alle Kassen",
      "Privat",
      "Barrierefreier Zugang",
    ]);
    expect(factChips(physioDoc()).map(c => [c.label, c.icon])).toEqual([
      ["Alle Kassen", "card"],
      ["Privat", "card"],
      ["Hausbesuche", "car"],
    ]);
  });
  test("ohne Daten keine Chips (auch nicht aus Fließtext)", () => {
    expect(factChips(kanzleiDoc())).toEqual([]);
    const prose = withUsp(kanzleiDoc(), [
      "Wir nehmen alle Kassen",
      "Hausbesuche nach Absprache möglich",
    ]);
    expect(factChips(prose)).toEqual([]);
  });
  test("ausgeblendeter Abschnitt liefert keine Chips; wheelchair=false auch nicht", () => {
    let doc = zahnDoc();
    doc = { ...doc, hiddenSections: ["usp"], amenities: { wheelchair: false } };
    expect(factChips(doc)).toEqual([]);
  });
  test("höchstens vier, ohne Doppel", () => {
    const doc = withUsp(zahnDoc(), ["Privat", "privat", "Hausbesuche", "Selbstzahler", "Alle Kassen"]);
    expect(factChips(doc).map(c => c.label)).toEqual([
      "Privat",
      "Hausbesuche",
      "Selbstzahler",
      "Alle Kassen",
    ]);
  });
});

describe("Klar: Bewertung, Monogramm, Zeiten-Titel", () => {
  test("Bewertung nur mit echten Zahlen", () => {
    expect(ratingFact(zahnDoc())).toEqual({ value: "4,8", text: "von 5 · 212 Google-Bewertungen" });
    expect(ratingFact(physioDoc())).toBeUndefined();
    expect(ratingFact({ ...zahnDoc(), google: { rating: 5, reviewCount: 1 } })?.text).toBe(
      "von 5 · 1 Google-Bewertung"
    );
  });
  test("Monogramm: Anfangsbuchstabe des Familiennamens", () => {
    expect(monogram("Zahnarztpraxis Dr. Sommer")).toBe("S");
    expect(monogram("Physiotherapie Lindner")).toBe("L");
    expect(monogram("Steuerkanzlei Brandt")).toBe("B");
    expect(monogram("Praxis am Markt & Söhne")).toBe("S");
    expect(monogram("123")).toBe("1");
  });
  test("Zeiten-Titel: Bauplan, Beratung → Bürozeiten, sonst Öffnungszeiten", () => {
    expect(hoursLabel(bp(zahnDoc()))).toBe("Sprechzeiten");
    expect(hoursLabel(bp(kanzleiDoc()))).toBe("Bürozeiten");
    expect(hoursLabel(blueprintFor("Bäckerei", "Bäckerei Kurz"))).toBe("Öffnungszeiten");
  });
});
