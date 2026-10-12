import { describe, expect, test } from "vitest";
import { PLACEHOLDER_OPENING_HOURS } from "../../../../../../shared/onboardingV2/openingHours";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import {
  dockPair,
  entryFigure,
  entryLede,
  entryName,
  entryVariant,
  kitchenOf,
  monogramOf,
  nachtActions,
  nachtShort,
  todayLine,
} from "./facts";
import {
  TEST_NOW,
  hausDoc,
  noirDoc,
  patchSection,
  weinbergDoc,
  withComposition,
  withContact,
  withoutPhotos,
  type Doc,
} from "./testkit";

const hero = (doc: Doc) =>
  doc.sections.find(s => s.type === "hero") as Extract<
    Doc["sections"][number],
    { type: "hero" }
  >;
const bp = (doc: Doc) => blueprintFor(doc.businessCategory, doc.businessName);
/** Mo 12.10.2026 … So 18.10.2026, 19 Uhr in Berlin. */
const day = (d: number) => new Date(`2026-10-${12 + d}T19:00:00+02:00`);
const hoursDoc = (openingHours: { day: string; hours: string }[]) =>
  withContact(weinbergDoc(), { openingHours });

describe("Nacht: Küche aus dem Zeiten-Text", () => {
  test.each([
    ["17:30 – 23:00, Küche bis 21:30", "17:30 – 23:00", "21:30"],
    ["17:30 – 23:00, warme Küche bis 21 Uhr", "17:30 – 23:00", "21:00"],
    ["17:30 – 23:00; Küche 17:30–21:30", "17:30 – 23:00", "21:30"],
    ["17:30 – 23:00 (Küche bis 22.00)", "17:30 – 23:00", "22:00"],
    ["Küche bis 21:30, 17:30 – 23:00", "17:30 – 23:00", "21:30"],
  ])("%s", (text, open, kitchen) => {
    expect(kitchenOf(text)).toEqual({ open, kitchen });
  });

  test("ohne Küche oder ohne Uhrzeit: keine Küchenzeit", () => {
    expect(kitchenOf("17:30 – 23:00")).toEqual({ open: "17:30 – 23:00" });
    expect(kitchenOf("17:30 – 23:00, Küche durchgehend")).toEqual({
      open: "17:30 – 23:00",
    });
  });
});

describe("Nacht: Küche mit Klammer-Ausnahme und Tagesangabe", () => {
  const FRI = new Date("2026-10-16T19:00:00+02:00");
  const THU = TEST_NOW;

  test("Ausnahme in Klammern gilt nicht für jeden Tag", () => {
    const t = "17:30 – 23:00, Küche bis 21:30 (Fr/Sa 22:30)";
    expect(kitchenOf(t)).toEqual({ open: "17:30 – 23:00", kitchen: "21:30" });
    expect(kitchenOf(t, THU)).toEqual({
      open: "17:30 – 23:00",
      kitchen: "21:30",
    });
    expect(kitchenOf(t, FRI)).toEqual({
      open: "17:30 – 23:00",
      kitchen: "22:30",
    });
  });

  test("Zeit steht direkt nach „bis“ bzw. am Ende der Spanne, nie aus Klammern", () => {
    expect(
      kitchenOf("Küche bis 21:30 (nur mit Reservierung 22:45), 17:30 – 23:00")
    ).toEqual({ open: "17:30 – 23:00", kitchen: "21:30" });
    expect(
      kitchenOf("17:30 – 23:00, Küche 17:30–21:30 (Sa 22:30)", THU)
    ).toEqual({ open: "17:30 – 23:00", kitchen: "21:30" });
  });

  test("Küche nur an bestimmten Tagen: nur dort, sonst keine Zeit", () => {
    const t = "17:30 – 23:00, Küche Fr/Sa bis 22:30";
    expect(kitchenOf(t)).toEqual({ open: "17:30 – 23:00" });
    expect(kitchenOf(t, THU)).toEqual({ open: "17:30 – 23:00" });
    expect(kitchenOf(t, FRI)).toEqual({
      open: "17:30 – 23:00",
      kitchen: "22:30",
    });
    expect(kitchenOf("Küche bis 21:30 Fr/Sa", FRI).kitchen).toBeUndefined();
  });

  test("todayLine nimmt die Ausnahme am richtigen Tag", () => {
    const h = [
      { day: "Mi–Sa", hours: "17:30 – 23:00, Küche bis 21:30 (Fr/Sa 22:30)" },
    ];
    expect(todayLine(h, THU)).toEqual({
      open: "Heute 17:30 bis 23:00",
      kitchen: "Küche bis 21:30",
    });
    expect(todayLine(h, FRI)).toEqual({
      open: "Heute 17:30 bis 23:00",
      kitchen: "Küche bis 22:30",
    });
  });
});

