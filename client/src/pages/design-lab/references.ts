import type { WebsiteDataV2 } from "@shared/siteContract/types";

export const references = {
  architecture: {
    name: "RAUMWERK",
    category: "Architektur",
    pack: "raster",
    theme: "architecture",
    headline: "Raum für das Wesentliche.",
    intro:
      "Wir verwandeln vorhandene Räume in Orte, die zu Ihrem Leben passen.",
    aboutTitle: "Das Gute ist oft schon da.",
    about:
      "Licht, Proportionen, Materialien. Wir schauen genau hin, bevor wir etwas verändern. Gemeinsam entwickeln wir aus dem Bestand ein Zuhause, das Ihren Alltag leichter macht.",
    action: "Projekt besprechen",
    hero: "raster-hero",
    detail: "raster-detail-1",
    second: "raster-hero",
    services: [
      [
        "Bestand verstehen",
        "Wir entdecken die Möglichkeiten Ihres Hauses und klären, was bleiben darf.",
      ],
      [
        "Räume neu denken",
        "Grundriss, Licht und Materialien werden zu einem zusammenhängenden Entwurf.",
      ],
      [
        "Umbau begleiten",
        "Wir führen den Entwurf bis ins Detail und begleiten seine Umsetzung.",
      ],
    ],
  },
  restaurant: {
    name: "SEMPRE",
    category: "Restaurant",
    pack: "gusto",
    theme: "restaurant",
    headline: "Noch ein bisschen bleiben.",
    intro:
      "Frische Pasta. Ein gutes Glas Wein. Und ein Abend, der keinen Anlass braucht.",
    aboutTitle: "Die Küche ist unser Lieblingsplatz.",
    about:
      "Hier wird geknetet, probiert und abgeschmeckt. Unsere Karte bleibt überschaubar, damit jedes Gericht die Aufmerksamkeit bekommt, die es verdient. Am liebsten servieren wir alles in die Mitte.",
    action: "Tisch anfragen",
    hero: "gusto-hero",
    detail: "gusto-detail-2",
    second: "gusto-detail-1",
    services: [
      [
        "Pasta",
        "Frisch gemacht, mit wechselnden Saucen und den Zutaten der Saison.",
      ],
      [
        "Zum Teilen",
        "Kleine Gerichte für den Anfang. Bestellen Sie zusammen, probieren Sie alles.",
      ],
      [
        "Ein Glas dazu",
        "Weine, die zum Essen passen. Wir helfen Ihnen bei der Auswahl.",
      ],
    ],
  },
  salon: {
    name: "FORME",
    category: "Salon",
    pack: "salon-noir",
    theme: "salon",
    headline: "Ein Schnitt. Ganz Sie.",
    intro:
      "Schnitt und Farbe, abgestimmt auf Ihr Haar, Ihren Stil und Ihren Alltag.",
    aboutTitle: "Zuerst hören wir zu.",
    about:
      "Wie tragen Sie Ihr Haar? Wie viel Zeit nehmen Sie sich morgens? Was möchten Sie verändern? Eine gute Beratung beginnt mit diesen Fragen. Daraus entwickeln wir Ihren Look.",
    action: "Termin anfragen",
    hero: "salon-noir-hero",
    detail: "salon-noir-detail-1",
    second: "salon-noir-detail-2",
    services: [
      [
        "Schnitt & Styling",
        "Präzise Formen, natürliche Bewegung und ein Finish, das Sie selbst stylen können.",
      ],
      [
        "Farbe & Dimension",
        "Feine Reflexe oder eine klare Veränderung. Wir stimmen die Farbe auf Sie ab.",
      ],
      [
        "Pflege & Beratung",
        "Was Ihr Haar braucht und was Sie sich sparen können. Verständlich erklärt.",
      ],
    ],
  },
} as const;
export type ReferenceId = keyof typeof references;
export type Reference = (typeof references)[ReferenceId];
export const photo = (name: string) => `/demo/${name}.webp`;

/** Identical demo content for both renderers: comparison isolates design, not copy. */
export function referenceDocument(id: ReferenceId): WebsiteDataV2 {
  const r = references[id];
  return {
    version: 2,
    designRevision: 1,
    stylePackId: r.pack,
    businessName: r.name,
    seo: { title: `${r.name} · Designstudie`, description: r.intro },
    addOns: { gallery: true },
    sections: [
      {
        type: "hero",
        headline: r.headline,
        subheadline: r.intro,
        imageUrl: photo(r.hero),
        ctaText: r.action,
        ctaHref: "#kontakt",
      },
      {
        type: "services",
        headline: id === "restaurant" ? "Auf den Tisch." : "Unser Angebot",
        items: r.services.map(([title, description]) => ({
          title,
          description,
        })),
      },
      {
        type: "about",
        headline: r.aboutTitle,
        body: r.about,
        imageUrl: photo(r.detail),
      },
      {
        type: "gallery",
        headline: "Einblicke",
        images: [r.hero, r.detail, r.second].map(name => ({
          url: photo(name),
          alt: `${r.category}: Beispielmotiv`,
        })),
      },
      { type: "contact", headline: r.action },
    ],
  };
}
