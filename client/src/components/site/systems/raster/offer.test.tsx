import { describe, expect, test } from "vitest";
import { RASTER } from "../../../../../../shared/designSystems/raster";
import {
  contrastRatio,
  mix,
  rgbToHex,
} from "../../../../../../shared/stylePacks/colorMath";
import { orderedSections } from "../../engine";
import { systemShows } from "../shared";
import {
  BAND_ALT,
  BAND_DESC_ALPHA,
  BAND_FILTER,
  BAND_SCRIM,
  RASTER_CSS,
} from "./css";
import {
  BAND_DESKTOP,
  BAND_PHONE,
  bandHeightRem,
  bandPlan,
  bandTitle,
  chapterNumber,
  figuresOf,
  fitBandName,
  showsFigures,
} from "./offerData";
import {
  kanzleiDoc,
  patchSection,
  rasterDoc,
  render,
  sectionHtml,
  werkstattDoc,
} from "./testkit";

type Doc = ReturnType<typeof rasterDoc>;
const services = (n: number, price = false) =>
  Array.from({ length: n }, (_, i) => ({
    title: `Leistung ${i + 1}`,
    description: `Beschreibung ${i + 1}.`,
    ...(price && i === 0 ? { price: "ab 89" } : {}),
  }));
const withServices = (doc: Doc, n: number, price = false) =>
  patchSection(doc, "services", s => ({ ...s, items: services(n, price) }));
const withGallery = (doc: Doc, n: number) => ({
  ...doc,
  sections: [
    ...doc.sections.filter(s => s.type !== "gallery"),
    {
      type: "gallery" as const,
      images: Array.from({ length: n }, (_, i) => ({
        url: `https://images.unsplash.com/photo-${i}`,
        alt: `Bild ${i}`,
      })),
    },
  ],
});
const bandsHtml = (html: string) =>
  html.slice(
    html.indexOf('class="rs-bands'),
    html.indexOf("</ol>", html.indexOf('class="rs-bands'))
  );

describe("Raster-Leistungen: Daten-Regeln", () => {
  test("über 6 Leistungen: erste 6 als Bänder, Rest als Liste", () => {
    const doc = withServices(rasterDoc(), 9);
    const s = doc.sections.find(x => x.type === "services")!;
    const plan = bandPlan(s as never, doc.sections);
    expect(plan.bands).toHaveLength(6);
    expect(plan.rest.map(r => r.title)).toEqual([
      "Leistung 7",
      "Leistung 8",
      "Leistung 9",
    ]);
    expect(plan.single).toBe(false);
  });

  test("Fotos nur, wenn jedes Band eins hat", () => {
    const four = withServices(rasterDoc(), 4);
    const s = four.sections.find(x => x.type === "services") as never;
    expect(bandPlan(s, withGallery(four, 3).sections).photos).toBeUndefined();
    expect(bandPlan(s, withGallery(four, 5).sections).photos).toHaveLength(4);
  });

  test("Bandname: kurze Wörter füllen, sehr lange trennen", () => {
    expect(fitBandName("Reifen").hyphenate).toBe(false);
    expect(fitBandName("Reifen").widthEm).toBeGreaterThan(2);
    expect(fitBandName("Gründungsberatung").hyphenate).toBe(true);
    // Längstes Wort entscheidet
    expect(fitBandName("HU / AU").widthEm).toBeLessThan(
      fitBandName("Inspektion").widthEm
    );
  });

  test("lange Bandnamen trennen an der Kompositionsfuge", () => {
    expect(bandTitle("Jahresabschluss")).toMatchObject({
      text: "Jahres\u00ADabschluss",
      manual: true,
    });
    expect(bandTitle("Jahresabschluss").partEm).toBeLessThan(
      fitBandName("Jahresabschluss").widthEm
    );
    expect(bandTitle("Lohnbuchhaltung").text).toBe("Lohn\u00ADbuchhaltung");
    expect(bandTitle("Gründungsberatung").text).toBe("Gründungs\u00ADberatung");
    expect(bandTitle("Reifen")).toMatchObject({
      text: "Reifen",
      manual: false,
    });
    // Ohne bekannte Fuge: Browser trennt
    expect(bandTitle("Achsvermessungsdingsbums").manual).toBe(false);
  });

  test("Zahlen nur aus Google, weniger als zwei → keine", () => {
    expect(figuresOf(undefined)).toEqual([]);
    expect(figuresOf({ rating: 4.6, reviewCount: 0 })).toEqual([]);
    expect(figuresOf({ rating: 4.7, reviewCount: 1212 })).toEqual([
      { value: "4,7", label: "Google-Bewertung" },
      { value: "1.212", label: "Bewertungen" },
    ]);
    expect(figuresOf({ rating: 0, reviewCount: 3 })).toHaveLength(1);
  });

  test("Zahlenzeile zählt als Kapitel nach den Leistungen, lückenlos", () => {
    const doc = rasterDoc();
    const list = orderedSections(doc).filter(systemShows);
    expect(showsFigures(list, doc.google)).toBe(true);
    const keys = [...list.map(s => s.type), "figures" as const].filter(
      k => chapterNumber(list, k, true) > 0
    );
    expect(
      keys.map(k => chapterNumber(list, k, true)).sort((a, b) => a - b)
    ).toEqual(keys.map((_, i) => i + 1));
    expect(chapterNumber(list, "figures", true)).toBe(
      chapterNumber(list, "services", true) + 1
    );
    expect(chapterNumber(list, "figures", false)).toBe(0);
  });
});