describe("Nacht: Mittags- und Abendküche", () => {
  test("mehrere Blöcke: Ende des letzten; ohne Ende keine Zeit; einzelne Spanne wie bisher", () => {
    expect(kitchenOf("17:30 – 23:00, Küche 11:30–14:00 und 17:30–21:30")).toEqual({
      open: "17:30 – 23:00",
      kitchen: "21:30",
    });
    expect(kitchenOf("17:30 – 23:00, Küche 11:30–14:00 / 17:30–21:30").kitchen).toBe("21:30");
    expect(kitchenOf("17:30 – 23:00, Küche bis 14 Uhr und ab 17:30")).toEqual({
      open: "17:30 – 23:00",
    });
    expect(kitchenOf("17:30 – 23:00, Küche 17:30–21:30").kitchen).toBe("21:30");
    expect(kitchenOf("Küche bis 21:30, 17:30 – 23:00").kitchen).toBe("21:30");
  });

  test("Tageswörter auch kleingeschrieben", () => {
    const FRI = new Date("2026-10-16T19:00:00+02:00");
    expect(kitchenOf("17:30 – 23:00, küche fr/sa bis 22:30", FRI).kitchen).toBe("22:30");
    expect(kitchenOf("17:30 – 23:00, küche fr/sa bis 22:30", TEST_NOW).kitchen).toBeUndefined();
  });
});

describe("Nacht: Texte nur mit Küche", () => {
  test.each([
    ["Küche 12–22 Uhr", "Küche 12 bis 22 Uhr", "22:00"],
    ["warme Küche bis 21 Uhr", "warme Küche bis 21 Uhr", "21:00"],
  ])("%s bleibt wörtlich, nie leer", (text, open, kitchen) => {
    expect(kitchenOf(text)).toEqual({ open, kitchen, kitchenOnly: true });
  });

  test("Heute-Zeile nie leer, Küche nicht doppelt, keine Ziffer aus der Küche", () => {
    for (const [text, line] of [
      ["Küche 12–22 Uhr", "Heute: Küche 12 bis 22 Uhr"],
      ["warme Küche bis 21 Uhr", "Heute: warme Küche bis 21 Uhr"],
    ])
      expect(todayLine([{ day: "Mo–So", hours: text }], TEST_NOW)).toEqual({
        open: line,
      });
    expect(
      entryFigure({
        ...withContact(noirDoc(), {
          openingHours: [{ day: "Mo–So", hours: "Küche 12–22 Uhr" }],
        }),
        google: undefined,
      })
    ).toBeUndefined();
    expect(todayLine([{ day: "Mo–So", hours: "" }], TEST_NOW)).toBeUndefined();
  });
});

