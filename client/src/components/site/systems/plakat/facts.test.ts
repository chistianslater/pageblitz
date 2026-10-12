import { describe, expect, test } from "vitest";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import {
  entryFacts,
  entryHeadline,
  entrySticker,
  entryVariant,
  plakatActions,
  priceValue,
  tickerItems,
} from "./facts";
import { lateClose, statusLine, sundayOpen } from "./hours";
import {
  TEST_NOW,
  eckeDoc,
  kanteDoc,
  patchSection,
  pulsDoc,
  without,
  withContact,
} from "./testkit";

type Doc = ReturnType<typeof kanteDoc>;
const bp = (d: Doc) => blueprintFor(d.businessCategory, d.businessName, d.blueprintFamily);
const hero = (d: Doc) => d.sections.find(s => s.type === "hero") as Extract<Doc["sections"][number], { type: "hero" }>;

/** Dokument ohne jede Sticker-Quelle. */
function bare(doc: Doc): Doc {
  const { google: _g, amenities: _a, ...rest } = doc;
  return withContact(without(rest as Doc, "pricelist", "menu", "services"), {
    openingHours: [{ day: "Mo–Fr", hours: "9:00 – 17:00" }],
  });
}

describe("Plakat: Einstiegs-Fassung (Entscheidungstabelle)", () => {
  test("Barbier mit Foto → Bogen, Imbiss mit Foto → Kreis, ohne Foto → Schrift", () => {
    expect(entryVariant(kanteDoc(), hero(kanteDoc()), bp(kanteDoc()))).toBe("arch");
    expect(entryVariant(eckeDoc(), hero(eckeDoc()), bp(eckeDoc()))).toBe("circle");
    expect(entryVariant(pulsDoc(), hero(pulsDoc()), bp(pulsDoc()))).toBe("type");
  });

  test("ausgeblendetes Foto (hero-media) → Schrift; vorhandenes Foto fällt nie weg", () => {
    const hidden = { ...kanteDoc(), designProfile: { hiddenElements: ["hero-media"] } } as Doc;
    expect(entryVariant(hidden, hero(hidden), bp(hidden))).toBe("type");
    // Ein Fitness-Betrieb MIT Foto bekommt den Bogen, nicht die Schrift.
    const withPhoto = patchSection(pulsDoc(), "hero", h => ({ ...h, imageUrl: "/demo/verve-hero.webp" }));
    expect(entryVariant(withPhoto, hero(withPhoto), bp(withPhoto))).toBe("arch");
  });

  test("große Zeile: eigene Überschrift; Doppel von Name/Kicker fällt weg", () => {
    expect(entryHeadline(hero(kanteDoc()), kanteDoc(), bp(kanteDoc()))).toBe("Fade, Bart, fertig.");
    // „Döner Ecke" wiederholt nur den Namen, keine Tagline → der Name trägt
    expect(entryHeadline(hero(eckeDoc()), eckeDoc(), bp(eckeDoc()))).toBeUndefined();
    const tagged = { ...eckeDoc(), tagline: "Döner, Dürüm, Pide." };
    expect(entryHeadline(hero(tagged), tagged, bp(tagged))).toBe("Döner, Dürüm, Pide.");
    // Ort allein macht kein Doppel (wie Werkstoff/Raster)
    const own = patchSection(eckeDoc(), "hero", h => ({ ...h, headline: "Spät noch Hunger am Bahnhof" }));
    expect(entryHeadline(hero(own), own, bp(own))).toBe("Spät noch Hunger am Bahnhof");
  });
});

describe("Plakat: Status-Zeile aus echten Zeiten", () => {
  test("Heute bis … offen, über Mitternacht, geschlossen, rund um die Uhr", () => {
    expect(statusLine([{ day: "Mo–Fr", hours: "10:00 – 19:00" }], TEST_NOW)).toEqual({ text: "Heute bis 19 Uhr offen", closed: false });
    expect(statusLine([{ day: "Di", hours: "11:00 – 2:00" }], TEST_NOW)?.text).toBe("Heute bis 2 Uhr offen");
    expect(statusLine([{ day: "Di", hours: "9:00 – 18:30" }], TEST_NOW)?.text).toBe("Heute bis 18:30 Uhr offen");
    expect(statusLine([{ day: "Di", hours: "Ruhetag" }], TEST_NOW)).toEqual({ text: "Heute geschlossen", closed: true });
    expect(statusLine([{ day: "Mo–So", hours: "24 Stunden geöffnet" }], TEST_NOW)?.text).toBe("Rund um die Uhr offen");
  });

  test("keine Zeile ohne echte Zeiten: Platzhalter, fehlt heute, ohne Uhrzeit", () => {
    expect(statusLine(PLACEHOLDER_OPENING_HOURS, TEST_NOW)).toBeUndefined();
    expect(statusLine(undefined, TEST_NOW)).toBeUndefined();
    expect(statusLine([{ day: "Sa", hours: "9:00 – 13:00" }], TEST_NOW)).toBeUndefined();
    expect(statusLine([{ day: "Di", hours: "nach Absprache" }], TEST_NOW)).toBeUndefined();
  });

  test("späte Schließzeit und Sonntag", () => {
    expect(lateClose([{ day: "Fr–Sa", hours: "11:00 – 2:00" }, { day: "Mo", hours: "11 – 24 Uhr" }])).toBe(120);
    expect(lateClose([{ day: "Mo–Fr", hours: "11:00 – 24:00" }])).toBeUndefined();
    expect(lateClose(PLACEHOLDER_OPENING_HOURS)).toBeUndefined();
    expect(sundayOpen([{ day: "So", hours: "12:00 – 23:00" }])).toBe(true);
    expect(sundayOpen([{ day: "So", hours: "geschlossen" }])).toBe(false);
    expect(sundayOpen([{ day: "Mo–Fr", hours: "9:00 – 17:00" }])).toBe(false);
    expect(sundayOpen(PLACEHOLDER_OPENING_HOURS)).toBe(false);
  });
});

