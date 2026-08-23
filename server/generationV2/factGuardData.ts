/**
 * Datenlisten des Halluzinations-Guards (factGuard.ts, Plan B7 Task 3) —
 * ausgelagert, damit die Guard-Logik unter der 400-Zeilen-Grenze bleibt.
 */
/**
 * ~80 deutsche Großstädte als Halluzinations-Prüfmenge: Das LLM erfindet
 * praktisch nie Kleinstädte, sondern greift zu bekannten Metropolen
 * („München", „Hamburg", …). Die Liste muss deshalb nicht vollständig sein —
 * sie muss die wahrscheinlichen Halluzinationen abdecken.
 */
export const GERMAN_CITIES: readonly string[] = [
  "Berlin",
  "Hamburg",
  "München",
  "Köln",
  "Frankfurt",
  "Stuttgart",
  "Düsseldorf",
  "Leipzig",
  "Dortmund",
  "Essen",
  "Bremen",
  "Dresden",
  "Hannover",
  "Nürnberg",
  "Duisburg",
  "Bochum",
  "Wuppertal",
  "Bielefeld",
  "Bonn",
  "Münster",
  "Mannheim",
  "Karlsruhe",
  "Augsburg",
  "Wiesbaden",
  "Mönchengladbach",
  "Gelsenkirchen",
  "Aachen",
  "Braunschweig",
  "Chemnitz",
  "Kiel",
  "Halle",
  "Magdeburg",
  "Freiburg",
  "Krefeld",
  "Mainz",
  "Lübeck",
  "Erfurt",
  "Oberhausen",
  "Rostock",
  "Kassel",
  "Hagen",
  "Potsdam",
  "Saarbrücken",
  "Hamm",
  "Ludwigshafen",
  "Mülheim",
  "Oldenburg",
  "Osnabrück",
  "Leverkusen",
  "Darmstadt",
  "Heidelberg",
  "Solingen",
  "Regensburg",
  "Herne",
  "Paderborn",
  "Neuss",
  "Ingolstadt",
  "Offenbach",
  "Fürth",
  "Ulm",
  "Heilbronn",
  "Pforzheim",
  "Würzburg",
  "Göttingen",
  "Bottrop",
  "Trier",
  "Recklinghausen",
  "Reutlingen",
  "Bremerhaven",
  "Koblenz",
  "Bergisch Gladbach",
  "Jena",
  "Remscheid",
  "Erlangen",
  "Moers",
  "Siegen",
  "Hildesheim",
  "Salzgitter",
  "Cottbus",
  "Gera",
  "Wolfsburg",
];

/**
 * Branchen-Marker-Gruppen: eine Gruppe gilt als „im Text präsent", wenn
 * mindestens zwei verschiedene Marker vorkommen (ein einzelner Treffer wie
 * „Brille" in einer Metapher darf nie einen Retry auslösen). Widerspruch =
 * Gruppe präsent im Text, aber KEIN Marker der Gruppe in der erlaubten
 * Evidenz (Kategorie + Firmenname + Kontext-Text).
 */
export const INDUSTRY_MARKER_GROUPS: ReadonlyArray<{
  label: string;
  markers: readonly string[];
}> = [
  {
    label: "Optik/Hörakustik",
    markers: [
      "optik",
      "akustik",
      "hörgerät",
      "hörakustik",
      "brille",
      "sehtest",
      "kontaktlinse",
      "sehstärke",
    ],
  },
  {
    label: "Gastronomie",
    markers: [
      "speisekarte",
      "reservierung",
      "mittagstisch",
      "restaurant",
      "gericht",
      "gaumen",
    ],
  },
  {
    label: "Friseur/Kosmetik",
    markers: [
      "friseur",
      "haarschnitt",
      "coloration",
      "strähnen",
      "balayage",
      "maniküre",
      "kosmetikstudio",
    ],
  },
  {
    label: "Zahnmedizin",
    markers: [
      "zahnarzt",
      "zahnreinigung",
      "prophylaxe",
      "implantat",
      "karies",
      "zahnersatz",
    ],
  },
  {
    label: "Kfz-Werkstatt",
    markers: [
      "kfz",
      "autowerkstatt",
      "inspektion",
      "reifenwechsel",
      "hauptuntersuchung",
      "ölwechsel",
    ],
  },
  {
    label: "Rechtsberatung",
    markers: [
      "rechtsanwalt",
      "kanzlei",
      "mandant",
      "rechtsgebiet",
      "prozessvertretung",
    ],
  },
  {
    label: "Physiotherapie",
    markers: [
      "physiotherapie",
      "krankengymnastik",
      "manuelle therapie",
      "lymphdrainage",
    ],
  },
  {
    label: "Bäckerei/Konditorei",
    markers: ["bäckerei", "brötchen", "backwaren", "konditorei", "sauerteig"],
  },
  {
    label: "Werbung/Marketing",
    markers: [
      "werbeagentur",
      "branding",
      "kampagne",
      "webdesign",
      "mediengestaltung",
      "markenstrategie",
    ],
  },
  {
    label: "Steuerberatung",
    markers: [
      "steuerberater",
      "steuererklärung",
      "buchhaltung",
      "jahresabschluss",
      "lohnabrechnung",
    ],
  },
  {
    label: "Immobilien",
    markers: [
      "immobilien",
      "makler",
      "besichtigung",
      "exposé",
      "vermietung",
      "wertermittlung",
    ],
  },
  {
    label: "Fitness",
    markers: [
      "fitnessstudio",
      "muskelaufbau",
      "mitgliedschaft",
      "probetraining",
      "kursplan",
    ],
  },
];