describe("Nacht: Heute-Zeile", () => {
  const hours = (doc: Doc) =>
    doc.sections.flatMap(s =>
      s.type === "contact" ? [s.openingHours] : []
    )[0];

  test("Donnerstag: Heute 17:30 bis 23:00 · Küche bis 21:30", () => {
    expect(todayLine(hours(weinbergDoc()), TEST_NOW)).toEqual({
      open: "Heute 17:30 bis 23:00",
      kitchen: "Küche bis 21:30",
    });
  });

  test("Ruhetag ohne Küche; geschlossen wörtlich", () => {
    expect(todayLine(hours(weinbergDoc()), day(0))).toEqual({
      open: "Heute Ruhetag",
    });
    expect(todayLine(hours(noirDoc()), day(0))).toEqual({
      open: "Heute geschlossen",
    });
  });

  test("halber Tag: zwei Spannen, Küche bleibt", () => {
    const doc = hoursDoc([
      { day: "Mo–So", hours: "12:00 – 14:30, 17:30 – 23:00, Küche bis 21:30" },
    ]);
    expect(todayLine(hours(doc), TEST_NOW)).toEqual({
      open: "Heute 12:00 bis 14:30, 17:30 bis 23:00",
      kitchen: "Küche bis 21:30",
    });
  });

  test("unlesbar → wörtlich; Platzhalter, fehlender Tag, keine Zeiten → nichts", () => {
    expect(
      todayLine([{ day: "Mo–So", hours: "nach Vereinbarung" }], TEST_NOW)
    ).toEqual({ open: "Heute: nach Vereinbarung" });
    expect(todayLine(PLACEHOLDER_OPENING_HOURS, TEST_NOW)).toBeUndefined();
    expect(
      todayLine([{ day: "Mo", hours: "17:00 – 22:00" }], TEST_NOW)
    ).toBeUndefined();
    expect(todayLine(undefined, TEST_NOW)).toBeUndefined();
    expect(todayLine(hours(hausDoc()), TEST_NOW)).toBeUndefined();
  });

  test("rund um die Uhr", () => {
    expect(
      todayLine([{ day: "Mo–So", hours: "24 Stunden" }], TEST_NOW)
    ).toEqual({ open: "Heute rund um die Uhr geöffnet" });
    expect(
      todayLine([{ day: "Mo–So", hours: "00:00 – 24:00" }], TEST_NOW)
    ).toEqual({ open: "Heute rund um die Uhr geöffnet" });
  });
});

