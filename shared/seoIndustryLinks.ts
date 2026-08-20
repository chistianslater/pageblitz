/**
 * Branchen-Slugs und Anzeigenamen für die interne Verlinkung auf der
 * Startseite.
 *
 * Die inhaltliche Quelle bleibt SEO_INDUSTRIES in server/seo/landingPages.ts –
 * dort hängen Features, FAQs und Styles dran. Der Client kann Server-Code aber
 * nicht importieren, deshalb steht die reine Link-Liste hier.
 *
 * Damit die beiden Listen nicht auseinanderlaufen (genau daran ist schon das
 * FAQ-Schema gescheitert), prüft server/seo.links.test.ts bei jedem Testlauf,
 * dass sie deckungsgleich sind. Wer hier eine Branche ergänzt, muss sie also
 * auch in SEO_INDUSTRIES anlegen – und umgekehrt.
 */
export interface SeoIndustryLink {
  slug: string;
  name: string;
}

export const SEO_INDUSTRY_LINKS: SeoIndustryLink[] = [
  { slug: "friseur", name: "Friseur" },
  { slug: "restaurant", name: "Restaurant" },
  { slug: "handwerk", name: "Handwerker" },
  { slug: "zahnarzt", name: "Zahnarzt" },
  { slug: "kosmetik", name: "Kosmetikstudio" },
  { slug: "fitness", name: "Fitnessstudio" },
  { slug: "arzt", name: "Arztpraxis" },
  { slug: "immobilien", name: "Immobilienmakler" },
  { slug: "rechtsanwalt", name: "Rechtsanwalt" },
  { slug: "steuerberater", name: "Steuerberater" },
  { slug: "fotograf", name: "Fotograf" },
  { slug: "physiotherapie", name: "Physiotherapeut" },
  { slug: "nagelstudio", name: "Nagelstudio" },
  { slug: "baeckerei", name: "Bäckerei" },
  { slug: "reinigung", name: "Reinigungsservice" },
  { slug: "hundesalon", name: "Hundesalon" },
  { slug: "musikschule", name: "Musikschule" },
  { slug: "elektriker", name: "Elektriker" },
  { slug: "maler", name: "Malerbetrieb" },
  { slug: "klempner", name: "Klempner" },
  { slug: "gaertner", name: "Gärtner" },
  { slug: "tierarzt", name: "Tierarzt" },
  { slug: "apotheke", name: "Apotheke" },
  { slug: "yogastudio", name: "Yogastudio" },
  { slug: "fahrschule", name: "Fahrschule" },
  { slug: "kfz-werkstatt", name: "Kfz-Werkstatt" },
  { slug: "schluesseldienst", name: "Schlüsseldienst" },
  { slug: "architekt", name: "Architekt" },
  { slug: "innenarchitekt", name: "Innenarchitekt" },
  { slug: "buchhaltung", name: "Buchhaltungsbüro" },
  { slug: "logopaedie", name: "Logopädie" },
  { slug: "ergotherapie", name: "Ergotherapie" },
  { slug: "hebamme", name: "Hebamme" },
  { slug: "pilates", name: "Pilatesstudio" },
  { slug: "reisebuero", name: "Reisebüro" },
  { slug: "hausreinigung", name: "Hausreinigung" },
  { slug: "fotostudio", name: "Fotostudio" },
];
