import { describe, expect, test } from "vitest";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import {
  contentGaps,
  depthRetryHint,
  lohntNachforderung,
  MIN_WORDS,
} from "./contentDepth";

const w = (n: number) => Array.from({ length: n }, (_, i) => `wort${i}`).join(" ");

const doc = (sections: WebsiteDataV2["sections"]): WebsiteDataV2 => ({
  version: 2,
  stylePackId: "werkbank",
  businessName: "Brandt",
  seo: { title: "t", description: "d" },
  sections,
});

describe("contentGaps (Tiefenprüfung, Befund 2026-09-05)", () => {
  test("ausreichend gefüllte Seite meldet keine Lücke", () => {
    const d = doc([
      { type: "hero", headline: "H", subheadline: w(MIN_WORDS.heroSubheadline) },
      {
        type: "services",
        headline: "L",
        items: [{ title: "A", description: w(MIN_WORDS.serviceDescription) }],
      },
      { type: "about", headline: "Ü", body: w(MIN_WORDS.aboutBody) },
      {
        type: "faq",
        items: [{ question: "F?", answer: w(MIN_WORDS.faqAnswer) }],
      },
    ]);
    expect(contentGaps(d)).toEqual([]);
  });

  test("zu kurzer Über-uns-Text wird mit Pfad, Ist- und Sollwert gemeldet", () => {
    const d = doc([{ type: "about", headline: "Ü", body: w(20) }]);
    const luecken = contentGaps(d);
    expect(luecken).toHaveLength(1);
    expect(luecken[0]).toMatchObject({
      pfad: "about.body",
      ist: 20,
      soll: MIN_WORDS.aboutBody,
    });
  });

  test("jede zu dünne Leistungsbeschreibung zählt einzeln, mit Index im Pfad", () => {
    const d = doc([
      {
        type: "services",
        headline: "L",
        items: [
          { title: "A", description: w(3) },
          { title: "B", description: w(MIN_WORDS.serviceDescription + 5) },
          { title: "C", description: w(4) },
        ],
      },
    ]);
    const pfade = contentGaps(d).map(l => l.pfad);
    expect(pfade).toEqual(["services.items[0].description", "services.items[2].description"]);
  });

  test("fehlende optionale Felder sind keine Lücke — nur zu kurze zählen", () => {
    const d = doc([{ type: "hero", headline: "H" }]);
    expect(contentGaps(d)).toEqual([]);
  });

  test("nicht vorhandene Sektionen werden nicht eingefordert", () => {
    expect(contentGaps(doc([{ type: "contact" }]))).toEqual([]);
  });

  test("FAQ-Antworten werden einzeln geprüft", () => {
    const d = doc([
      {
        type: "faq",
        items: [
          { question: "A?", answer: w(MIN_WORDS.faqAnswer) },
          { question: "B?", answer: w(5) },
        ],
      },
    ]);
    expect(contentGaps(d).map(l => l.pfad)).toEqual(["faq.items[1].answer"]);
  });
});

describe("depthRetryHint", () => {
  test("nennt jede Lücke mit Feld, Ist und Soll", () => {
    const hint = depthRetryHint([
      { pfad: "about.body", ist: 20, soll: 70, feld: "Über-uns-Text" },
      { pfad: "faq.items[1].answer", ist: 5, soll: 20, feld: "FAQ-Antwort" },
    ]);
    expect(hint).toContain("about.body");
    expect(hint).toContain("20");
    expect(hint).toContain("70");
    expect(hint).toContain("faq.items[1].answer");
    expect(hint).toContain("Über-uns-Text");
    // Kein Freibrief zum Erfinden — das ist die wichtigste Zeile.
    expect(hint.toLowerCase()).toContain("erfinde");
  });

  test("ohne Lücken kommt kein Hinweis", () => {
    expect(depthRetryHint([])).toBe("");
  });
});

describe("lohntNachforderung", () => {
  test("knappe Unterschreitung allein rechtfertigt keinen zweiten Modellaufruf", () => {
    expect(lohntNachforderung([{ pfad: "about.body", feld: "x", ist: 68, soll: 70 }])).toBe(false);
  });

  test("deutlich zu kurzes Feld löst die Nachforderung aus", () => {
    expect(lohntNachforderung([{ pfad: "about.body", feld: "x", ist: 40, soll: 70 }])).toBe(true);
  });

  test("viele kleine Lücken zusammen lohnen ebenfalls", () => {
    const knapp = (p: string) => ({ pfad: p, feld: "x", ist: 13, soll: 15 });
    expect(lohntNachforderung([knapp("a"), knapp("b")])).toBe(false);
    expect(lohntNachforderung([knapp("a"), knapp("b"), knapp("c")])).toBe(true);
  });

  test("ohne Lücken nie", () => {
    expect(lohntNachforderung([])).toBe(false);
  });
});