describe("Nacht: Kupferziffer nur aus echten Werten", () => {
  test("Salon: späteste Schließzeit 21 Uhr Di bis Fr", () => {
    expect(entryFigure(noirDoc())).toEqual({
      value: "21",
      label: "Uhr · Di bis Fr so lange geöffnet",
      sr: "Dienstag bis Freitag bis 21:00 Uhr geöffnet",
      source: "hours",
    });
  });

  test("„letzter Termin“ nur, wenn der Text es sagt", () => {
    const doc = withContact(noirDoc(), {
      openingHours: [
        { day: "Di–Fr", hours: "12:00 – 21:00, letzter Termin 20:00" },
        { day: "Sa", hours: "9:00 – 16:00" },
      ],
    });
    expect(entryFigure(doc)).toMatchObject({
      value: "20",
      label: "Uhr · letzter Termin Di bis Fr",
    });
  });

  test("Minuten hochgestellt, Küche zählt nicht als Schließzeit, täglich", () => {
    const doc = hoursDoc([
      { day: "Mo–So", hours: "17:00 – 22:30, Küche 17:30–23:45" },
    ]);
    expect(entryFigure(doc)).toMatchObject({
      value: "22",
      minutes: "30",
      label: "Uhr · täglich so lange geöffnet",
    });
  });

  test("24:00 wie über Mitternacht: keine Schließzeit-Ziffer", () => {
    const till24 = hoursDoc([{ day: "Mo–So", hours: "18:00 – 24:00" }]);
    delete till24.google;
    expect(entryFigure(till24)).toBeUndefined();
    // Einzelne Tage bis 24 Uhr (Weinberg Fr/Sa) fallen heraus; das Label nennt nur die Tage, für die es stimmt.
    expect(entryFigure({ ...weinbergDoc(), google: undefined })).toMatchObject({
      value: "23",
      label: "Uhr · Mi und Do so lange geöffnet",
    });
    const bar = hoursDoc([
      { day: "Mo–Do", hours: "18:00 – 23:00" },
      { day: "Fr–Sa", hours: "18:00 – 2:00" },
    ]);
    delete bar.google;
    expect(entryFigure(bar)).toMatchObject({
      value: "23",
      label: "Uhr · Mo bis Do so lange geöffnet",
      sr: "Montag bis Donnerstag bis 23:00 Uhr geöffnet",
    });
    const late = hoursDoc([{ day: "Mo–So", hours: "18:00 – 2:00" }]);
    delete late.google;
    expect(entryFigure(late)).toBeUndefined();
  });

  test("vor 19 Uhr keine Zeiten-Ziffer, dann Google-Note ab 20 Bewertungen", () => {
    const day = withContact(noirDoc(), {
      openingHours: [{ day: "Mo–Fr", hours: "9:00 – 18:00" }],
    });
    expect(entryFigure(day)).toBeUndefined();
    expect(
      entryFigure({ ...day, google: { rating: 4.9, reviewCount: 20 } })
    ).toEqual({
      value: "4,9",
      label: "von 5 · 20 Google-Bewertungen",
      sr: "4,9 von 5 Sternen bei 20 Google-Bewertungen",
      source: "rating",
    });
    expect(
      entryFigure({ ...day, google: { rating: 4.9, reviewCount: 19 } })
    ).toBeUndefined();
    expect(
      entryFigure({ ...day, google: { rating: 0, reviewCount: 300 } })
    ).toBeUndefined();
  });

  test("Pension: Zeiten ohne Wochentage → Google-Note", () => {
    expect(entryFigure(hausDoc())).toMatchObject({
      value: "4,9",
      source: "rating",
    });
  });

  test("keine Daten → keine Ziffer (Platzhalter, rund um die Uhr, nichts)", () => {
    const none = withContact(noirDoc(), { openingHours: undefined });
    expect(entryFigure(none)).toBeUndefined();
    expect(
      entryFigure(
        withContact(noirDoc(), { openingHours: PLACEHOLDER_OPENING_HOURS })
      )
    ).toBeUndefined();
    expect(
      entryFigure(
        withContact(noirDoc(), {
          openingHours: [{ day: "Mo–So", hours: "00:00 – 24:00" }],
        })
      )
    ).toBeUndefined();
  });

  test("ausgeblendeter Kontakt zählt nicht", () => {
    const doc: Doc = { ...noirDoc(), hiddenSections: ["contact"] };
    expect(entryFigure(doc)).toBeUndefined();
  });
});

describe("Nacht: Einstiegs-Entscheidung", () => {
  test("Foto + Querformat → photo; Foto sonst → framed; kein Foto → plain", () => {
    const w = weinbergDoc();
    expect(entryVariant(w, hero(w))).toBe("photo");
    const n = noirDoc();
    expect(entryVariant(n, hero(n))).toBe("framed");
    const h = hausDoc();
    expect(entryVariant(h, hero(h))).toBe("plain");
  });

  test("ein brauchbares Foto fällt nie weg; ausgeblendetes Foto zählt nicht", () => {
    const portrait = withComposition(weinbergDoc(), "portrait");
    expect(entryVariant(portrait, hero(portrait))).toBe("framed");
    const hidden: Doc = {
      ...weinbergDoc(),
      designProfile: {
        ...weinbergDoc().designProfile!,
        hiddenElements: ["hero-media"],
      },
    };
    expect(entryVariant(hidden, hero(hidden))).toBe("plain");
    const none = withoutPhotos(weinbergDoc());
    expect(entryVariant(none, hero(none))).toBe("plain");
  });
});

