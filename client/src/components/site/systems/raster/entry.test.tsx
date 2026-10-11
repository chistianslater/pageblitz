import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { SiteRenderer } from "../../SiteRenderer";
import { ENTRY_HEIGHT_SHARE, RASTER_CSS } from "./css";
import {
  kanzleiDoc,
  patchSection,
  render,
  schluesselDoc,
  TEST_NOW,
  werkstattDoc,
} from "./testkit";
import {
  dockPlan,
  entryLede,
  entryVariant,
  todayFact,
} from "./facts";
import { echoesKicker, isRoundTheClock } from "../shared";
import { blueprintFor } from "../../../../../../shared/stylePacks/blueprints";
import type { SectionOf } from "../../../../../../shared/siteContract/types";

const entryOf = (html: string) =>
  html.slice(
    html.indexOf('id="start"'),
    html.indexOf("</section>", html.indexOf('id="start"'))
  );
const heroOf = (doc: ReturnType<typeof kanzleiDoc>) =>
  doc.sections.find((s): s is SectionOf<"hero"> => s.type === "hero")!;
const blueprintOf = (doc: ReturnType<typeof kanzleiDoc>) =>
  blueprintFor(doc.businessCategory, doc.businessName, doc.blueprintFamily);
const dockOf = (html: string) =>
  html.slice(
    html.indexOf('class="rs-dock'),
    html.indexOf("</nav>", html.indexOf('class="rs-dock'))
  );

describe("Raster-Einstieg: Fassung aus den Daten", () => {
  test("Kanzlei (Hochformat, Papier) → Tafel unten", () => {
    const doc = kanzleiDoc();
    expect(entryVariant(doc, heroOf(doc))).toBe("plate");
    const entry = entryOf(render(doc));
    expect(entry).toContain("rs-entry--plate");
    expect(entry).toContain('class="rs-entry-plate"');
  });

  test("Werkstatt (Querformat, Bühne) → Foto vollflächig, Kopf darüber", () => {
    const doc = werkstattDoc();
    expect(entryVariant(doc, heroOf(doc))).toBe("bleed");
    const html = render(doc);
    expect(entryOf(html)).toContain("rs-entry--bleed");
    expect(html).toContain('class="rs-frame"');
    expect(html).toContain('class="rs-head rs-head--over"');
  });

  test("Schlüsseldienst ohne Foto → Typo-Einstieg ohne Bild", () => {
    const doc = schluesselDoc();
    expect(entryVariant(doc, heroOf(doc))).toBe("type");
    const entry = entryOf(render(doc));
    expect(entry).toContain("rs-entry--type");
    expect(entry).not.toContain("<img");
  });

  test("ausgeblendetes Hero-Bild → Typo-Einstieg", () => {
    const base = werkstattDoc();
    const doc = {
      ...base,
      designProfile: {
        ...base.designProfile!,
        hiddenElements: ["hero-media" as const],
      },
    };
    expect(entryVariant(doc, heroOf(doc))).toBe("type");
    expect(entryOf(render(doc))).not.toContain("<img");
    expect(render(doc)).not.toContain('class="rs-head rs-head--over"');
  });

  test("Kohle: Foto fällt nie weg — Hochformat → Tafel, Querformat → vollflächig", () => {
    const portrait = { ...kanzleiDoc(), palette: "kohle" };
    expect(entryVariant(portrait, heroOf(portrait))).toBe("plate");
    expect(entryOf(render(portrait))).toContain('class="rs-entry-plate"');
    const stage = { ...werkstattDoc(), palette: "kohle" };
    expect(entryVariant(stage, heroOf(stage))).toBe("bleed");
  });

  test("Kopf liegt nur auf der Startseite über dem Foto (nicht auf Rechtsseiten)", () => {
    expect(render(werkstattDoc())).toContain('class="rs-head rs-head--over"');
    const legal = renderToStaticMarkup(
      <SiteRenderer
        data={werkstattDoc()}
        slug=""
        basePath=""
        islandsMode="live"
        now={TEST_NOW}
        legal={{ title: "Impressum", html: "<h1>Impressum</h1><p>Text</p>" }}
      />
    );
    expect(legal).toContain('class="rs-head"');
    expect(legal).not.toContain('class="rs-head rs-head--over"');
  });
});

