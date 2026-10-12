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
 * Testhilfen für Plakat: die drei Betriebe aus Systemblatt 8 (alles
 * erfunden: 555-Nummern, `.example`) auf Basis der Beispielbetriebe
 * Barbier, Imbiss, Training.
 */
export const plakatDoc = (palette?: string, showcase = "barbier") =>
  systemShowcaseDoc(findShowcase(showcase)!, "plakat", palette);

/** Fixture-Dokument (Unterseiten, Extras) im Plakat. */
export const plakatFixture = (
  kind: "full" | "minimal" | "features" = "full",
  palette?: string
) => withDesignSystem(getFixture("werkbank", kind), "plakat", palette);

/** Dienstag, 13.10.2026, 10 Uhr in Berlin. */
export const TEST_NOW = new Date("2026-10-13T10:00:00+02:00");

export const render = (
  data = plakatDoc(),
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

type Doc = ReturnType<typeof plakatDoc>;
type Sec = Doc["sections"][number];
type Patch<T extends Sec["type"]> = (s: Extract<Sec, { type: T }>) => Extract<Sec, { type: T }>;

/** Abschnitt eines Typs ersetzen. */
export function patchSection<T extends Sec["type"]>(doc: Doc, type: T, patch: Patch<T>): Doc {
  return {
    ...doc,
    sections: doc.sections.map(s => (s.type === type ? patch(s as Extract<typeof s, { type: T }>) : s)),
  };
}

/** Kontakt-Abschnitt ersetzen. */
export const withContact = (doc: Doc, patch: Partial<Extract<Sec, { type: "contact" }>>) =>
  patchSection(doc, "contact", c => ({ ...c, ...patch }));

/** Abschnitt (Typ) ohne Weiteres entfernen. */
export const without = (doc: Doc, ...types: Sec["type"][]): Doc => ({
  ...doc,
  sections: doc.sections.filter(s => !types.includes(s.type)),
});

/** Systemblatt 8 links: Kante Barbershop, Bogen-Foto, Google-Sticker (Kante). */
export function kanteDoc(): Doc {
  let doc: Doc = {
    ...plakatDoc("kante", "barbier"),
    businessName: "Kante Barbershop",
    businessCategory: "Barbershop",
    tagline: "Herrenschnitte und Bartpflege.",
    google: { rating: 4.9, reviewCount: 312 },
  };
  doc = withContact(doc, {
    headline: "Vorbeikommen",
    phone: "0251 555 0182",
    email: "hallo@kante.example",
    street: "Hafenstraße 12",
    zip: "48153",
    city: "Münster",
    openingHours: [
      { day: "Mo–Fr", hours: "10:00 – 19:00" },
      { day: "Sa", hours: "9:00 – 15:00" },
      { day: "So", hours: "geschlossen" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Fade, Bart, fertig.",
    subheadline: "Herrenschnitte und Bartpflege an der Hafenstraße.",
    ctaText: "Termin buchen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.barbier.hero[0],
  }));
  doc = patchSection(doc, "services", s => ({
    ...s,
    headline: "Leistungen",
    items: [
      { title: "Haarschnitt", description: "Waschen, Schnitt, Styling" },
      { title: "Fade", description: "Maschine bis auf die Haut" },
      { title: "Bart", description: "Kontur, Länge, Öl" },
      { title: "Rasur", description: "Klinge, zwei heiße Tücher" },
    ],
  }));
  return patchSection(doc, "pricelist", p => ({
    ...p,
    categories: [
      {
        name: "Herren",
        items: [
          { name: "Haarschnitt", price: "28 €" },
          { name: "Skin Fade", price: "32 €" },
          { name: "Bart trimmen", price: "18 €" },
        ],
      },
    ],
  }));
}

/** Systemblatt 8 Mitte: Döner Ecke, Kreis-Foto, späte Zeiten (Senf). */
export function eckeDoc(): Doc {
  let doc: Doc = {
    ...plakatDoc("senf", "imbiss"),
    businessName: "Döner Ecke",
    businessCategory: "Imbiss",
    tagline: undefined,
    google: { rating: 4.7, reviewCount: 1208 },
  };
  doc = withContact(doc, {
    headline: "Spät noch Hunger",
    phone: "0521 555 0144",
    email: "bestellen@doener-ecke.example",
    street: "Bahnhofstraße 3",
    zip: "33602",
    city: "Bielefeld",
    openingHours: [
      { day: "Mo", hours: "11:00 – 24:00" },
      { day: "Di–Sa", hours: "11:00 – 2:00" },
      { day: "So", hours: "12:00 – 23:00" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Döner Ecke",
    subheadline: "Döner, Dürüm, Pide aus dem Steinofen. Am Bahnhof, jeden Tag bis spät.",
    ctaText: "Anrufen & abholen",
    ctaHref: undefined,
    imageUrl: INDUSTRY_IMAGES.imbiss.hero[0],
  }));
  const menu: Sec = {
    type: "menu",
    headline: "Karte",
    categories: [
      {
        name: "Im Brot",
        items: [
          { name: "Döner im Brot", price: "7,50 €", description: "Kalb, Salat, Soße nach Wahl" },
          { name: "Dürüm", price: "8,50 €" },
        ],
      },
      { name: "Aus dem Ofen", items: [{ name: "Lahmacun", price: "5,50 €" }] },
    ],
  };
  const services: Sec = {
    type: "services",
    headline: "Was es gibt",
    items: [{ title: "Döner" }, { title: "Dürüm" }, { title: "Lahmacun" }, { title: "Pide" }],
  };
  const sections = doc.sections.flatMap((s): Sec[] => (s.type === "hero" ? [s, services, menu] : [s]));
  return { ...doc, sections };
}

/** Systemblatt 8 rechts: Studio Puls, kein Foto, Gratis-Probetraining (Puls). */
export function pulsDoc(): Doc {
  let doc: Doc = {
    ...plakatDoc("puls", "training"),
    businessName: "Studio Puls",
    businessCategory: "Fitnessstudio",
    tagline: "Kleine Gruppen, feste Trainer.",
  };
  doc = withContact(doc, {
    headline: "Studio",
    phone: "0941 555 0127",
    email: "hallo@studio-puls.example",
    street: "Kolpingstraße 8",
    zip: "93047",
    city: "Regensburg",
    openingHours: [
      { day: "Mo–Fr", hours: "6:30 – 21:00" },
      { day: "Sa", hours: "9:00 – 14:00" },
    ],
  });
  doc = patchSection(doc, "hero", h => ({
    ...h,
    headline: "Kurse ab 6:30",
    subheadline: "Kleine Gruppen, feste Trainer, ein Raum in der Altstadt. Erste Stunde kostet nichts.",
    ctaText: "Probetraining",
    imageUrl: undefined,
  }));
  doc = patchSection(doc, "services", s => ({
    ...s,
    items: [{ title: "Zirkel" }, { title: "Rücken fit" }, { title: "Yoga" }, { title: "Boxen" }],
  }));
  const prices: Sec = {
    type: "pricelist",
    headline: "Preise",
    categories: [
      {
        name: "Mitgliedschaft",
        items: [
          { name: "Monat", price: "39 €" },
          { name: "10er-Karte", price: "99 €" },
          { name: "Probetraining", price: "0 €" },
        ],
      },
    ],
  };
  const sections = doc.sections.flatMap((s): Sec[] => (s.type === "services" ? [s, prices] : [s]));
  return { ...doc, sections };
}

/** Markup des Einstiegs. */
export const entryOf = (html: string) => {
  const at = html.indexOf('<section id="start"');
  return at === -1 ? "" : html.slice(at, html.indexOf("</section>", at));
};