describe("Nacht: Name, Satz, Monogramm", () => {
  test("Branche im Namen → Kicker + Marke im h1", () => {
    expect(entryName(weinbergDoc(), bp(weinbergDoc()))).toEqual({
      name: "Restaurant Weinberg",
      mark: "Weinberg",
      kicker: "Restaurant",
      kickerInName: true,
    });
    expect(entryName(hausDoc(), bp(hausDoc()))).toMatchObject({
      mark: "Haus am See",
      kicker: "Pension",
      kickerInName: true,
    });
  });

  test("Branche nicht im Namen → Kicker außerhalb, Name ganz", () => {
    expect(entryName(noirDoc(), bp(noirDoc()))).toEqual({
      name: "Salon Noir",
      mark: "Salon Noir",
      kicker: "Friseursalon",
      kickerInName: false,
    });
  });

  test("Satz: Unterzeile, nie ein Echo des Namens; lang → ganze Sätze", () => {
    const w = weinbergDoc();
    expect(entryLede(hero(w), w, bp(w))).toMatch(/^Pfälzer Küche/);
    const echo = patchSection(w, "hero", h => ({
      ...h,
      subheadline: undefined,
    }));
    expect(entryLede(hero(echo), echo, bp(echo))).toBeUndefined();
    const long = patchSection(w, "hero", h => ({
      ...h,
      subheadline: `${"Ein Satz mit Inhalt. ".repeat(8)}Und noch einer.`,
    }));
    const lede = entryLede(hero(long), long, bp(long))!;
    expect(lede.length).toBeLessThanOrEqual(200);
    expect(lede.endsWith(".")).toBe(true);
  });

  test("Monogramm: erster Buchstabe der Marke", () => {
    expect(monogramOf("Weinberg")).toBe("W");
    expect(monogramOf("Haus am See")).toBe("H");
    expect(monogramOf("„Ölmühle“")).toBe("Ö");
    expect(monogramOf("")).toBe("·");
  });
});

describe("Nacht: Wege (Klar-Reihenfolge) und Leiste", () => {
  test("Buchungslink → Hauptknopf, Telefon zweiter Knopf; Leiste Anrufen + Reservieren", () => {
    const a = nachtActions(weinbergDoc(), bp(weinbergDoc()));
    expect(a.primary).toEqual({
      label: "Tisch reservieren",
      href: "https://tisch.weinberg.example/",
    });
    expect(a.second?.href).toBe("tel:0555471820");
    expect(dockPair(a)).toEqual({
      left: { label: "Anrufen", href: "tel:0555471820" },
      main: { label: "Reservieren", href: "https://tisch.weinberg.example/" },
    });
  });

  test("ohne Buchungslink: Restaurant ruft an und behält „Tisch reservieren“", () => {
    const doc = patchSection(weinbergDoc(), "hero", h => ({
      ...h,
      ctaHref: undefined,
      ctaText: undefined,
    }));
    const a = nachtActions(doc, bp(doc));
    expect(a.primary).toEqual({
      label: "Tisch reservieren",
      href: "tel:0555471820",
    });
    expect(a.second?.label).toBe("Route");
    expect(dockPair(a)?.left?.label).toBe("Route");
    expect(dockPair(a)?.main.label).toBe("Reservieren");
  });

  test("Formular gebucht → #kontakt; Kurzformen", () => {
    const a = nachtActions(noirDoc(), bp(noirDoc()));
    expect(a.primary).toEqual({ label: "Termin anfragen", href: "#kontakt" });
    expect(nachtShort("Termin anfragen")).toBe("Termin");
    expect(nachtShort("Zimmer anfragen")).toBe("Anfragen");
    expect(nachtShort("Tisch reservieren")).toBe("Reservieren");
    expect(nachtShort("Erstgespräch vereinbaren")).toBe("Erstgespräch");
    expect(nachtShort("Anrufen")).toBe("Anrufen");
  });

  test("ohne Kontakt kein Weg, keine Leiste", () => {
    const doc: Doc = {
      ...weinbergDoc(),
      sections: weinbergDoc().sections.filter(s => s.type !== "contact"),
    };
    const stripped = patchSection(doc, "hero", h => ({
      ...h,
      ctaHref: undefined,
    }));
    expect(dockPair(nachtActions(stripped, bp(stripped)))).toBeUndefined();
  });
});