describe("Raster-Leistungen: Bänder im Markup", () => {
  test("je Leistung ein Band im Kapitel Leistungen, Name als h3 mit Fit", () => {
    const html = render(withServices(kanzleiDoc(), 4));
    const sec = sectionHtml(html, "services");
    expect(sec).toContain('id="leistungen"');
    expect(sec).toContain('<span class="rs-no" aria-hidden="true">01</span>');
    const bands = bandsHtml(html);
    expect(bands.match(/class="rs-band /g)).toHaveLength(4);
    expect(bands).toMatch(
      /<h3 class="rs-band-name[^"]*" style="--rs-fit:[\d.]+">Leistung 1<\/h3>/
    );
    expect(bands).toContain('<p class="rs-band-desc">Beschreibung 1.</p>');
    expect(bands).not.toContain("<img");
    // Flächen abwechselnd
    expect(bands.match(/rs-band--alt/g)).toHaveLength(2);
    expect(html).not.toContain("Weitere Leistungen");
  });

  test("Preis nur aus den Daten", () => {
    const html = render(withServices(kanzleiDoc(), 3, true));
    const bands = bandsHtml(html);
    expect(bands).toContain('<span class="rs-band-price">ab 89 €</span>');
    expect(bands.match(/rs-band-price/g)).toHaveLength(1);
    expect(bandsHtml(render(withServices(kanzleiDoc(), 3)))).not.toContain("€");
  });

  test("mit Galeriefotos für jedes Band: S/W-Fotos, lazy, alt leer", () => {
    const html = render(withGallery(withServices(werkstattDoc(), 4), 4));
    const bands = bandsHtml(html);
    expect(bands.match(/<img /g)).toHaveLength(4);
    expect(bands).toContain('loading="lazy"');
    expect(bands).toContain('alt=""');
    expect(bands).toContain("rs-band--photo");
    expect(bands).not.toContain("rs-band--alt");
  });

  test("9 Leistungen: 6 Bänder + Liste „Weitere Leistungen“", () => {
    const html = render(withServices(kanzleiDoc(), 9));
    expect(bandsHtml(html).match(/class="rs-band /g)).toHaveLength(6);
    const sec = sectionHtml(html, "services");
    expect(sec).toContain("Weitere Leistungen");
    expect(sec).toContain("Leistung 9");
  });

  test("1 Leistung: ein statisches Band ohne Sticky", () => {
    const html = render(withServices(kanzleiDoc(), 1));
    expect(html).toContain('class="rs-bands rs-bands--one"');
    expect(RASTER_CSS).toMatch(/\.rs-bands--one>\.rs-band\{position:relative/);
    expect(RASTER_CSS).toMatch(/\.rs-band\{position:sticky;top:0/);
  });

  test("Bänder 85svh, ab 900 px 100svh, ohne Skript", () => {
    expect(RASTER_CSS).toContain("min-height:85svh");
    expect(RASTER_CSS).toContain("min-height:100svh");
    const html = render(withServices(kanzleiDoc(), 4));
    expect(sectionHtml(html, "services")).not.toContain("<script");
  });
});

describe("Raster-Bänder: Stapeln nur, wenn jedes Band passt", () => {
  const long =
    "Wir übernehmen die laufende Finanzbuchhaltung, die Lohnabrechnung für alle Beschäftigten, die Umsatzsteuer-Voranmeldungen und stimmen jeden Monat alle Konten mit dir ab, damit am Jahresende nichts liegen bleibt.";
  const withLong = (doc: Doc) =>
    patchSection(doc, "services", s => ({
      ...s,
      items: s.items.map((it, i) =>
        i === 2 ? { ...it, description: long } : it
      ),
    }));

  test("Schätzung: kurze Erklärung passt, lange nicht (Handy 320 × 568)", () => {
    const short = { title: "Reifen", description: "Wechsel und Einlagerung." };
    const tall = { title: "Reifen", description: long };
    expect(bandHeightRem(short, BAND_PHONE)).toBeLessThan((568 / 16) * 0.85);
    expect(bandHeightRem(tall, BAND_PHONE)).toBeGreaterThan((568 / 16) * 0.85);
    // Desktop trägt dieselbe lange Erklärung
    expect(bandHeightRem(tall, BAND_DESKTOP)).toBeLessThan(600 / 16);
  });

  test("lange Erklärung → ganze Liste fließt auf dem Handy", () => {
    const html = render(withLong(kanzleiDoc()));
    expect(html).toContain('class="rs-bands rs-bands--flow"');
    expect(RASTER_CSS).toMatch(
      /@media \(max-width:55\.99rem\)\{\.pb-raster \.rs-bands--flow>\.rs-band\{position:relative\}\}/
    );
  });

  test("kurze Erklärungen → Stapeln bleibt", () => {
    const html = render(kanzleiDoc());
    expect(html).toContain('class="rs-bands"');
    expect(html).not.toMatch(/class="rs-bands[^"]*--flow/);
  });
});

describe("Raster: Zahlenzeile", () => {
  test("Google-Note und Anzahl als eigenes Kapitel direkt nach den Bändern", () => {
    const doc = kanzleiDoc();
    const html = render(doc);
    const figs = sectionHtml(html, "figures");
    expect(figs).toContain('id="zahlen"');
    expect(figs).toContain("In Zahlen");
    expect(figs).toContain("4,8");
    expect(figs).toContain("Google-Bewertung");
    expect(figs).toContain("Bewertungen");
    expect(figs).not.toContain("gegründet");
    expect(html.indexOf("rs-sec rs-figures")).toBeGreaterThan(
      html.indexOf("rs-sec rs-services")
    );
    const services = Number(
      sectionHtml(html, "services").match(/rs-no" aria-hidden="true">(\d+)/)![1]
    );
    const figures = Number(figs.match(/rs-no" aria-hidden="true">(\d+)/)![1]);
    expect(figures).toBe(services + 1);
  });

  test("ohne Google keine Zahlenzeile, Nummern rücken nach", () => {
    const { google: _g, ...doc } = kanzleiDoc();
    const html = render(doc as Doc);
    expect(html).not.toContain("rs-sec rs-figures");
    const nums = [...html.matchAll(/rs-no" aria-hidden="true">(\d+)/g)].map(m =>
      Number(m[1])
    );
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
});

describe("Raster: Ablauf", () => {
  test("Ziffernzeilen 01–n mit h3 und Satz", () => {
    const html = render(kanzleiDoc());
    const sec = sectionHtml(html, "process");
    expect(sec).toContain('id="ablauf"');
    expect(sec).toMatch(/<ol class="rs-steps">/);
    expect(sec).toContain(
      '<span class="rs-step-no" aria-hidden="true">01</span>'
    );
    expect(sec.match(/<li class="rs-step">/g)!.length).toBeGreaterThanOrEqual(
      2
    );
    expect(sec).toMatch(/<h3>[^<]+<\/h3>/);
    expect(RASTER_CSS).toMatch(/\.rs-step-no\{[^}]*color:var\(--sys-accent\)/);
  });
});

describe("Raster: Preise, Speisekarte, Team", () => {
  const priced = <T extends "pricelist" | "menu">(type: T) =>
    ({
      type,
      categories: [
        {
          name: "Damen",
          items: [
            {
              name: "Waschen, Schneiden",
              price: "45",
              description: "inkl. Föhnen",
            },
            { name: "Färben", price: "ab 60 €" },
          ],
        },
      ],
    }) as Extract<Doc["sections"][number], { type: T }>;

  test("Preisliste als Tabelle: Titel links, Preis rechts", () => {
    const doc = kanzleiDoc();
    const html = render({
      ...doc,
      sections: [...doc.sections, priced("pricelist")],
    });
    const sec = sectionHtml(html, "pricelist");
    expect(sec).toContain('id="preise"');
    expect(sec).toContain('<h3 class="rs-group-h">Damen</h3>');
    expect(sec).toContain('<span class="rs-price">45 €</span>');
    expect(sec).toContain('<span class="rs-price">ab 60 €</span>');
    expect(sec).toContain("inkl. Föhnen");
  });

  test("Speisekarte heißt nicht rs-menu (Kopf-Menü)", () => {
    const doc = kanzleiDoc();
    const html = render({
      ...doc,
      sections: [...doc.sections, priced("menu")],
    });
    expect(sectionHtml(html, "speisekarte")).toContain('id="speisekarte"');
  });

  test("Platzhalter nur in der Vorschau, nie live", () => {
    const doc = kanzleiDoc();
    const preview = render(doc, true);
    const live = render(doc);
    expect(live).not.toContain("Nur in deiner Vorschau");
    // Steuerberater-Bauplan: Platzhalter je nach Bauplan; die Vorschau
    // zeigt höchstens, was der Bauplan vorsieht.
    if (preview.includes("Nur in deiner Vorschau"))
      expect(preview).toContain('class="rs-slot"');
  });

  test("Friseur-Bauplan: Preis- und Team-Platzhalter in der Vorschau", () => {
    const doc = rasterDoc("papier", "friseur");
    const preview = render(doc, true);
    const live = render(doc);
    expect(preview).toContain("Nur in deiner Vorschau");
    expect(live).not.toContain("Nur in deiner Vorschau");
    expect(live).not.toContain('class="rs-slot"');
  });
});

describe("Raster-Bänder: Kontrast", () => {
  /** Weiße Fotostelle nach dem Band-Filter. */
  const white = () => {
    const c = Math.min(1, (1 - 0.5) * BAND_FILTER.contrast + 0.5);
    const v = Math.round(Math.min(1, c * BAND_FILTER.brightness) * 255);
    return rgbToHex({ r: v, g: v, b: v });
  };
  const stack = (...a: number[]) => 1 - a.reduce((r, x) => r * (1 - x), 1);

  test.each(RASTER.palettes.map(p => [p.id, p] as const))(
    "%s: Banderklärung (onDeep 72 %%) ≥ 4,5:1 auf Fläche, Wechselfläche und Foto",
    (_id, p) => {
      const plain = p.deep;
      const alt = mix(p.onDeep, p.deep, BAND_ALT);
      const photoBase = mix(p.deep, white(), BAND_SCRIM.base);
      const photoText = mix(
        p.deep,
        white(),
        stack(BAND_SCRIM.base, BAND_SCRIM.local)
      );
      // Erklärung = onDeep 72 % über der Bandfläche (--band-bg); auf dem
      // Foto ist die Bandfläche `deep`, dahinter liegt das abgedunkelte Foto.
      for (const [surface, bg] of [
        [plain, plain],
        [alt, alt],
        [plain, photoText],
      ]) {
        const desc = mix(p.onDeep, surface, BAND_DESC_ALPHA);
        expect(contrastRatio(desc, bg)).toBeGreaterThanOrEqual(4.5);
      }
      // Nummer/Preis oben (klein, voll onDeep) auf dem Grundschleier
      expect(contrastRatio(p.onDeep, photoBase)).toBeGreaterThanOrEqual(4.5);
    }
  );

  test("CSS nutzt diese Werte", () => {
    expect(RASTER_CSS).toContain(
      `grayscale(1) contrast(${BAND_FILTER.contrast}) brightness(${BAND_FILTER.brightness})`
    );
    expect(RASTER_CSS).toContain(
      `color-mix(in srgb,var(--sys-on-deep) ${Math.round(BAND_DESC_ALPHA * 100)}%,var(--band-bg))`
    );
  });
});
