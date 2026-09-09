/**
 * Postkarten über HeyMail (2026-09-09).
 *
 * Zwei Regeln, die genau gegenläufig sind und deshalb hier gekapselt und
 * getestet werden — HeyMail-Support, Robin, 2026-09-09:
 *
 *   qrCodeUrl  Im Template steht `https://{{qrCodeUrl}}`. Der übergebene Wert
 *              darf das Schema deshalb NICHT enthalten, sonst entsteht
 *              `https://https://…` und der Code führt ins Leere.
 *   bildUrl    Muss das Schema enthalten und über HTTPS öffentlich erreichbar
 *              sein. Der Bildserver ist bei HeyMail freigeschaltet.
 */

/** Kopfzeile der Karte; darüber bricht die Zeile im Layout um. */
export const MAX_BETRIEB_ORT = 44;

export interface Empfaenger {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
}

/**
 * Zerlegt eine Google-Anschrift wie „Osterstraße 25, 46397 Bocholt,
 * Deutschland" in die Felder, die HeyMail erwartet.
 *
 * Bewusst streng: Ohne erkennbare Postleitzahl und Hausnummer kommt `null`
 * zurück. Eine geratene Adresse wäre schlimmer als gar keine Karte — sie
 * kostet Porto und landet im Nirgendwo.
 */
export function anschriftZerlegen(anschrift: string): Empfaenger | null {
  const teile = anschrift
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);
  if (teile.length < 2) return null;

  // Letzter Teil ist das Land, falls vorhanden; davor „PLZ Ort".
  const land = /^[A-Za-zÄÖÜäöüß ]+$/.test(teile[teile.length - 1] ?? "")
    ? teile.pop()!
    : "Deutschland";
  const ortTeil = teile.pop() ?? "";
  const plzOrt = ortTeil.match(/^(\d{4,5})\s+(.+)$/);
  if (!plzOrt) return null;

  const strasseTeil = teile.join(", ");
  // Hausnummer: Ziffer am Ende, optional mit Bereich oder Buchstabe.
  const strasse = strasseTeil.match(/^(.*?)\s+(\d+\s*[-/]?\s*\d*\s*[a-zA-Z]?)$/);
  if (!strasse) return null;

  return {
    street: strasse[1].trim(),
    houseNumber: strasse[2].replace(/\s+/g, ""),
    zip: plzOrt[1],
    city: plzOrt[2].trim(),
    country: land,
  };
}

/**
 * Wortlaut-Varianten für die Karte (Betreiber-Wunsch 2026-09-09). Headline,
 * Fließtext und Abbinder liegen als Variablen im Template, damit sich
 * Formulierungen vergleichen lassen, ohne das Template anzufassen.
 *
 * Alle Varianten duzen — das Motiv ist darauf ausgelegt, ein Wechsel zu „Sie"
 * mitten in der Serie bräche den Ton. Und jede nennt den Preis: Eine Karte,
 * die zum Scannen auffordert, ohne zu sagen was es kostet, wirkt wie ein
 * Lockangebot.
 */
export interface PostkartenText {
  headline: string;
  copy: string;
  abbinder: string;
  /** Rückseite, Handschrift: Anrede ohne geratenen Personennamen. */
  begruessung: string;
  /** Rückseite, Handschrift: kurzes persönliches Anschreiben. */
  anschreiben: string;
}

