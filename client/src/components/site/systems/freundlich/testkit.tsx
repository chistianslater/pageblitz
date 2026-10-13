import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../registry";
import { SiteRenderer } from "../../SiteRenderer";
import { getFixture } from "../../../../../../shared/siteContract/fixtures";
import { withDesignSystem } from "../../../../../../shared/designSystems/apply";
import { INDUSTRY_IMAGES } from "../../../../../../shared/industryImages";
import {
  findShowcase,
  systemShowcaseDoc,
} from "../../../../../../shared/showcases/blueprintShowcase";

/**
 * Testhilfen für Freundlich: die drei Betriebe aus Systemblatt 10 (alles
 * erfunden: 555-Nummern, `.example`) — Kita Pusteblume (kein Foto, Wald),
 * Fellfreunde (gutes Foto, Himmel), Gelato Mio (schwaches Foto, Beere).
 */
export const freundlichDoc = (palette?: string, showcase = "musikschule") =>
  systemShowcaseDoc(findShowcase(showcase)!, "freundlich", palette);

/** Fixture-Dokument (Unterseiten, Extras) in Freundlich. */
export const freundlichFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "freundlich", palette);

/** Donnerstag, 15.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-15T10:00:00+02:00");

export const render = (
  data = freundlichDoc(),
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

export type Doc = ReturnType<typeof freundlichDoc>;
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

/** Bildwirkung des Einstiegsfotos setzen (stage = Prüfung „gut"). */
export const withComposition = (
  doc: Doc,
  composition: "stage" | "portrait"
): Doc => ({
  ...doc,
  designProfile: { ...doc.designProfile!, composition },
});

/** Ohne jedes Foto (Einstieg, Über uns, Galerie). */
export function withoutPhotos(doc: Doc): Doc {
  const rest = without(doc, "gallery");
  return {
    ...rest,
    sections: rest.sections.map(s => {
      if (s.type === "hero" || s.type === "about") {
        const { imageUrl: _drop, ...r } = s;
        return r as typeof s;
      }
      return s;
    }),
  };
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr"] as const;

/** Systemblatt 10 links: Kita Pusteblume, kein Foto (Wald). */
export function pusteblumeDoc(palette = "wald"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "musikschule"),
    businessName: "Kita Pusteblume",
    businessCategory: "Kita",
    blueprintFamily: "family",
    tagline: undefined,
    google: undefined,
    amenities: undefined,
  };
  doc = { ...doc, features: { ...doc.features, contactForm: true } };
  doc = withContact(doc, {
    phone: "0555 3102 44",
    email: "hallo@pusteblume.example",
    street: "Hemmstraße 12",
    zip: "28215",
    city: "Bremen-Findorff",
    openingHours: [
      ...WEEKDAYS.map(day => ({ day, hours: "7:30 – 16:30" })),
      { day: "Sa", hours: "geschlossen" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Klein, warm, mitten im Viertel.",
    subheadline:
      "Zwölf Kinder, vier Erzieherinnen und ein Garten mit Apfelbaum. Wir nehmen uns Zeit fürs Ankommen.",
    ctaText: "Platz anfragen",
    ctaHref: undefined,
  }));
  return withoutPhotos(withComposition(doc, "portrait"));
}

/** Systemblatt 10 Mitte: Hundesalon Fellfreunde, gutes Foto (Himmel). */
export function fellfreundeDoc(palette = "himmel"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "friseur"),
    businessName: "Fellfreunde",
    businessCategory: "Hundesalon",
    blueprintFamily: "pets",
    tagline: undefined,
    google: { rating: 4.9, reviewCount: 86 },
    amenities: { wheelchair: true },
  };
  doc = { ...doc, features: { ...doc.features, contactForm: true } };
  doc = withContact(doc, {
    phone: "0555 7781 20",
    email: "wuff@fellfreunde.example",
    street: "Georg-Schumann-Straße 140",
    zip: "04159",
    city: "Leipzig-Gohlis",
    openingHours: [
      { day: "Mo", hours: "geschlossen" },
      ...WEEKDAYS.slice(1).map(day => ({ day, hours: "9:00 – 18:00" })),
      { day: "Sa", hours: "9:00 – 14:00" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Frisch gebürstet, ganz entspannt.",
    subheadline:
      "Waschen, schneiden, Krallen kürzen. In Ruhe, ohne Käfig, mit Zeit zum Schnuppern.",
    ctaText: "Termin anfragen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.hundesalon.hero[0],
  }));
  return withComposition(doc, "stage");
}

/** Systemblatt 10 rechts: Eiscafé Gelato Mio, schwaches Foto (Beere). */
export function gelatoDoc(palette = "beere"): Doc {
  let doc: Doc = {
    ...freundlichDoc(palette, "cafe"),
    businessName: "Gelato Mio",
    businessCategory: "Eiscafé",
    blueprintFamily: "gastro",
    tagline: undefined,
    google: { rating: 4.7, reviewCount: 312 },
    amenities: { takeout: true, vegetarian: true },
  };
  doc = withContact(doc, {
    phone: "0555 9024 66",
    email: "ciao@gelato-mio.example",
    street: "Rudolf-von-Bennigsen-Ufer 22",
    zip: "30173",
    city: "Hannover",
    openingHours: [
      ...WEEKDAYS.map(day => ({ day, hours: "12:00 – 21:00" })),
      { day: "Sa", hours: "11:00 – 22:00" },
      { day: "So", hours: "11:00 – 21:00" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Hausgemachtes Eis am Wasser.",
    subheadline:
      "Jeden Morgen frisch gerührt, mit Milch vom Hof Lindemann. Zum Mitnehmen oder auf der Terrasse.",
    ctaText: "Route planen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.eisdiele.hero[0],
  }));
  return withComposition(doc, "portrait");
}
