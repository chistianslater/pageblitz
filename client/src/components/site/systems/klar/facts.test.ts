import { describe, expect, test } from "vitest";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import {
  entryHeadline,
  entryVariant,
  factChips,
  hoursLabel,
  klarActions,
  monogram,
  pillTail,
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
const heroOf = (doc: Doc) =>
  doc.sections.find(s => s.type === "hero")! as Extract<
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
    expect(variant(withContact(kanzleiDoc(), { openingHours: [] }))).toBe(
      "text"
    );
  });
  test("ein brauchbares Foto fällt nie weg, auch ohne Zeiten", () => {
    expect(variant(withContact(zahnDoc(), { openingHours: [] }))).toBe("photo");
    expect(variant(withContact(physioDoc(), { openingHours: [] }))).toBe(
      "small"
    );
  });
});

describe("Klar: Überschrift", () => {
  test("Überschrift trägt, wenn sie nicht nur Kicker oder Namen wiederholt", () => {
    const doc = zahnDoc();
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBe(
      "Gut aufgehoben. Von Anfang an."
    );
  });
  test("Doppel des Kickers → Tagline, sonst keine (der Name trägt)", () => {
    let doc = patchSection(zahnDoc(), "hero", h => ({
      ...h,
      headline: "Zahnarztpraxis in Lüneburg",
    }));
    doc = { ...doc, tagline: "Behutsam von Anfang an." };
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBe(
      "Behutsam von Anfang an."
    );
    doc = { ...doc, tagline: undefined };
    expect(entryHeadline(heroOf(doc), doc, bp(doc))).toBeUndefined();
  });
});