describe("Plakat: Sticker nur aus der Allowlist", () => {
  test("Systemblatt: Kante Google, Ecke „Bis 2“, Puls „Gratis“", () => {
    expect(entrySticker(kanteDoc())).toEqual({ big: "4,9", small: "bei Google", source: "google" });
    expect(entrySticker(eckeDoc())).toEqual({ big: "Bis 2", small: "Uhr offen", source: "late" });
    expect(entrySticker(pulsDoc())).toEqual({ big: "Gratis", small: "Probetraining", source: "free" });
  });

  test("kein Fakt → kein Sticker (nie Platzhalter)", () => {
    expect(entrySticker(bare(kanteDoc()))).toBeUndefined();
    expect(entrySticker(bare(pulsDoc()))).toBeUndefined();
  });

  test("Google nur ab 4,5 und 20 Bewertungen", () => {
    const base = bare(kanteDoc());
    expect(entrySticker({ ...base, google: { rating: 4.9, reviewCount: 19 } })).toBeUndefined();
    expect(entrySticker({ ...base, google: { rating: 4.4, reviewCount: 500 } })).toBeUndefined();
    expect(entrySticker({ ...base, google: { rating: 4.5, reviewCount: 20 } })?.big).toBe("4,5");
  });

  test("Sonntag, kleinster Preis, Ausstattung — in dieser Rangfolge", () => {
    const base = bare(kanteDoc());
    const sunday = withContact(base, { openingHours: [{ day: "So", hours: "10:00 – 14:00" }] });
    expect(entrySticker(sunday)?.source).toBe("sunday");
    const priced = patchSection({ ...kanteDoc(), google: undefined }, "contact", c => ({ ...c }));
    expect(entrySticker(priced)).toEqual({ big: "Ab 18", small: "Euro", source: "price" });
    expect(entrySticker({ ...base, amenities: { delivery: true } })).toEqual({ big: "Auch", small: "Lieferung", source: "amenity" });
    expect(entrySticker({ ...base, amenities: { delivery: false } })).toBeUndefined();
  });

  test("ausgeblendete Abschnitte liefern keine Sticker-Fakten", () => {
    const hiddenHours = { ...eckeDoc(), google: undefined, amenities: undefined, hiddenSections: ["contact", "menu", "services"] } as Doc;
    expect(entrySticker(hiddenHours)).toBeUndefined();
  });

  test("Preise: nur echte Zahlen, gratis = 0", () => {
    expect(priceValue("7,50 €")).toBe(7.5);
    expect(priceValue("ab 28 €")).toBe(28);
    expect(priceValue("45")).toBe(45);
    expect(priceValue("1 Std. 50 €")).toBe(50);
    expect(priceValue("gratis")).toBe(0);
    expect(priceValue("0 €")).toBe(0);
    expect(priceValue("auf Anfrage")).toBeUndefined();
    expect(priceValue("1 Std.")).toBeUndefined();
  });
});

describe("Plakat: Fakten, Laufband, Wege", () => {
  test("Fakten unter dem Einstieg nur aus Daten", () => {
    expect(entryFacts(kanteDoc())).toEqual([
      { strong: "Bart trimmen ab 18 €", sub: "aus der Preisliste" },
      { strong: "Mo–Fr", sub: "10–19 Uhr" },
      { strong: "Hafenstraße 12", sub: "48153 Münster" },
      { strong: "312 Bewertungen", sub: "bei Google" },
    ]);
    expect(entryFacts(bare({ ...kanteDoc(), hiddenSections: ["contact"] } as Doc))).toEqual([]);
  });

  test("Laufband: Leistungen, Straße, Zeiten; unter zwei Einträgen keins", () => {
    expect(tickerItems(kanteDoc())).toEqual(["Haarschnitt", "Fade", "Bart", "Rasur", "Hafenstraße 12", "Mo–Fr 10–19"]);
    // Zeiten-Kurzform: die Zeile mit den meisten Tagen, nicht einfach die erste
    expect(tickerItems(eckeDoc()).at(-1)).toBe("Di–Sa 11–2");
    const thin = withContact(without(kanteDoc(), "services"), { openingHours: undefined });
    expect(tickerItems(thin)).toEqual([]);
  });

  test("Wege: Hauptaktion + Anrufen; Anruf als Hauptaktion → Route daneben", () => {
    const kante = plakatActions(kanteDoc(), bp(kanteDoc()));
    expect(kante.other).toEqual({ label: "Anrufen", href: "tel:02515550182" });
    expect(kante.primary?.label).toBe("Termin buchen");
    const ecke = plakatActions(eckeDoc(), bp(eckeDoc()));
    expect(ecke.primary).toEqual({ label: "Anrufen & abholen", href: "tel:05215550144" });
    expect(ecke.other?.label).toBe("Route");
  });

  test("Wege nur aus sichtbaren Abschnitten: Kontakt aus → kein Anker ins Leere", () => {
    const doc = { ...kanteDoc(), hiddenSections: ["contact"] } as Doc;
    const ways = plakatActions(doc, bp(doc));
    expect(ways.primary).toBeUndefined();
    expect(ways.other).toBeUndefined();
  });
});
