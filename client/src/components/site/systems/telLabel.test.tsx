import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import "./registry";
import { SiteRenderer } from "../SiteRenderer";
import type { WebsiteDataV2 } from "../../../../../shared/siteContract/types";
import type { DesignSystemId } from "../../../../../shared/designSystems/types";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../shared/showcases/blueprintShowcase";
import { telLabel } from "./shared";

/**
 * Knöpfe, die anrufen, sagen das (Betreiber-Entscheid 2026-10-12): Zielt
 * ein Knopf auf `tel:`, heißt er „Anrufen" — außer sein Text nennt Anruf
 * oder Telefon schon. „Tisch reservieren", „Termin anfragen" oder
 * „Verfügbarkeit anfragen" versprachen sonst ein Formular. Eine Nummer als
 * Beschriftung bleibt (sie sagt selbst, was passiert).
 */

const SYSTEMS: DesignSystemId[] = [
  "journal",
  "raster",
  "werkstoff",
  "plakat",
  "klar",
  "nacht",
];
const NOW = new Date("2026-10-15T11:00:00+02:00");

const render = (data: WebsiteDataV2) =>
  renderToStaticMarkup(
    <SiteRenderer data={data} slug="" islandsMode="live" now={NOW} />
  );

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|\s+/g, " ")
    .trim();

/**
 * Sichtbarer Text jedes `tel:`-Links (Symbol-Knopf: sein aria-label).
 * Ausnahme: Raster-Fuß — dort steht der Satz des Aufruf-Abschnitts als
 * Aufforderung (kein Knopftext); ohne Aufruf trägt er die Hauptaktion,
 * die schon „Anrufen" heißt.
 */
const telTexts = (html: string) =>
  [
    ...html
      .replace(/<p class="rs-foot-call"[\s\S]*?<\/p>/g, "")
      .matchAll(/<a\b([^>]*\shref="tel:[^"]*"[^>]*)>([\s\S]*?)<\/a>/g),
  ].map(m => text(m[2]) || (m[1].match(/aria-label="([^"]*)"/)?.[1] ?? ""));

const SAYS_CALL = /anruf|telefon/i;
const NUMBER = /^[+\d][\d\s()/.\-–]*$/;
const callsOk = (t: string) => SAYS_CALL.test(t) || NUMBER.test(t);

type Sec = WebsiteDataV2["sections"][number];

/** Hauptknopf ruft an: kein Formular, kein Buchungslink. */
function calling(doc: WebsiteDataV2): WebsiteDataV2 {
  return {
    ...doc,
    features: { ...doc.features, contactForm: false },
    sections: doc.sections.map((s): Sec => {
      if (s.type === "hero" && s.ctaHref && !s.ctaHref.startsWith("tel:"))
        return { ...s, ctaHref: undefined };
      return s;
    }),
  };
}

/** Ohne E-Mail: Anfrage-Knöpfe im Kontakt fallen aufs Telefon zurück. */
const withoutMail = (doc: WebsiteDataV2): WebsiteDataV2 => ({
  ...doc,
  sections: doc.sections.map((s): Sec => {
    if (s.type !== "contact") return s;
    const { email: _drop, ...rest } = s;
    return rest as Sec;
  }),
});

/** Aufruf-Band mit eigenem Telefon-Ziel und freiem Text. */
function withCallBand(doc: WebsiteDataV2, label: string): WebsiteDataV2 {
  const sections = [...doc.sections];
  const at = sections.findIndex(s => s.type === "contact");
  sections.splice(at, 0, {
    type: "cta",
    headline: "Heute Abend noch frei?",
    ctaText: label,
    ctaHref: "tel:+495554718",
  });
  return { ...doc, sections };
}

const CASES: [string, string][] = [
  ["restaurant", "Tisch reservieren"],
  ["imbiss", "Jetzt bestellen"],
  ["friseur", "Termin anfragen"],
  ["zahnarzt", "Termin vereinbaren"],
  ["schreinerei", "Angebot anfragen"],
  ["ferienwohnung", "Verfügbarkeit anfragen"],
];

describe("telLabel", () => {
  test("tel-Ziel → „Anrufen“, außer der Text nennt Anruf/Telefon oder ist die Nummer", () => {
    expect(telLabel("Tisch reservieren", "tel:+49555")).toBe("Anrufen");
    expect(telLabel("Termin anfragen", "tel:+49555")).toBe("Anrufen");
    expect(telLabel("Verfügbarkeit anfragen", "TEL:+49555")).toBe("Anrufen");
    expect(telLabel("Jetzt anrufen", "tel:+49555")).toBe("Jetzt anrufen");
    expect(telLabel("Telefonisch buchen", "tel:+49555")).toBe(
      "Telefonisch buchen"
    );
    expect(telLabel("0555 4718 20", "tel:+49555471820")).toBe("0555 4718 20");
    expect(telLabel("+49 (0)555 / 47-18", "tel:+49555")).toBe(
      "+49 (0)555 / 47-18"
    );
  });

  test("andere Ziele bleiben unberührt", () => {
    expect(telLabel("Tisch reservieren", "https://tisch.example/")).toBe(
      "Tisch reservieren"
    );
    expect(telLabel("Termin anfragen", "#kontakt")).toBe("Termin anfragen");
    expect(telLabel("Anfrage senden", undefined)).toBe("Anfrage senden");
  });
});

describe("Knöpfe mit tel-Ziel heißen „Anrufen“ — in allen Systemen", () => {
  for (const system of SYSTEMS)
    for (const [showcase, label] of CASES)
      test(`${system} · ${showcase} („${label}“)`, () => {
        const base = calling(
          systemShowcaseDoc(findShowcase(showcase)!, system)
        );
        const docs = [
          base,
          withoutMail(base),
          withCallBand(base, label),
          // Eigener Einstiegstext mit tel-Ziel (Studio), Bauplan ohne Anruf.
          {
            ...base,
            sections: base.sections.map(
              (s): Sec =>
                s.type === "hero"
                  ? { ...s, ctaText: label, ctaHref: "tel:+495554718" }
                  : s
            ),
          },
        ];
        for (const doc of docs) {
          const html = render(doc);
          const texts = telTexts(html);
          expect(texts.length).toBeGreaterThan(0);
          const bad = texts.filter(t => !callsOk(t));
          expect(bad).toEqual([]);
        }
        // Aufruf-Band: der freie Text steht nicht auf dem Telefon-Knopf.
        const band = telTexts(render(withCallBand(base, label)));
        expect(band.some(t => t.includes(label))).toBe(false);
      });
});
