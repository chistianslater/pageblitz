import { describe, expect, test } from "vitest";
import { blueprintFor } from "../../../../../../shared/blueprints/blueprints";
import {
  dockPair,
  entryTop,
  entryVariant,
  factPills,
  freundlichActions,
  MAX_PILLS,
  monogramOf,
  ratingPill,
  shortLabel,
  splitHeadline,
  todayPill,
} from "./facts";
import {
  fellfreundeDoc,
  gelatoDoc,
  pusteblumeDoc,
  TEST_NOW,
  withComposition,
  withContact,
  type Doc,
} from "./testkit";

const bp = (d: Doc) =>
  blueprintFor(d.businessCategory, d.businessName, d.blueprintFamily);
const heroOf = (d: Doc) => d.sections.find(s => s.type === "hero") as Extract<
  Doc["sections"][number],
  { type: "hero" }
>;
const hidden = (d: Doc): Doc => ({
  ...d,
  designProfile: { ...d.designProfile!, hiddenElements: ["hero-media"] },
});

describe("Einstieg nach Fotolage (Systemblatt 6)", () => {
  test.each([
    ["Foto + Prüfung gut (stage)", fellfreundeDoc(), "photo"],
    ["Foto + Prüfung mittel", gelatoDoc(), "small"],
    ["gutes Foto, aber kein Querformat", withComposition(fellfreundeDoc(), "portrait"), "small"],
    ["kein Foto", pusteblumeDoc(), "plain"],
    ["Foto im Studio ausgeblendet", hidden(fellfreundeDoc()), "plain"],
  ] as const)("%s → %s", (_, doc, variant) => {
    expect(entryVariant(doc, heroOf(doc))).toBe(variant);
  });
});

describe("Pille über dem Titel nur mit Ort", () => {
  test("mit Ort: Pille, Branche nur, wenn der Name sie nicht nennt", () => {
    const f = fellfreundeDoc();
    expect(entryTop(f, bp(f))).toMatchObject({
      name: "Fellfreunde",
      branch: "Hundesalon",
      city: "Leipzig-Gohlis",
      pill: true,
    });
    const k = pusteblumeDoc();
    const top = entryTop(k, bp(k));
    expect(top).toMatchObject({
      name: "Kita Pusteblume",
      city: "Bremen-Findorff",
      pill: true,
    });
    expect(top.branch).toBeUndefined();
  });
  test("ohne Ort: keine Pille (nichts erfunden)", () => {
    const d = withContact(fellfreundeDoc(), { city: undefined });
    expect(entryTop(d, bp(d)).pill).toBe(false);
    expect(entryTop(d, bp(d)).city).toBeUndefined();
    expect(entryTop(d, bp(d)).branch).toBe("Hundesalon");
  });
});

describe("große Zeile: zweiter Satzteil in Akzent", () => {
  test.each([
    ["Frisch gebürstet, ganz entspannt.", "Frisch gebürstet,", "ganz entspannt."],
    ["Klein, warm, mitten im Viertel.", "Klein, warm,", "mitten im Viertel."],
    ["Hausgemachtes Eis am Wasser.", "Hausgemachtes Eis", "am Wasser."],
    ["Gute Pfoten – gute Laune", "Gute Pfoten –", "gute Laune"],
  ])("%s", (text, lead, rest) => {
    expect(splitHeadline(text)).toEqual({ lead, rest });
  });
  test.each([
    ["Praxis Dr. Sommer für die ganze Familie", "Praxis Dr. Sommer für die", "ganze Familie"],
    ["Alles fürs Tier, z. B. Futter und Spielzeug", "Alles fürs Tier,", "z. B. Futter und Spielzeug"],
    ["Eis seit 1998. Jeden Tag frisch", "Eis seit 1998.", "Jeden Tag frisch"],
    ["Gelato Nr. 1 am Ufer", "Gelato Nr. 1", "am Ufer"],
  ])("Abkürzungen teilen nicht: %s", (text, lead, rest) => {
    expect(splitHeadline(text)).toEqual({ lead, rest });
  });
  test("Punkt vor Kleinbuchstaben teilt nicht", () => {
    // Kein gültiger Satzschluss → Rückfall: die letzten zwei Wörter.
    expect(splitHeadline("Gewaschen. dann gekämmt und gebürstet")).toEqual({
      lead: "Gewaschen. dann gekämmt",
      rest: "und gebürstet",
    });
  });
  test("kurz und ohne Satzzeichen: keine Teilung", () => {
    expect(splitHeadline("Willkommen bei uns")).toEqual({ lead: "Willkommen bei uns" });
  });
});

