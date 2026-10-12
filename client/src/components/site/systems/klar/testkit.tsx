import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../../packs";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../../shared/stylePacks/blueprintShowcase";

/**
 * Testhilfen für Klar: die drei Betriebe aus Systemblatt 8 (alles
 * erfunden: 555-Nummern, `.example`) auf Basis der Beispielbetriebe
 * Zahnarzt, Heilpraktikerin, Steuerberater.
 */
export const klarDoc = (palette?: string, showcase = "zahnarzt") =>
  systemShowcaseDoc(findShowcase(showcase)!, "klar", palette);

/** Fixture-Dokument (Unterseiten, Extras) in Klar. */
export const klarFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "klar", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = klarDoc(),
  preview = false,
  basePath = "",
  pathname?: string,
  slug = "",
  now = TEST_NOW
) =>
  renderToStaticMarkup(
    <SiteRenderer
      data={data}
      slug={slug}
      basePath={basePath}
      islandsMode={preview ? "preview" : "live"}
      preview={preview}
      pathname={pathname}
      now={now}
    />
  );

export type Doc = ReturnType<typeof klarDoc>;
type Sec = Doc["sections"][number];
type Patch<T extends Sec["type"]> = (
  s: Extract<Sec, { type: T }>
) => Extract<Sec, { type: T }>;

/** Abschnitt eines Typs ersetzen. */
export function patchSection<T extends Sec["type"]>(
  doc: Doc,
  type: T,
  patch: Patch<T>
): Doc {
  return {
    ...doc,
    sections: doc.sections.map(s =>
      s.type === type ? patch(s as Extract<typeof s, { type: T }>) : s
    ),
  };
}

/** Kontakt-Abschnitt ersetzen. */
export const withContact = (
  doc: Doc,
  patch: Partial<Extract<Sec, { type: "contact" }>>
) => patchSection(doc, "contact", c => ({ ...c, ...patch }));

/** Abschnitt (Typ) entfernen. */
export const without = (doc: Doc, ...types: Sec["type"][]): Doc => ({
  ...doc,
  sections: doc.sections.filter(s => !types.includes(s.type)),
});

/** Bildwirkung des Einstiegsfotos setzen (stage = großes Querformat). */
export const withComposition = (
  doc: Doc,
  composition: "stage" | "portrait"
): Doc => ({
  ...doc,
  designProfile: { ...doc.designProfile!, composition },
});

/** Vorteile-Abschnitt mit diesen Titeln (Fakten-Chips). */
export function withUsp(doc: Doc, titles: string[]): Doc {
  const usp = { type: "usp" as const, items: titles.map(title => ({ title })) };
  const rest = doc.sections.filter(s => s.type !== "usp");
  const at = rest.findIndex(s => s.type === "hero") + 1;
  return {
    ...doc,
    sections: [...rest.slice(0, at), usp, ...rest.slice(at)] as Doc["sections"],
  };
}

/** Systemblatt 8 links: Zahnarztpraxis Dr. Sommer, gutes Foto (Lind). */
export function zahnDoc(palette = "lind"): Doc {
  const base = klarDoc(palette, "zahnarzt");
  let doc: Doc = {
    ...base,
    businessName: "Zahnarztpraxis Dr. Sommer",
    businessCategory: "Zahnarztpraxis",
    google: { rating: 4.8, reviewCount: 212 },
    amenities: { wheelchair: true },
    // Gebuchtes Kontaktformular: „Termin vereinbaren" führt zu #kontakt.
    features: { ...base.features, contactForm: true },
  };
  doc = withContact(doc, {
    phone: "04131 555 0142",
    email: "praxis@dr-sommer.example",
    street: "Lindenweg 12",
    zip: "21335",
    city: "Lüneburg",
    openingHours: [
      { day: "Mo", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Di", hours: "8:00 – 12:00, 14:00 – 18:00" },
      { day: "Mi", hours: "8:00 – 13:00" },
      { day: "Do", hours: "8:00 – 12:00, 14:00 – 19:00" },
      { day: "Fr", hours: "8:00 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Gut aufgehoben. Von Anfang an.",
    subheadline:
      "Behutsame Zahnmedizin für die ganze Familie. Wir erklären jeden Schritt, bevor wir anfangen.",
    ctaText: "Termin vereinbaren",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.zahnarzt.hero[0],
  }));
  return withComposition(withUsp(doc, ["Alle Kassen", "Privat"]), "stage");
}

/** Systemblatt 8 Mitte: Physiotherapie Lindner, schwaches Foto (Sand). */
export function physioDoc(palette = "sand"): Doc {
  let doc: Doc = {
    ...klarDoc(palette, "naturheil"),
    businessName: "Physiotherapie Lindner",
    businessCategory: "Physiotherapie",
  };
  delete doc.google;
  delete doc.amenities;
  doc = withContact(doc, {
    phone: "05141 555 0187",
    email: "team@physio-lindner.example",
    street: "Mühlenstraße 4",
    zip: "29221",
    city: "Celle",
    openingHours: [
      { day: "Mo–Do", hours: "7:30 – 20:00" },
      { day: "Fr", hours: "7:30 – 14:00" },
      { day: "Sa–So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Termine auch abends.",
    subheadline:
      "Krankengymnastik, Manuelle Therapie und Lymphdrainage. Mit Rezept oder als Selbstzahler.",
    ctaText: "Termin anfragen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.physio.hero[0],
  }));
  doc = patchSection(doc, "services", s => ({
    ...s,
    headline: "Behandlungen",
    items: [
      {
        title: "Krankengymnastik",
        description: "Kräftigen, dehnen, wieder sicher bewegen.",
      },
      {
        title: "Manuelle Therapie",
        description: "Für Rücken, Nacken und Gelenke.",
      },
      {
        title: "Hausbesuche",
        description: "Wenn Sie nicht zu uns kommen können.",
      },
    ],
  }));
  return withComposition(withUsp(doc, ["Alle Kassen", "Privat"]), "portrait");
}

/** Systemblatt 8 rechts: Steuerkanzlei Brandt, ohne Foto (Wasser). */
export function kanzleiDoc(palette = "wasser"): Doc {
  let doc: Doc = {
    ...klarDoc(palette, "steuerberater"),
    businessName: "Steuerkanzlei Brandt",
    businessCategory: "Steuerberater",
  };
  delete doc.google;
  delete doc.amenities;
  doc = withContact(doc, {
    phone: "05121 555 0119",
    email: "kanzlei@brandt-steuer.example",
    street: "Almsstraße 21",
    zip: "31134",
    city: "Hildesheim",
    openingHours: [
      { day: "Mo", hours: "8:30 – 17:00" },
      { day: "Di", hours: "8:30 – 17:00" },
      { day: "Mi", hours: "8:30 – 13:00" },
      { day: "Do", hours: "8:30 – 18:00" },
      { day: "Fr", hours: "8:30 – 13:00" },
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => {
    const { imageUrl: _drop, ...rest } = h;
    return {
      ...rest,
      headline: "Ihre Steuern. In ruhigen Händen.",
      subheadline:
        "Für Angestellte, Rentner und kleine Betriebe. Das Erstgespräch kostet nichts.",
      ctaText: "Erstgespräch vereinbaren",
      ctaHref: undefined,
    };
  });
  return without(doc, "usp");
}