describe("Raster-Einstieg: Wortmarke und h1", () => {
  test("genau ein h1 mit dem Anzeigenamen (ohne Rechtsform)", () => {
    for (const doc of [kanzleiDoc(), werkstattDoc(), schluesselDoc()]) {
      const html = render(doc);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    }
    const html = render(werkstattDoc());
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1];
    expect(h1.replace(/<[^>]+>/g, "")).toBe("Kfz-Meisterbetrieb Yilmaz");
    expect(h1).not.toContain("GmbH");
  });

  test("Gewerk wandert in den Kicker, bleibt für Vorleser im h1", () => {
    const entry = entryOf(render(werkstattDoc()));
    expect(entry).toMatch(
      /<span class="rs-sr">Kfz-Meisterbetrieb <\/span>Yilmaz<\/h1>/
    );
    expect(entry).toContain(
      '<p class="rs-entry-kicker">Kfz-Meisterbetrieb in Münster-Hiltrup</p>'
    );
  });

  test("Kopf trägt die kurze Wortmarke, wenn das Gewerk gewandert ist", () => {
    expect(render(werkstattDoc())).toMatch(
      /<a class="rs-brand" href="#start">Yilmaz<\/a>/
    );
    expect(render(kanzleiDoc())).toMatch(
      /<a class="rs-brand" href="#start">Kanzlei Brandt<\/a>/
    );
  });

  test("Satz: Überschrift steht im ersten Bild, Doppel des Kickers fällt weg", () => {
    const doc = patchSection(werkstattDoc(), "hero", h => ({
      ...h,
      headline: "Marken mit Substanz aus Bocholt",
    }));
    expect(entryOf(render(doc))).toContain(
      '<p class="rs-entry-lede">Marken mit Substanz aus Bocholt</p>'
    );
    const twin = patchSection(werkstattDoc(), "hero", h => ({
      ...h,
      headline: "Kfz-Meisterbetrieb in Münster-Hiltrup",
    }));
    const entry = entryOf(render(twin));
    expect(entry).not.toContain('rs-entry-lede">Kfz-Meisterbetrieb');
    expect(entry).toContain('class="rs-entry-lede"');
  });

  test("Fit: Breite des längsten Worts als --rs-fit, Klasse nach Untergrenze", () => {
    const kanzlei = entryOf(render(kanzleiDoc()));
    expect(kanzlei).toMatch(
      /class="rs-wordmark" style="--rs-fit:\d\.\d{3}(;--rs-lines:\d)?"/
    );
    const long = { ...kanzleiDoc(), businessName: "Hairlounge Hachtkemper" };
    expect(entryOf(render(long))).toContain("rs-wordmark rs-wordmark--tight");
  });

  test("Höhenbremse: mehrzeiliger Name setzt --rs-lines, einzeiliger nicht", () => {
    const three = { ...kanzleiDoc(), businessName: "Kfz-Service Brandt" };
    expect(entryOf(render(three))).toMatch(
      /class="rs-wordmark" style="--rs-fit:\d\.\d{3};--rs-lines:3"/
    );
    const one = { ...kanzleiDoc(), businessName: "Yilmaz" };
    expect(entryOf(render(one))).not.toContain("--rs-lines");
  });

  test("Höhenbremse: Breite und Höhe begrenzen gemeinsam, Typo-Einstieg teilt das Budget", () => {
    const { mark, typeMark, typeClock } = ENTRY_HEIGHT_SHARE;
    // Name + „24/7" im Typo-Einstieg nicht höher als ein Foto-Einstiegsname.
    expect(typeMark + typeClock).toBeLessThanOrEqual(mark);
    const sizeOf = (selector: string) =>
      RASTER_CSS.match(
        new RegExp(`${selector.replace(/[.]/g, "\\.")}\\{font-size:([^}]*)\\}`)
      )?.[1] ?? "";
    // Höhe je Zeile wird durch die Zeilenzahl geteilt (Fallback 1 Zeile).
    for (const sel of [".rs-wordmark", ".rs-entry--type .rs-wordmark"]) {
      const size = sizeOf(sel);
      expect(size).toMatch(/^clamp\(.*min\(100cqi \/ var\(--rs-fit\),/);
      expect(size).toContain("/ (var(--rs-lines,1) *");
    }
    expect(sizeOf(".rs-wordmark")).toContain(`${mark * 100}svh`);
    expect(sizeOf(".rs-entry--type .rs-wordmark")).toContain(
      `${typeMark * 100}svh`
    );
    expect(sizeOf(".rs-entry-clock-figure")).toContain(`${typeClock * 100}svh`);
  });

  test("Kanzlei: Kicker Branche in Ort, Satz aus der Überschrift", () => {
    const entry = entryOf(render(kanzleiDoc()));
    expect(entry).toContain(
      '<p class="rs-entry-kicker">Steuerberatung in Münster</p>'
    );
    expect(entry).toContain(
      '<p class="rs-entry-lede">Steuern. Klar geregelt.</p>'
    );
  });

  test.each([
    ["Marken mit Substanz aus Bocholt", "Dienstleistung in Bocholt", false],
    ["Friseur in Münster", "Friseur in Münster", true],
    ["Ihr Friseur für entspannte Momente", "Friseur in Münster", false],
    ["Steuerberatung", "Steuerberatung in Münster", true],
    [
      "Kfz-Werkstatt in Dortmund-Hörde",
      "Autowerkstatt in Dortmund-Hörde",
      false,
    ],
  ])("echoesKicker(%s | %s) → %s", (headline, kicker, expected) => {
    expect(echoesKicker(headline, kicker)).toBe(expected);
  });

  test("Satz: Überschrift vor Tagline vor Unterzeile (gekürzt)", () => {
    const doc = werkstattDoc();
    const hero = { ...heroOf(doc), headline: "Friseur in Münster" };
    const kicker = "Friseur in Münster";
    expect(
      entryLede({ ...hero, headline: "Schnell. Ehrlich." }, doc, kicker)
    ).toBe("Schnell. Ehrlich.");
    const withTagline = { ...doc, tagline: "Ehrlich gemacht, fair berechnet." };
    expect(entryLede(hero, withTagline, kicker)).toBe(
      "Ehrlich gemacht, fair berechnet."
    );
    const noTagline = { ...doc, tagline: undefined };
    expect(entryLede(hero, noTagline, kicker)).toBe(
      "Inspektion, Reifen und Reparaturen für alle Marken."
    );
  });
});

describe("Raster-Einstieg: Fakten", () => {
  test("„Heute geöffnet bis …“ aus echten Zeiten, keine Platzhalter", () => {
    const hours = [{ day: "Mo–Fr", hours: "07:00 – 18:00" }];
    expect(todayFact(hours, TEST_NOW)).toBe("Heute geöffnet bis 18 Uhr");
    expect(entryOf(render(werkstattDoc()))).toContain(
      "Heute geöffnet bis 17 Uhr"
    );
    const placeholder = patchSection(werkstattDoc(), "contact", c => ({
      ...c,
      openingHours: [{ day: "Mo–Fr", hours: "09:00–17:00" }],
    }));
    expect(entryOf(render(placeholder))).not.toContain("Heute geöffnet");
  });

  test("Google-Zeile nur mit Bewertungen", () => {
    expect(entryOf(render(kanzleiDoc()))).toContain(
      "4,8 bei Google · 41 Bewertungen"
    );
    const none = { ...kanzleiDoc(), google: { rating: 5, reviewCount: 0 } };
    expect(entryOf(render(none))).not.toContain("bei Google");
    expect(entryOf(render(schluesselDoc()))).not.toContain("bei Google");
  });

  test("nie „Seit …“ — das Dokument kennt kein Gründungsjahr", () => {
    for (const doc of [kanzleiDoc(), werkstattDoc(), schluesselDoc()])
      expect(entryOf(render(doc))).not.toMatch(/Seit \d{4}/);
  });

  test("„24/7“ und „Jetzt erreichbar“ nur bei 24-h-Zeiten", () => {
    const allDay = entryOf(render(schluesselDoc()));
    expect(allDay).toContain(">24/7<");
    expect(allDay).toContain(
      '<span class="rs-sr">Rund um die Uhr erreichbar</span>'
    );
    expect(allDay).not.toContain('aria-label="Rund um die Uhr');
    expect(allDay).toContain("Jetzt erreichbar");
    const daytime = patchSection(schluesselDoc(), "contact", c => ({
      ...c,
      openingHours: [{ day: "Mo–Fr", hours: "8:00 – 18:00" }],
    }));
    const entry = entryOf(render(daytime));
    expect(entry).not.toContain("24/7");
    expect(entry).not.toContain("Jetzt erreichbar");
    for (const doc of [kanzleiDoc(), werkstattDoc()])
      expect(entryOf(render(doc))).not.toContain("24/7");
  });

  test("24 h heißt alle sieben Tage", () => {
    expect(
      isRoundTheClock([{ day: "Mo–So", hours: "24 Stunden geöffnet" }])
    ).toBe(true);
    expect(
      isRoundTheClock([{ day: "Mo–Fr", hours: "24 Stunden geöffnet" }])
    ).toBe(false);
    expect(
      isRoundTheClock([
        { day: "Mo–Sa", hours: "24 Stunden geöffnet" },
        { day: "So", hours: "10:00 – 14:00" },
      ])
    ).toBe(false);
    expect(isRoundTheClock(undefined)).toBe(false);
  });
});

describe("Raster-Einstieg: Bilder", () => {
  test("LCP-Bild eager, hohe Priorität, mit Maßen; S/W per CSS-Filter", () => {
    for (const doc of [kanzleiDoc(), werkstattDoc()]) {
      const entry = entryOf(render(doc));
      const img = entry.match(/<img[^>]*>/)![0];
      expect(img).toContain('loading="eager"');
      expect(img).toMatch(/fetchPriority="high"|fetchpriority="high"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
      expect(img).not.toContain("decoding");
    }
  });
});

describe("Raster: Handy-Leiste", () => {
  test("zwei Felder: Signal-Fläche Hauptaktion + Telefon", () => {
    const doc = kanzleiDoc();
    const plan = dockPlan(doc, blueprintOf(doc));
    expect(plan?.kind).toBe("fields");
    const dock = dockOf(render(doc));
    expect(dock).toContain("rs-dock-field rs-dock-field--signal");
    expect(dock).toContain('href="tel:02215589');
    expect(dock.match(/<a /g)).toHaveLength(2);
  });

  test("Sofort-Dienst: eine Anrufleiste mit Nummer", () => {
    const dock = dockOf(render(schluesselDoc()));
    expect(dock).toContain("rs-dock--call");
    expect(dock).toContain("Jetzt anrufen");
    expect(dock).toContain("0251 98 76 54");
    expect(dock).toContain('href="tel:02519876');
  });

  test("24-h-Zeiten ohne Sofort-Bauplan → Anrufleiste", () => {
    const doc = patchSection(kanzleiDoc(), "contact", c => ({
      ...c,
      openingHours: [{ day: "Mo–So", hours: "24 Stunden" }],
    }));
    expect(dockPlan(doc, blueprintOf(doc))?.kind).toBe("call");
  });

  test("Hauptaktion ist Anruf → zweites Feld E-Mail", () => {
    const doc = schluesselDoc();
    const plan = dockPlan(
      { ...doc, businessCategory: "Steuerberatung" },
      {
        ...blueprintFor("Steuerberatung"),
        ctaAction: "tel",
        ctaText: "Anrufen",
      }
    );
    expect(plan?.kind).toBe("call"); // 24 h gewinnt
    const daytime = patchSection(doc, "contact", c => ({
      ...c,
      openingHours: [{ day: "Mo–Fr", hours: "8:00 – 18:00" }],
    }));
    const fields = dockPlan(daytime, {
      ...blueprintFor("Steuerberatung"),
      ctaAction: "tel",
      ctaText: "Anrufen",
    });
    expect(
      fields?.kind === "fields" && fields.fields.map(f => f.label)
    ).toEqual(["Jetzt anrufen", "E-Mail"]);
  });

  test("Hauptaktion schon E-Mail → kein zweites E-Mail-Feld", () => {
    const base = patchSection(kanzleiDoc(), "contact", c => ({
      ...c,
      phone: undefined,
    }));
    const doc = patchSection(base, "hero", h => ({
      ...h,
      ctaHref: "mailto:post@kanzlei-brandt.de",
    }));
    const plan = dockPlan(doc, blueprintOf(doc));
    expect(
      plan?.kind === "fields" && plan.fields.map(f => f.label)
    ).not.toContain("E-Mail");
  });

  test("ausgeblendeter Kontakt → weder Telefon noch E-Mail in der Leiste", () => {
    const doc = { ...kanzleiDoc(), hiddenSections: ["contact" as const] };
    const plan = dockPlan(doc, blueprintOf(doc));
    const hrefs =
      plan?.kind === "fields" ? plan.fields.map(f => f.href) : [plan?.href];
    expect(plan?.kind).toBe("fields");
    expect(hrefs.some(h => /^(tel|mailto):/.test(h ?? ""))).toBe(false);
    const dock = dockOf(render(doc));
    expect(dock).not.toContain('href="tel:');
    expect(dock).not.toContain('href="mailto:');
  });

  test("Leiste auch auf Rechtsseiten", () => {
    const html = renderToStaticMarkup(
      <SiteRenderer
        data={kanzleiDoc()}
        slug=""
        basePath="/site/kanzlei"
        islandsMode="live"
        now={TEST_NOW}
        legal={{ title: "Impressum", html: "<p>Text</p>" }}
      />
    );
    expect(dockOf(html)).toContain('href="tel:');
  });
});
