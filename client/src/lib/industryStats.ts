/**
 * Returns industry-appropriate stats for the "about" / hero stats section.
 * Avoids showing "Projekte" or "Abgeschlossene Projekte" for restaurants, bars, cafés, hotels etc.
 */
export interface IndustryStat {
  n: string;
  label: string;
}

export function getIndustryStats(category: string = "", count?: number): IndustryStat[] {
  const lower = category.toLowerCase();

  // Bar / Tapas / Pub / Lounge / Weinbar
  if (/\bbar\b|tapas|cocktail|lounge|pub|kneipe|weinbar|brauerei|brewery|nightlife|aperitivo/.test(lower)) {
    return [
      { n: "200+", label: "Cocktails & Drinks" },
      { n: "10+", label: "Jahre Gastfreundschaft" },
      { n: "5★", label: "Bewertungen" },
    ];
  }

  // Café / Bistro / Bäckerei / Konditorei
  if (/café|cafe|bistro|kaffee|coffee|coffeeshop|bäckerei|bakery|konditorei|patisserie|brunch/.test(lower)) {
    return [
      { n: "50+", label: "Kaffeespezialitäten" },
      { n: "10+", label: "Jahre Leidenschaft" },
      { n: "5★", label: "Bewertungen" },
    ];
  }

  // Restaurant / Gastronomie / Food
  if (/restaurant|gastro|gastronomie|essen|küche|speise|pizza|sushi|burger|steakhouse|grill|wirtshaus|gasthaus|food/.test(lower)) {
    return [
      { n: "80+", label: "Gerichte auf der Karte" },
      { n: "15+", label: "Jahre Küchentradition" },
      { n: "5★", label: "Bewertungen" },
    ];
  }

  // Hotel / Pension / Unterkunft
  if (/hotel|pension|hostel|unterkunft|übernachtung|resort|ferienwohnung|gästehaus/.test(lower)) {
    return [
      { n: "50+", label: "Zimmer & Suiten" },
      { n: "15+", label: "Jahre Gastfreundschaft" },
      { n: "5★", label: "Bewertungen" },
    ];
  }

  // Friseur / Beauty / Salon
  if (/friseur|salon|beauty|hair|barber|coiffeur|nail|spa|massage|kosmetik|wellness|lash|brow/.test(lower)) {
    return [
      { n: "5000+", label: "Zufriedene Kunden" },
      { n: "15+", label: "Jahre Erfahrung" },
      { n: "5★", label: "Bewertungen" },
    ];
  }

  // Fitness / Sport / Gym
  if (/fitness|gym|sport|yoga|training|crossfit|pilates|personal.?trainer|physiotherap/.test(lower)) {
    return [
      { n: "500+", label: "Erfolgreiche Trainings" },
      { n: "10+", label: "Jahre Erfahrung" },
      { n: "98%", label: "Kundenzufriedenheit" },
    ];
  }

  // Medizin / Arzt / Zahnarzt
  if (/arzt|zahnarzt|praxis|medizin|gesundheit|klinik|physiotherapie|therapie|apotheke/.test(lower)) {
    return [
      { n: "5000+", label: "Behandelte Patienten" },
      { n: "20+", label: "Jahre Erfahrung" },
      { n: "100%", label: "Diskretion" },
    ];
  }

  // Immobilien
  if (/immobilien|makler|real estate|wohnung|haus|miete|kauf|property/.test(lower)) {
    return [
      { n: "500+", label: "Vermittelte Objekte" },
      { n: "15+", label: "Jahre am Markt" },
      { n: "98%", label: "Kundenzufriedenheit" },
    ];
  }

  // Rechtsanwalt / Beratung
  if (/rechtsanwalt|anwalt|steuerberater|beratung|consulting|kanzlei|law|legal|finanzen/.test(lower)) {
    return [
      { n: "1000+", label: "Erfolgreiche Mandate" },
      { n: "20+", label: "Jahre Expertise" },
      { n: "100%", label: "Diskretion" },
    ];
  }

  // Bauunternehmen (vor Handwerk, da spezifischer)
  if (/bauunternehmen|baufirma|hochbau|tiefbau|rohbau|bauprojekt|bauträger|generalunternehmer|schlüsselfertig|neubau/.test(lower)) {
    return [
      { n: "300+", label: "Bauprojekte" },
      { n: "20+", label: "Jahre Erfahrung" },
      { n: "100%", label: "Termingenauigkeit" },
    ];
  }

  // Handwerk / Bau / Elektriker etc.
  if (/handwerk|bau|elektriker|klempner|maler|schreiner|tischler|zimmerer|dachdecker|sanitär|heizung|renovierung/.test(lower)) {
    return [
      { n: "500+", label: "Abgeschlossene Projekte" },
      { n: "15+", label: "Jahre Erfahrung" },
      { n: "100%", label: "Qualitätsgarantie" },
    ];
  }

  // Auto / KFZ
  if (/auto|kfz|werkstatt|autowerkstatt|reifenservice|car|vehicle|garage/.test(lower)) {
    return [
      { n: "5000+", label: "Fahrzeuge gewartet" },
      { n: "15+", label: "Jahre Erfahrung" },
      { n: "100%", label: "Kundenzufriedenheit" },
    ];
  }

  // Default (Dienstleistung allgemein)
  return [
    { n: "500+", label: "Zufriedene Kunden" },
    { n: "15+", label: "Jahre Erfahrung" },
    { n: "100%", label: "Qualitätsgarantie" },
  ];
}
