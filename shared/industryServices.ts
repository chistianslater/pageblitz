/**
 * Industry-specific service templates.
 * Used to seed the AI prompt with concrete, realistic service examples
 * so the generated website content matches the actual business category.
 */

export interface ServiceTemplate {
  title: string;
  description: string;
  icon: string;
}

export interface IndustryProfile {
  /** Internal key matching the onboarding category labels */
  key: string;
  /** German display name */
  label: string;
  /** Typical services for this industry */
  services: ServiceTemplate[];
  /** Typical features / USPs for this industry */
  features: string[];
  /** Typical CTA text */
  ctaText: string;
  /** Typical hero headline hint */
  heroHint: string;
  /** Typical about section focus */
  aboutFocus: string;
}

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    key: "restaurant",
    label: "Restaurant",
    services: [
      { title: "Mittagsmenü", description: "Täglich wechselndes 3-Gang-Menü mit frischen, saisonalen Zutaten. Perfekt für die Mittagspause.", icon: "Utensils" },
      { title: "À-la-carte-Küche", description: "Unsere Speisekarte bietet klassische und moderne Gerichte – von Vorspeise bis Dessert.", icon: "ChefHat" },
      { title: "Catering & Events", description: "Wir bringen unsere Küche zu Ihnen: Hochzeiten, Firmenevents, Geburtstage – maßgeschneidert.", icon: "Users" },
      { title: "Reservierungen", description: "Tisch reservieren leicht gemacht – online, telefonisch oder per E-Mail. Auch für Gruppen.", icon: "Calendar" },
      { title: "Takeaway & Lieferung", description: "Unsere Gerichte auch zum Mitnehmen – frisch zubereitet, sicher verpackt.", icon: "Package" },
    ],
    features: ["Frische Zutaten täglich", "Vegetarische & vegane Optionen", "Kinderfreundlich", "Terrasse / Außenbereich", "Weinauswahl"],
    ctaText: "Tisch reservieren",
    heroHint: "Sensorisch und appetitanregend – Aromen, Atmosphäre und Genuss betonen",
    aboutFocus: "Leidenschaft für Essen, Küchenphilosophie, regionale Zutaten, Geschichte des Restaurants",
  },
  {
    key: "bar / tapas",
    label: "Bar / Tapas",
    services: [
      { title: "Cocktailbar", description: "Klassiker und Eigenkreationen – unsere Bartender mixen für jeden Anlass den perfekten Drink.", icon: "Wine" },
      { title: "Tapas & Snacks", description: "Kleine Gerichte, große Aromen: Unsere Tapas-Auswahl lädt zum Teilen und Entdecken ein.", icon: "Utensils" },
      { title: "Happy Hour", description: "Täglich von 17–19 Uhr: ausgewählte Drinks zum halben Preis. Der perfekte Start in den Abend.", icon: "Clock" },
      { title: "Private Events", description: "Die Bar exklusiv für Ihre Feier buchen – Geburtstage, Junggesellenabschiede, Firmenfeiern.", icon: "Users" },
      { title: "Weinauswahl", description: "Kuratierte Weine aus aller Welt – unser Team berät Sie gerne bei der Auswahl.", icon: "Star" },
    ],
    features: ["Craft Cocktails", "Lokale Biere", "Abendliche Atmosphäre", "Live-Musik / DJ", "Außenbereich"],
    ctaText: "Tisch reservieren",
    heroHint: "Abendliche Atmosphäre, Genuss und Geselligkeit betonen",
    aboutFocus: "Konzept der Bar, Leidenschaft für Getränke, Atmosphäre und Stammgäste",
  },
  {
    key: "café / bistro",
    label: "Café / Bistro",
    services: [
      { title: "Frühstück & Brunch", description: "Starte deinen Tag mit unserem hausgemachten Frühstück – von klassisch bis kreativ.", icon: "Coffee" },
      { title: "Kaffeespezialitäten", description: "Espresso, Cappuccino, Cold Brew – Barista-Qualität aus frisch gerösteten Bohnen.", icon: "Coffee" },
      { title: "Kuchen & Gebäck", description: "Täglich frisch gebacken: Torten, Muffins, Croissants und saisonale Spezialitäten.", icon: "Cake" },
      { title: "Mittagskarte", description: "Leichte Gerichte, Sandwiches und Suppen – perfekt für die Mittagspause.", icon: "Utensils" },
      { title: "Take-away", description: "Kaffee und Snacks zum Mitnehmen – schnell, frisch, lecker.", icon: "Package" },
    ],
    features: ["Hausgemachte Backwaren", "Specialty Coffee", "Gemütliche Atmosphäre", "WLAN", "Vegane Optionen"],
    ctaText: "Besuche uns",
    heroHint: "Gemütlichkeit, Kaffeeduft, hausgemachte Qualität und Wohlfühlatmosphäre betonen",
    aboutFocus: "Geschichte des Cafés, Leidenschaft für Kaffee und Backen, Stammgäste und Community",
  },
  {
    key: "bäckerei",
    label: "Bäckerei",
    services: [
      { title: "Brot & Brötchen", description: "Täglich frisch gebacken: Sauerteigbrot, Vollkornbrot, Brötchen in vielen Variationen.", icon: "Wheat" },
      { title: "Konditorei & Torten", description: "Hochzeitstorten, Geburtstagstorten und Feingebäck – handgemacht nach Ihren Wünschen.", icon: "Cake" },
      { title: "Frühstücksservice", description: "Frühstückspakete zum Abholen oder Liefern – perfekt für Zuhause oder das Büro.", icon: "Coffee" },
      { title: "Catering", description: "Belegte Brote, Fingerfood und Gebäck für Firmen- und Privatveranstaltungen.", icon: "Users" },
      { title: "Saisonales Gebäck", description: "Stollen, Lebkuchen, Ostergebäck – traditionelle Rezepte nach Familienüberlieferung.", icon: "Star" },
    ],
    features: ["Täglich frisch", "Regionale Zutaten", "Glutenfreie Optionen", "Handwerk seit Generationen", "Bestellservice"],
    ctaText: "Jetzt bestellen",
    heroHint: "Frische, Handwerk, Duft von frischem Brot und Tradition betonen",
    aboutFocus: "Familientradition, Handwerkskunst, regionale Zutaten und tägliche Frische",
  },
  {
    key: "friseur",
    label: "Friseur",
    services: [
      { title: "Haarschnitt & Styling", description: "Vom klassischen Schnitt bis zum modernen Look – wir beraten Sie individuell und setzen Ihre Wünsche präzise um.", icon: "Scissors" },
      { title: "Coloration & Highlights", description: "Balayage, Ombré, Vollcoloration – mit professionellen Produkten für strahlende, langanhaltende Farben.", icon: "Palette" },
      { title: "Dauerwelle & Glättung", description: "Locken oder glattes Haar – unsere Behandlungen halten, was sie versprechen.", icon: "Sparkles" },
      { title: "Haarpflege-Treatments", description: "Intensive Pflegekuren für gesundes, glänzendes Haar – abgestimmt auf Ihren Haartyp.", icon: "Heart" },
      { title: "Hochzeitsstyling", description: "Braut- und Festtagsfrisuren – wir machen Sie zum Strahlen an Ihrem besonderen Tag.", icon: "Star" },
    ],
    features: ["Terminbuchung online", "Professionelle Produkte", "Beratung inklusive", "Kinder willkommen", "Barrierefreier Zugang"],
    ctaText: "Termin buchen",
    heroHint: "Transformation, Selbstbewusstsein und professionelle Beratung betonen",
    aboutFocus: "Leidenschaft für Haare, Ausbildung und Weiterbildung, Wohlfühlatmosphäre im Salon",
  },
  {
    key: "beauty / kosmetik",
    label: "Beauty / Kosmetik",
    services: [
      { title: "Gesichtsbehandlungen", description: "Tiefenreinigung, Anti-Aging, Hydration – maßgeschneiderte Behandlungen für Ihren Hauttyp.", icon: "Sparkles" },
      { title: "Maniküre & Pediküre", description: "Klassisch, Gel oder Shellac – gepflegte Nägel für jeden Anlass.", icon: "Star" },
      { title: "Waxing & Haarentfernung", description: "Sanfte und effektive Haarentfernung – für langanhaltend glatte Haut.", icon: "Leaf" },
      { title: "Wimpern & Brauen", description: "Wimpernverlängerung, Laminierung, Browlifting – für einen ausdrucksstarken Blick.", icon: "Eye" },
      { title: "Make-up & Styling", description: "Tages-Make-up, Abend-Look oder Braut-Make-up – professionell und langanhaltend.", icon: "Palette" },
    ],
    features: ["Hochwertige Produkte", "Individuelle Beratung", "Entspannende Atmosphäre", "Online-Terminbuchung", "Gutscheine erhältlich"],
    ctaText: "Termin buchen",
    heroHint: "Schönheit, Selbstbewusstsein, Verwöhnatmosphäre und professionelle Pflege betonen",
    aboutFocus: "Leidenschaft für Beauty, Ausbildung, verwendete Produkte und Wohlfühlatmosphäre",
  },
  {
    key: "bauunternehmen",
    label: "Bauunternehmen",
    services: [
      { title: "Neubau & Rohbau", description: "Von der Planung bis zum fertigen Rohbau – termingerecht, qualitätsgesichert und transparent.", icon: "Building" },
      { title: "Umbau & Sanierung", description: "Modernisierung, Kernsanierung, Erweiterungen – wir realisieren Ihre Umbauvorhaben fachgerecht.", icon: "Wrench" },
      { title: "Schlüsselfertiges Bauen", description: "Ein Ansprechpartner für alles – von der Planung bis zur Übergabe des fertigen Gebäudes.", icon: "Key" },
      { title: "Tiefbau & Außenanlagen", description: "Fundamente, Kanalisation, Pflasterarbeiten – solide Basis für jedes Bauvorhaben.", icon: "Hammer" },
      { title: "Projektmanagement", description: "Terminkoordination, Qualitätskontrolle, Kostentransparenz – wir behalten den Überblick.", icon: "CheckCircle" },
    ],
    features: ["Festpreisgarantie", "Terminzuverlässigkeit", "Eigene Fachkräfte", "Referenzprojekte", "Kostenlose Beratung"],
    ctaText: "Angebot anfordern",
    heroHint: "Stärke, Zuverlässigkeit, Referenzprojekte und Festpreisgarantie betonen",
    aboutFocus: "Gründungsgeschichte, Referenzprojekte, Mitarbeiterzahl und regionale Verwurzelung",
  },
  {
    key: "handwerk",
    label: "Handwerk",
    services: [
      { title: "Reparatur & Instandhaltung", description: "Schnelle, zuverlässige Reparaturen – wir kommen zu Ihnen und lösen das Problem dauerhaft.", icon: "Wrench" },
      { title: "Neuinstallation", description: "Fachgerechte Installation nach aktuellen Normen – mit Garantie auf Material und Arbeit.", icon: "CheckCircle" },
      { title: "Notdienst", description: "24/7 erreichbar bei Notfällen – schnelle Reaktionszeit, faire Preise auch nachts und am Wochenende.", icon: "Zap" },
      { title: "Wartung & Inspektion", description: "Regelmäßige Wartung verlängert die Lebensdauer Ihrer Anlagen und verhindert teure Ausfälle.", icon: "Shield" },
      { title: "Beratung & Planung", description: "Kostenlose Erstberatung vor Ort – wir zeigen Ihnen die beste Lösung für Ihr Budget.", icon: "Users" },
    ],
    features: ["Meisterbetrieb", "Festpreise", "24h Notdienst", "Garantie auf alle Arbeiten", "Kostenloser Kostenvoranschlag"],
    ctaText: "Jetzt anfragen",
    heroHint: "Zuverlässigkeit, Meisterqualität, schnelle Reaktionszeit und Festpreise betonen",
    aboutFocus: "Meistertitel, Erfahrungsjahre, Spezialisierung und lokale Präsenz",
  },
  {
    key: "fitness-studio",
    label: "Fitness-Studio",
    services: [
      { title: "Gerätetraining", description: "Modernste Geräte für Kraft- und Ausdauertraining – mit Einweisung und Trainingsplan.", icon: "Dumbbell" },
      { title: "Gruppentraining", description: "Yoga, Zumba, HIIT, Spinning – über 30 Kurse pro Woche für alle Fitnesslevel.", icon: "Users" },
      { title: "Personal Training", description: "1:1-Betreuung durch zertifizierte Trainer – maximale Ergebnisse in minimaler Zeit.", icon: "Award" },
      { title: "Ernährungsberatung", description: "Individueller Ernährungsplan abgestimmt auf deine Ziele – Abnehmen, Muskelaufbau oder Ausdauer.", icon: "Leaf" },
      { title: "Sauna & Wellness", description: "Regeneration nach dem Training – Sauna, Dampfbad und Ruhebereich für Körper und Geist.", icon: "Flame" },
    ],
    features: ["24/7 geöffnet", "Kostenlose Probeeinheit", "Flexible Mitgliedschaften", "Kinderbetreuung", "Gratis Parkplätze"],
    ctaText: "Probetraining buchen",
    heroHint: "Transformation, Energie, Community und konkrete Ergebnisse betonen",
    aboutFocus: "Trainingsphilosophie, Trainer-Team, Community-Atmosphäre und Erfolgsgeschichten",
  },
  {
    key: "arzt / zahnarzt",
    label: "Arzt / Zahnarzt",
    services: [
      { title: "Vorsorge & Check-up", description: "Regelmäßige Vorsorgeuntersuchungen für Ihre langfristige Gesundheit – schnelle Termine, kurze Wartezeiten.", icon: "Stethoscope" },
      { title: "Diagnostik", description: "Modernste Diagnoseverfahren für präzise Befunde – von Ultraschall bis digitales Röntgen.", icon: "Microscope" },
      { title: "Behandlung & Therapie", description: "Individuelle Behandlungspläne – abgestimmt auf Ihre Bedürfnisse, verständlich erklärt.", icon: "Heart" },
      { title: "Notfallversorgung", description: "Bei akuten Beschwerden helfen wir schnell – auch kurzfristige Termine für Notfälle.", icon: "Zap" },
      { title: "Beratung & Prävention", description: "Wir beraten Sie umfassend zu Prävention und gesunder Lebensführung.", icon: "Shield" },
    ],
    features: ["Kurze Wartezeiten", "Online-Terminbuchung", "Modernste Ausstattung", "Alle Kassen", "Barrierefreier Zugang"],
    ctaText: "Termin vereinbaren",
    heroHint: "Vertrauen, Kompetenz, kurze Wartezeiten und patientenorientierte Betreuung betonen",
    aboutFocus: "Qualifikationen, Spezialisierungen, Praxisausstattung und Patientenorientierung",
  },
  {
    key: "rechtsanwalt",
    label: "Rechtsanwalt",
    services: [
      { title: "Erstberatung", description: "Klare Einschätzung Ihrer Rechtslage in der ersten Beratung – transparent und ohne versteckte Kosten.", icon: "Scale" },
      { title: "Vertragsrecht", description: "Prüfung, Gestaltung und Verhandlung von Verträgen – wir schützen Ihre Interessen.", icon: "Briefcase" },
      { title: "Streitbeilegung", description: "Außergerichtliche Einigung oder gerichtliche Vertretung – wir kämpfen für Ihr Recht.", icon: "Gavel" },
      { title: "Arbeitsrecht", description: "Kündigung, Abmahnung, Arbeitsvertrag – wir vertreten Arbeitnehmer und Arbeitgeber.", icon: "Users" },
      { title: "Familienrecht", description: "Scheidung, Unterhalt, Sorgerecht – einfühlsame und kompetente Begleitung in schwierigen Situationen.", icon: "Heart" },
    ],
    features: ["Kostenlose Ersteinschätzung", "Feste Honorare", "Diskretion", "Schnelle Reaktionszeit", "Spezialisierte Expertise"],
    ctaText: "Beratungsgespräch anfragen",
    heroHint: "Expertise, Diskretion, Erfolgsquote und persönliche Betreuung betonen",
    aboutFocus: "Spezialisierungen, Ausbildung, Erfolge und persönlicher Beratungsansatz",
  },
  {
    key: "immobilien",
    label: "Immobilien",
    services: [
      { title: "Immobilienbewertung", description: "Kostenlose Marktwertermittlung Ihrer Immobilie – fundiert, transparent und unverbindlich.", icon: "Home" },
      { title: "Verkauf & Vermietung", description: "Professionelle Vermarktung mit Exposé, Besichtigungen und Vertragsabwicklung.", icon: "Key" },
      { title: "Kaufberatung", description: "Wir finden die passende Immobilie für Ihre Bedürfnisse und Ihr Budget.", icon: "Search" },
      { title: "Hausverwaltung", description: "Komplette Verwaltung Ihrer Mietobjekte – von der Mietersuche bis zur Nebenkostenabrechnung.", icon: "Building" },
      { title: "Finanzierungsberatung", description: "Wir vermitteln die passende Finanzierung – unabhängig und mit Zugang zu über 400 Banken.", icon: "PiggyBank" },
    ],
    features: ["Kostenlose Bewertung", "Regionale Marktkenntnis", "Diskrete Abwicklung", "Vollservice", "Erfahrenes Team"],
    ctaText: "Kostenlose Bewertung anfragen",
    heroHint: "Vertrauen, regionale Marktkenntnis und persönliche Betreuung betonen",
    aboutFocus: "Regionale Expertise, Transaktionsvolumen, Team und Spezialisierung",
  },
  {
    key: "it / software",
    label: "IT / Software",
    services: [
      { title: "Webentwicklung", description: "Moderne, performante Websites und Webanwendungen – von der Konzeption bis zum Launch.", icon: "Globe" },
      { title: "IT-Support & Wartung", description: "Schnelle Hilfe bei technischen Problemen – remote oder vor Ort, mit SLA-Garantie.", icon: "Wrench" },
      { title: "Cloud & Infrastruktur", description: "Migration, Betrieb und Optimierung Ihrer IT-Infrastruktur in der Cloud.", icon: "Wifi" },
      { title: "Cybersecurity", description: "Schutz Ihrer Daten und Systeme – Sicherheitsaudits, Penetrationstests, Schulungen.", icon: "Lock" },
      { title: "Digitalisierung & Beratung", description: "Wir analysieren Ihre Prozesse und entwickeln maßgeschneiderte digitale Lösungen.", icon: "Zap" },
    ],
    features: ["Agile Entwicklung", "24/7 Support", "Festpreisprojekte", "Erfahrenes Team", "Kostenlose Erstberatung"],
    ctaText: "Projekt besprechen",
    heroHint: "Innovation, Ergebnisse, Expertise und messbare ROI betonen",
    aboutFocus: "Technologie-Stack, Referenzprojekte, Team-Expertise und Arbeitsweise",
  },
  {
    key: "fotografie",
    label: "Fotografie",
    services: [
      { title: "Hochzeitsfotografie", description: "Unvergessliche Momente festhalten – reportageartig, emotional, zeitlos.", icon: "Camera" },
      { title: "Portrait & Business", description: "Professionelle Portraits für LinkedIn, Website und Bewerbungsunterlagen.", icon: "User" },
      { title: "Produkt- & Werbefotografie", description: "Hochwertige Produktbilder für Online-Shops, Kataloge und Werbematerialien.", icon: "Star" },
      { title: "Event-Fotografie", description: "Firmenveranstaltungen, Geburtstage, Konzerte – wir halten Ihre Events in Bildern fest.", icon: "Users" },
      { title: "Luftbildfotografie", description: "Drohnenaufnahmen für Immobilien, Events und Landschaften – atemberaubende Perspektiven.", icon: "Globe" },
    ],
    features: ["Schnelle Bildlieferung", "Professionelle Bearbeitung", "Alle Formate", "Reisebereitschaft", "Kostenlose Vorgespräch"],
    ctaText: "Anfrage senden",
    heroHint: "Emotionen, Qualität der Bilder und besondere Momente festhalten betonen",
    aboutFocus: "Fotografie-Stil, Ausrüstung, Erfahrung und Leidenschaft für das Handwerk",
  },
  {
    key: "autowerkstatt",
    label: "Autowerkstatt",
    services: [
      { title: "Inspektion & Wartung", description: "Herstellergerechte Inspektion für alle Marken – mit digitaler Checkliste und transparenter Abrechnung.", icon: "Wrench" },
      { title: "Reparatur & Diagnose", description: "Modernste Diagnosetechnik für schnelle Fehlersuche – Reparatur mit Originalteilen oder Qualitätsersatz.", icon: "Car" },
      { title: "HU & AU Vorbereitung", description: "Wir bereiten Ihr Fahrzeug optimal auf den TÜV vor – inklusive kostenlosem Vorab-Check.", icon: "CheckCircle" },
      { title: "Reifenservice", description: "Reifenwechsel, Einlagerung, Auswuchten – schnell und zu fairen Preisen.", icon: "Truck" },
      { title: "Klimaanlagenservice", description: "Befüllung, Reinigung und Desinfektion Ihrer Klimaanlage – für frische Luft im Fahrzeug.", icon: "Wind" },
    ],
    features: ["Alle Marken", "Originalteile", "Kostenloser Hol- & Bringservice", "Digitale Fahrzeugakte", "Festpreisgarantie"],
    ctaText: "Termin vereinbaren",
    heroHint: "Präzision, Leidenschaft für Fahrzeuge, Transparenz und Festpreise betonen",
    aboutFocus: "Erfahrung, Spezialisierung auf Marken, Ausrüstung und Kundenservice",
  },
  {
    key: "hotel / pension",
    label: "Hotel / Pension",
    services: [
      { title: "Übernachtung & Zimmer", description: "Komfortabel eingerichtete Zimmer für Geschäfts- und Privatreisende – ruhig, sauber, herzlich.", icon: "Bed" },
      { title: "Frühstück", description: "Reichhaltiges Frühstücksbuffet mit regionalen Produkten – der perfekte Start in den Tag.", icon: "Coffee" },
      { title: "Tagungsräume", description: "Moderne Konferenzräume für Meetings und Seminare – mit Technik und Catering-Service.", icon: "Briefcase" },
      { title: "Wellness & Entspannung", description: "Sauna, Whirlpool und Massagen – erholen Sie sich nach einem langen Tag.", icon: "Sparkles" },
      { title: "Ausflugstipps & Concierge", description: "Wir kennen die Region wie unsere Westentasche – persönliche Empfehlungen inklusive.", icon: "MapPin" },
    ],
    features: ["Kostenfreies WLAN", "Gratis Parkplatz", "Haustiere willkommen", "Frühstück inklusive", "24h Rezeption"],
    ctaText: "Jetzt buchen",
    heroHint: "Gastfreundschaft, Atmosphäre, Lage und besondere Momente betonen",
    aboutFocus: "Geschichte des Hauses, Lage, Ausstattung und persönlicher Service",
  },
];