export const TEXT_VARIANTEN = {
  /** Bisheriger Wortlaut: Neugier zuerst, Preis am Ende. */
  ueberraschung: {
    headline: "Hey, wir haben eine Überraschung für dich.",
    copy: "Deine Website ist schon fertig. Wir haben sie gebaut — mit euren Fotos, euren Öffnungszeiten, euren Bewertungen.",
    abbinder: "Ansehen kostet nichts. Behalten 19,90 € im Monat.",
    begruessung: "Hallo zusammen,",
    anschreiben:
      "gefunden zu werden ist heute alles — kompliziert muss es aber nicht mehr sein. Deine Seite ist schon fertig. Einmal anschauen, ein paar Klicks, und sie ist live. 19,90 € im Monat, ohne Agentur, ohne Wartezeit.\n\nScann einfach den Code — dann siehst du sie.\n\nViele Grüße\nChristian",
  },
  /** Direkt: sagt sofort, worum es geht. */
  fertig: {
    headline: "Deine Website ist fertig.",
    copy: "Kein Termin, kein Angebot, keine Wartezeit. Schau dir an, was wir für deinen Salon gebaut haben — mit euren echten Fotos und Bewertungen.",
    abbinder: "Freischalten ab 19,90 € im Monat. Ansehen kostet nichts.",
    begruessung: "Hallo zusammen,",
    anschreiben:
      "wer heute nicht gefunden wird, existiert für viele Kunden nicht. Eine eigene Seite war dafür lange zu teuer und zu aufwendig — das ist vorbei. Deine steht schon fertig da, du musst sie nur noch freischalten: 19,90 € im Monat.\n\nDer Code führt direkt hin.\n\nViele Grüße\nChristian",
  },
  /** Nachbarschaft: lokaler Bezug statt Verkaufsversprechen. */
  nachbarschaft: {
    headline: "Wir haben dir was gebaut.",
    copy: "Einfach so, weil dein Salon online kaum zu finden ist. Deine Seite steht schon — mit euren Fotos, Zeiten und Bewertungen aus dem Google-Profil.",
    abbinder: "Anschauen kostet nichts, behalten 19,90 € im Monat.",
    begruessung: "Hallo zusammen,",
    anschreiben:
      "im Netz gefunden zu werden entscheidet heute mit, wer bei euch auf dem Stuhl sitzt. Das muss weder teuer noch kompliziert sein. Deine Seite haben wir schon gebaut — anschauen, ein paar Klicks, live. 19,90 € im Monat.\n\nEinfach den Code scannen.\n\nViele Grüße\nChristian",
  },
} as const satisfies Record<string, PostkartenText>;

export type TextVariante = keyof typeof TEXT_VARIANTEN;

export interface PostkartenBetrieb {
  name: string;
  stadt: string;
  /** Öffentliche Vorschau der erzeugten Website, mit Schema. */
  vorschauUrl: string;
  /** Screenshot der Seite, öffentlich über HTTPS, mit Schema. */
  bildUrl: string;
}

export interface PostkartenVariablen extends PostkartenText {
  betrieb_ort: string;
  qrCodeUrl: string;
  bildUrl: string;
}

function ohneSchema(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function postkartenVariablen(
  betrieb: PostkartenBetrieb,
  variante: TextVariante = "ueberraschung"
): PostkartenVariablen {
  const text = TEXT_VARIANTEN[variante];
  if (!text) {
    throw new Error(
      `Unbekannte Textvariante "${variante}" — bekannt sind: ${Object.keys(TEXT_VARIANTEN).join(", ")}`
    );
  }
  if (!betrieb.vorschauUrl.trim()) {
    throw new Error(
      "Ohne Vorschau-Link hat die Postkarte kein Ziel — Karte übersprungen."
    );
  }
  if (!/^https:\/\//i.test(betrieb.bildUrl)) {
    throw new Error(
      `Bild-URL muss mit https:// beginnen (HeyMail-Vorgabe): ${betrieb.bildUrl}`
    );
  }

  // Ohne Artikel: „Für die Manfred Wagner" war bei Personennamen falsch,
  // „Für Manfred Wagner" und „Für Haar Galerie" stimmen beide.
  const voll = `Für ${betrieb.name} in ${betrieb.stadt}`;
  const betrieb_ort =
    voll.length <= MAX_BETRIEB_ORT
      ? voll
      : `${voll.slice(0, MAX_BETRIEB_ORT - 1).trimEnd()}…`;

  return {
    ...text,
    betrieb_ort,
    qrCodeUrl: ohneSchema(betrieb.vorschauUrl.trim()),
    bildUrl: betrieb.bildUrl.trim(),
  };
}
