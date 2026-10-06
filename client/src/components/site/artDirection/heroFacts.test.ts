import { describe, expect, it } from "vitest";
import {
  pickReviewQuote,
  shortHours,
  streetLine,
  telHref,
  todayLine,
} from "./heroFacts";

// Dienstag, 6. Oktober 2026, 23:30 UTC = Mittwoch 01:30 in Berlin.
const TUESDAY_NIGHT_UTC = new Date("2026-10-06T23:30:00Z");
const TUESDAY_NOON = new Date("2026-10-06T10:00:00Z");
const MONDAY = new Date("2026-10-05T10:00:00Z");

const HOURS = [
  { day: "Montag", hours: "Geschlossen" },
  { day: "Dienstag", hours: "09:00–18:00 Uhr" },
  { day: "Mittwoch", hours: "08:30 - 12:00" },
];

describe("todayLine", () => {
  it("zeigt die Zeit des heutigen Tags verkürzt", () => {
    expect(todayLine(HOURS, TUESDAY_NOON)).toBe("Heute 9–18 Uhr");
  });

  it("rechnet mit deutscher Zeit, nicht mit Serverzeit", () => {
    expect(todayLine(HOURS, TUESDAY_NIGHT_UTC)).toBe("Heute 8:30–12 Uhr");
  });

  it("meldet Ruhetage", () => {
    expect(todayLine(HOURS, MONDAY)).toBe("Heute geschlossen");
  });

  it("versteht Bereiche wie Mo–Fr", () => {
    expect(
      todayLine([{ day: "Mo–Sa", hours: "10:00–19:00" }], TUESDAY_NOON)
    ).toBe("Heute 10–19 Uhr");
  });

  it("zeigt Platzhalter-Zeiten nie an", () => {
    expect(
      todayLine([{ day: "Mo–Fr", hours: "09:00–17:00" }], TUESDAY_NOON)
    ).toBeUndefined();
  });

  it("bleibt ohne Eintrag für heute still", () => {
    expect(
      todayLine([{ day: "Samstag", hours: "9–14" }], TUESDAY_NOON)
    ).toBeUndefined();
    expect(todayLine(undefined, TUESDAY_NOON)).toBeUndefined();
  });
});

describe("shortHours", () => {
  it("lässt Text ohne Ziffern unverändert", () => {
    expect(shortHours("nach Vereinbarung")).toBe("nach Vereinbarung");
  });
});

describe("streetLine", () => {
  it("entfernt den vorangestellten Firmennamen", () => {
    expect(streetLine("Friseurhaarem, Ludgeripl. 19")).toBe("Ludgeripl. 19");
  });
  it("lässt normale Straßen stehen", () => {
    expect(streetLine("Hauptstraße 5")).toBe("Hauptstraße 5");
    expect(streetLine("  ")).toBeUndefined();
  });
});

describe("telHref", () => {
  it("baut einen wählbaren Link", () => {
    expect(telHref("0203 7399646")).toBe("tel:02037399646");
    expect(telHref("+49 (0) 2871 / 12 34")).toBe("tel:+49028711234");
  });
  it("verwirft Unsinn", () => {
    expect(telHref("n/a")).toBeUndefined();
  });
});

describe("pickReviewQuote", () => {
  it("nimmt keine Bewertung mit Kritik, auch nicht bei 5 Sternen", () => {
    expect(
      pickReviewQuote([
        {
          author: "P. F.",
          rating: 5,
          text: "Der Döner war super lecker und das Brot ein Träumchen. Einziger Kritikpunkt, es war super kalt im Laden.",
        },
      ])
    ).toBeUndefined();
  });

  it("nimmt eine kurze Bewertung unverändert", () => {
    expect(
      pickReviewQuote([
        {
          author: "C. I.",
          text: "Die Chefin hat tolle Arbeit geleistet.",
          rating: 5,
        },
      ])
    ).toEqual({
      author: "C. I.",
      text: "Die Chefin hat tolle Arbeit geleistet.",
    });
  });

  it("kürzt gekappte Bewertungen auf ganze Sätze", () => {
    expect(
      pickReviewQuote([
        {
          author: "B. B.",
          text: "Ich bin sehr zufrieden. Das Team ist sehr freundlich. Schnitt sowie Farbe sind wunderschön geworden. Ein Besuch …",
          rating: 5,
        },
      ])?.text
    ).toBe(
      "Ich bin sehr zufrieden. Das Team ist sehr freundlich. Schnitt sowie Farbe sind wunderschön geworden."
    );
  });

  it("meidet Einschränkungen und Emojis, auch bei 5 Sternen", () => {
    expect(
      pickReviewQuote([
        {
          author: "Y",
          text: "Check in und Bar waren super. Leider gab es keinen Joghurt.",
          rating: 5,
        },
        {
          author: "A",
          text: "Super toller Laden ❤️ immer gerne wieder.",
          rating: 5,
        },
        {
          author: "C. I.",
          text: "Die Chefin hat tolle Arbeit geleistet. Angenehme Atmosphäre im Salon.",
          rating: 5,
        },
      ])?.author
    ).toBe("C. I.");
  });

  it("überspringt schwächere und zu kurze Bewertungen", () => {
    expect(
      pickReviewQuote([
        {
          author: "A",
          text: "Ganz okay, aber zu teuer für das Ergebnis.",
          rating: 3,
        },
        { author: "B", text: "Top!", rating: 5 },
      ])
    ).toBeUndefined();
  });
});

describe("shortHours bei 24 Stunden", () => {
  it('hängt kein „Uhr" an „24 Stunden geöffnet"', () => {
    expect(shortHours("24 Stunden geöffnet")).toBe("rund um die Uhr geöffnet");
  });
});
