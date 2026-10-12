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
 * Testhilfen für Nacht: die drei Betriebe aus Systemblatt 9 (alles
 * erfunden: 555-Nummern, `.example`) auf Basis der Beispielbetriebe
 * Restaurant, Friseur, Ferienwohnung.
 */
export const nachtDoc = (palette?: string, showcase = "restaurant") =>
  systemShowcaseDoc(findShowcase(showcase)!, "nacht", palette);

/** Fixture-Dokument (Unterseiten, Extras) in Nacht. */
export const nachtFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("gusto", kind), "nacht", palette);

/** Donnerstag, 15.10.2026, 19 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-15T19:00:00+02:00");

export const render = (
  data = nachtDoc(),
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

export type Doc = ReturnType<typeof nachtDoc>;
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

/** Ohne jedes Foto (Einstieg, Über uns, Galerie). */
export function withoutPhotos(doc: Doc): Doc {
  return {
    ...without(doc, "gallery"),
    sections: without(doc, "gallery").sections.map(s => {
      if (s.type === "hero" || s.type === "about") {
        const { imageUrl: _drop, ...rest } = s;
        return rest as typeof s;
      }
      return s;
    }),
  };
}

/** Systemblatt 9 links: Restaurant Weinberg, Foto, Küchenzeiten (Petrol). */
export function weinbergDoc(palette = "petrol"): Doc {
  let doc: Doc = {
    ...nachtDoc(palette, "restaurant"),
    businessName: "Restaurant Weinberg",
    businessCategory: "Restaurant",
    google: { rating: 4.8, reviewCount: 312 },
  };
  doc = withContact(doc, {
    phone: "0555 4718 20",
    email: "tisch@weinberg.example",
    street: "Weinstraße 12",
    zip: "67098",
    city: "Bad Dürkheim",
    openingHours: [
      { day: "Mo", hours: "Ruhetag" },
      { day: "Di", hours: "Ruhetag" },
      { day: "Mi", hours: "17:30 – 23:00, Küche bis 21:30" },
      { day: "Do", hours: "17:30 – 23:00, Küche bis 21:30" },
      { day: "Fr", hours: "17:30 – 24:00, Küche bis 22:00" },
      { day: "Sa", hours: "17:30 – 24:00, Küche bis 22:00" },
      { day: "So", hours: "12:00 – 15:00, Küche bis 14:30" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Restaurant Weinberg",
    subheadline:
      "Pfälzer Küche im Gewölbe des alten Weinguts. Sieben Gänge oder à la carte, dazu Rieslinge von nebenan.",
    ctaText: "Tisch reservieren",
    ctaHref: "https://tisch.weinberg.example/",
    imageUrl: INDUSTRY_IMAGES.restaurant.hero[1],
  }));
  return withComposition(doc, "stage");
}

/** Systemblatt 9 Mitte: Salon Noir, schwaches Foto, Abendtermine (Pflaume). */
export function noirDoc(palette = "pflaume"): Doc {
  let doc: Doc = {
    ...nachtDoc(palette, "friseur"),
    businessName: "Salon Noir",
    businessCategory: "Friseursalon",
    features: { ...nachtDoc(palette, "friseur").features, contactForm: true },
  };
  delete doc.google;
  doc = withContact(doc, {
    phone: "0555 2093 11",
    email: "termin@salon-noir.example",
    street: "Rotlintstraße 41",
    zip: "60316",
    city: "Frankfurt am Main",
    openingHours: [
      { day: "Mo", hours: "geschlossen" },
      { day: "Di–Fr", hours: "12:00 – 21:00" },
      { day: "Sa", hours: "9:00 – 16:00" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Salon Noir",
    subheadline:
      "Schnitt, Farbe und Balayage für Menschen, die tagsüber keine Zeit haben. Termine bis 21 Uhr, mitten im Nordend.",
    ctaText: "Termin anfragen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.friseur.hero[2],
  }));
  return withComposition(doc, "portrait");
}

/** Systemblatt 9 rechts: Pension Haus am See, ohne Foto (Nachtblau). */
export function hausDoc(palette = "nachtblau"): Doc {
  const base = nachtDoc(palette, "ferienwohnung");
  let doc: Doc = withoutPhotos({
    ...base,
    businessName: "Pension Haus am See",
    businessCategory: "Pension",
    google: { rating: 4.9, reviewCount: 86 },
    features: { ...base.features, contactForm: true },
  });
  doc = withContact(doc, {
    phone: "0555 6630 72",
    email: "zimmer@haus-am-see.example",
    street: "Seestraße 3",
    zip: "82211",
    city: "Herrsching am Ammersee",
    openingHours: [
      { day: "Anreise", hours: "15:00 – 20:00" },
      { day: "Abreise", hours: "bis 11:00" },
      { day: "Frühstück", hours: "8:00 – 10:30" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Haus am See",
    subheadline:
      "Sechs Zimmer, ein Steg, Frühstück bis halb elf. Fünf Minuten vom Dampfersteg.",
    ctaText: "Zimmer anfragen",
    ctaHref: undefined,
  }));
  return doc;
}