/**
 * Returns the industry profile for a given category string.
 * Matches by key (case-insensitive) or partial match.
 */
export function getIndustryProfile(category: string): IndustryProfile | null {
  if (!category) return null;
  const lower = category.toLowerCase().trim();

  // Exact key match
  const exact = INDUSTRY_PROFILES.find((p) => p.key === lower);
  if (exact) return exact;

  // Partial match – category contains key or key contains category
  const partial = INDUSTRY_PROFILES.find(
    (p) => lower.includes(p.key) || p.key.includes(lower) || lower.includes(p.label.toLowerCase()) || p.label.toLowerCase().includes(lower)
  );
  return partial || null;
}

/**
 * Returns a prompt-friendly string listing the typical services for a category.
 * Used to seed the AI so it generates realistic, industry-specific content.
 */
export function getIndustryServicesSeed(category: string): string {
  const profile = getIndustryProfile(category);
  if (!profile) return "";

  const serviceList = profile.services
    .map((s) => `- ${s.title}: ${s.description}`)
    .join("\n");

  const featureList = profile.features.join(", ");

  return `BRANCHENSPEZIFISCHE LEISTUNGEN FÜR "${profile.label.toUpperCase()}":
Typische Leistungen (als Basis verwenden, kreativ ausformulieren):
${serviceList}

Typische Features/USPs: ${featureList}
Empfohlener CTA: "${profile.ctaText}"
Hero-Hinweis: ${profile.heroHint}
Über-uns-Fokus: ${profile.aboutFocus}

WICHTIG: Diese Leistungen sind Beispiele – passe sie an den spezifischen Firmennamen und die verfügbaren Informationen an. Verwende die Leistungsnamen als Inspiration, nicht als wörtliche Kopie.`;
}