describe("Klar: Wege (Reihenfolge laut Entscheid)", () => {
  const withForm = (doc: Doc): Doc => ({ ...doc, features: { ...doc.features, contactForm: true } });
  const TEL = "tel:041315550142";
  /** Zahnarzt ohne gebuchtes Kontaktformular. */
  const noForm = (): Doc => ({ ...zahnDoc(), features: { ...zahnDoc().features, contactForm: false } });
  const ROUTE = "https://www.google.com/maps/search/?api=1&query=Lindenweg%2012%2C%2021335%20L%C3%BCneburg";

  test("1. eigener http(s)-Buchungslink gewinnt; Telefon als zweiter Knopf", () => {
    const doc = patchSection(withForm(zahnDoc()), "hero", h => ({
      ...h,
      ctaHref: "https://termine.example/sommer",
    }));
    const a = klarActions(doc, bp(doc));
    expect(a.primary).toEqual({ label: "Termin vereinbaren", href: "https://termine.example/sommer" });
    expect(a.second).toEqual({ label: "04131 555 0142", href: TEL });
  });
  test("ein Anker als ctaHref ist kein Buchungslink", () => {
    const doc = patchSection(noForm(), "hero", h => ({ ...h, ctaHref: "#leistungen" }));
    expect(klarActions(doc, bp(doc)).primary?.href).toBe(TEL);
  });
  test("2. #kontakt nur mit Kontaktformular und sichtbarem Kontakt (Präfix auf Unterseiten)", () => {
    const doc = withForm(zahnDoc());
    expect(klarActions(doc, bp(doc)).primary).toEqual({ label: "Termin vereinbaren", href: "#kontakt" });
    expect(klarActions(doc, bp(doc), "/site/x").primary?.href).toBe("/site/x#kontakt");
    expect(klarActions(doc, bp(doc)).second?.href).toBe(TEL);
    const hidden: Doc = { ...doc, hiddenSections: ["contact"] };
    expect(klarActions(hidden, bp(hidden)).primary).toBeUndefined();
  });
  test("3. Bauplan tel: Hauptknopf ruft an (Text bleibt), zweiter Knopf Route statt Nummer", () => {
    const doc = noForm();
    const a = klarActions(doc, bp(doc));
    expect(a.primary).toEqual({ label: "Termin vereinbaren", href: TEL });
    expect(a.second).toEqual({ label: "Route", href: ROUTE });
    expect(a.phone?.href).toBe(TEL);
  });
  test("3. Bauplan route: Karte, Telefon daneben", () => {
    const doc = patchSection(noForm(), "hero", h => ({ ...h, ctaText: undefined }));
    const route = { ...bp(doc), ctaAction: "route" as const, ctaText: "Route planen" };
    const a = klarActions(doc, route);
    expect(a.primary).toEqual({ label: "Route planen", href: ROUTE });
    expect(a.second?.href).toBe(TEL);
  });
  test("4. ohne Bauplan-Aktion: Anruf; ohne Adresse E-Mail als zweiter Knopf", () => {
    const doc = withContact(kanzleiDoc(), { street: undefined, zip: undefined, city: undefined });
    const a = klarActions(doc, bp(doc));
    // Ruft der Knopf an, sagt er das (Nacht N0) — nicht „Erstgespräch vereinbaren“.
    expect(a.primary).toEqual({ label: "Anrufen", href: "tel:051215550119" });
    expect(a.second).toEqual({ label: "E-Mail", href: "mailto:kanzlei@brandt-steuer.example" });
  });
  test("tel-Ziel: Beschriftung sagt Anruf bzw. Termin (Nacht N0)", () => {
    const ki = (doc: Doc, text: string) => patchSection(doc, "hero", h => ({ ...h, ctaText: text }));
    // Gesundheit: „Termin vereinbaren“ statt KI-Text.
    const zahn = ki(noForm(), "Jetzt Beratung buchen");
    expect(klarActions(zahn, bp(zahn)).primary).toEqual({ label: "Termin vereinbaren", href: TEL });
    // Andere Branchen: „Anrufen“.
    const kanzlei = ki(kanzleiDoc(), "Mandat anfragen");
    expect(klarActions(kanzlei, bp(kanzlei)).primary).toEqual({ label: "Anrufen", href: "tel:051215550119" });
    // Sagt die Beschriftung es schon, bleibt sie.
    for (const text of ["Jetzt anrufen", "Rückruf? Einfach anrufen", "Termin buchen", "Kennenlerntermin"]) {
      const doc = ki(kanzleiDoc(), text);
      expect(klarActions(doc, bp(doc)).primary?.label, text).toBe(text);
    }
    // Fester Anruf-Text des Bauplans (Gastro, ctaAction tel) bleibt.
    const gastro = { ...bp(kanzleiDoc()), id: "gastro" as const, ctaAction: "tel" as const, ctaText: "Tisch reservieren" };
    const tisch = ki(kanzleiDoc(), "Tisch reservieren");
    expect(klarActions(tisch, gastro).primary?.label).toBe("Tisch reservieren");
    expect(klarActions(ki(kanzleiDoc(), "Jetzt Platz sichern"), gastro).primary?.label).toBe("Anrufen");
    // Andere Ziele behalten den eigenen Text.
    const link = patchSection(ki(noForm(), "Online buchen"), "hero", h => ({ ...h, ctaHref: "https://termine.example/x" }));
    expect(klarActions(link, bp(link)).primary?.label).toBe("Online buchen");
  });
  test("ohne eigenen Text: „Anrufen“ beim Anruf", () => {
    const doc = patchSection(kanzleiDoc(), "hero", h => ({ ...h, ctaText: undefined }));
    expect(klarActions(doc, { ...bp(doc), ctaText: undefined }).primary?.label).toBe("Anrufen");
  });
  test("ohne Telefon: #kontakt (sichtbar), sonst nichts", () => {
    const doc = withContact(noForm(), { phone: undefined });
    expect(klarActions(doc, bp(doc)).primary?.href).toBe("#kontakt");
    const none = without(zahnDoc(), "contact");
    expect(klarActions(none, bp(none))).toEqual({ phone: undefined });
  });
  test("Kurzform für Kopf und Leiste", () => {
    expect(shortLabel("Termin vereinbaren")).toBe("Termin");
    expect(shortLabel("Erstgespräch vereinbaren")).toBe("Erstgespräch");
    expect(shortLabel("Termin anfragen")).toBe("Termin");
    expect(shortLabel("Jetzt anrufen")).toBe("Jetzt anrufen");
  });
});

describe("Klar: Pille", () => {
  test("Branche nur, wenn der Name sie nicht nennt; Ort mit „in“", () => {
    expect(pillTail("Zahnarztpraxis Dr. Sommer", "Zahnarztpraxis", "Lüneburg")).toBe(" in Lüneburg");
    expect(pillTail("Steuerkanzlei Brandt", "Steuerberater", "Hildesheim")).toBe("\u00a0· Steuerberater in Hildesheim");
    expect(pillTail("Brandt", "Steuerberater", undefined)).toBe("\u00a0· Steuerberater");
    expect(pillTail("Brandt", undefined, undefined)).toBe("");
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
    const doc = withUsp(zahnDoc(), [
      "Privat",
      "privat",
      "Hausbesuche",
      "Selbstzahler",
      "Alle Kassen",
    ]);
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
    expect(ratingFact(zahnDoc())).toEqual({
      value: "4,8",
      text: "von 5 · 212 Google-Bewertungen",
    });
    expect(ratingFact(physioDoc())).toBeUndefined();
    expect(
      ratingFact({ ...zahnDoc(), google: { rating: 5, reviewCount: 1 } })?.text
    ).toBe("von 5 · 1 Google-Bewertung");
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
    expect(hoursLabel(blueprintFor("Bäckerei", "Bäckerei Kurz"))).toBe(
      "Öffnungszeiten"
    );
  });
});