describe("Faktenpillen nur aus Daten", () => {
  const hours = (h: string) => [{ day: "Do", hours: h }];
  test("Heute: Ende der letzten Spanne, geschlossen, rund um die Uhr", () => {
    expect(todayPill(hours("9:00 – 18:00"), TEST_NOW)?.label).toBe("Heute bis 18 Uhr");
    expect(todayPill(hours("7:30 – 16:30"), TEST_NOW)?.label).toBe("Heute bis 16:30 Uhr");
    expect(todayPill(hours("8:00 – 12:00, 14:00 – 18:30"), TEST_NOW)?.label).toBe(
      "Heute bis 18:30 Uhr"
    );
    expect(todayPill(hours("geschlossen"), TEST_NOW)?.label).toBe("Heute geschlossen");
    expect(todayPill([{ day: "Fr", hours: "9:00 – 18:00" }], TEST_NOW)).toBeUndefined();
    expect(todayPill(undefined, TEST_NOW)).toBeUndefined();
  });
  test("Google-Note erst ab 20 Bewertungen", () => {
    const d = fellfreundeDoc();
    expect(ratingPill({ ...d, google: { rating: 4.9, reviewCount: 19 } })).toBeUndefined();
    expect(ratingPill({ ...d, google: { rating: 4.9, reviewCount: 20 } })).toMatchObject({
      label: "4,9 · 20 Bewertungen",
      sr: "4,9 von 5 Sternen bei 20 Google-Bewertungen",
    });
    expect(ratingPill({ ...d, google: undefined })).toBeUndefined();
  });
  test("Reihenfolge Heute → Note → Ausstattung → Adresse, höchstens drei", () => {
    expect(factPills(gelatoDoc(), TEST_NOW, true).map(p => p.label)).toEqual([
      "Heute bis 21 Uhr",
      "4,7 · 312 Bewertungen",
      "Zum Mitnehmen",
    ]);
    expect(factPills(fellfreundeDoc(), TEST_NOW, true)).toHaveLength(MAX_PILLS);
    expect(factPills(pusteblumeDoc(), TEST_NOW, true).map(p => p.label)).toEqual([
      "Heute bis 16:30 Uhr",
      "Hemmstraße 12",
    ]);
  });
  test("ohne Daten keine Pillen; Ort nur, wenn die Pille oben ihn nicht nennt", () => {
    const bare: Doc = withContact(
      { ...fellfreundeDoc(), google: undefined, amenities: undefined },
      { street: undefined, openingHours: undefined }
    );
    expect(factPills(bare, TEST_NOW, true)).toEqual([]);
    expect(factPills(bare, TEST_NOW, false).map(p => p.label)).toEqual(["Leipzig-Gohlis"]);
  });
  test("Ausstattung nur bei true", () => {
    const d: Doc = {
      ...pusteblumeDoc(),
      amenities: { wheelchair: false, takeout: true },
    };
    expect(factPills(d, TEST_NOW, true).map(p => p.label)).toContain("Zum Mitnehmen");
    expect(factPills(d, TEST_NOW, true).map(p => p.label)).not.toContain(
      "Barrierefreier Zugang"
    );
  });
});

describe("Wege und Leiste", () => {
  test("Kurzformen", () => {
    expect(shortLabel("Termin anfragen")).toBe("Termin");
    expect(shortLabel("Platz anfragen")).toBe("Anfragen");
    expect(shortLabel("Route planen")).toBe("Route");
    expect(shortLabel("Anrufen")).toBe("Anrufen");
  });
  test("Leiste: links Anrufen, rechts Hauptweg kurz", () => {
    const d = fellfreundeDoc();
    const pair = dockPair(freundlichActions(d, bp(d)));
    expect(pair?.left?.label).toBe("Anrufen");
    expect(pair?.left?.href).toMatch(/^tel:/);
    expect(pair?.main.label).toBe("Termin");
  });
  test("ruft der Hauptweg an, steht links der zweite Weg", () => {
    const pair = dockPair({
      primary: { label: "Anrufen", href: "tel:+495551" },
      second: { label: "Route", href: "https://www.google.com/maps/x" },
      phone: { label: "0555 1", href: "tel:+495551" },
    });
    expect(pair).toEqual({
      left: { label: "Route", href: "https://www.google.com/maps/x" },
      main: { label: "Anrufen", href: "tel:+495551" },
    });
  });
  test("Zeichen im Logo", () => {
    expect(monogramOf("Kita Pusteblume")).toBe("K");
    expect(monogramOf("„1A Eis“")).toBe("1");
  });
});
