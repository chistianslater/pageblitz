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
import {
  POSTCARD_LETTER_PRICE,
  POSTCARD_PRICE,
} from "../../shared/pricingText";

/**
 * Kopfzeile der Karte; darüber bricht die Zeile im Layout um.
 * Vorgabe von HeyMail (Robin, 2026-09-18) nach der Druckprüfung: 44 war
 * zu viel, zwölf der 32 Karten vom 17.09. brachen um.
 */
export const MAX_BETRIEB_ORT = 38;

/** „Duisburg-Hamborn", „Borken (Hessen)" → „Duisburg", „Borken". */
function stadtKern(stadt: string): string {
  return stadt.split(/\s*[-/(]/)[0].trim() || stadt;
}

/**
 * Kopfzeile in abnehmender Ausführlichkeit: erst ohne Ortsteil, dann ohne
 * Ort — der steht ohnehin in der Anschrift. Abgeschnitten wird nur, wenn
 * selbst der Betriebsname allein zu lang ist; „in Du…" auf Papier sah am
 * 17.09. nach Fehler aus, nicht nach Absicht.
 */
export function betriebOrt(name: string, stadt: string): string {
  const kandidaten = [
    `Für ${name} in ${stadt}`,
    `Für ${name} in ${stadtKern(stadt)}`,
    `Für ${name}`,
  ];
  const passend = kandidaten.find(k => k.length <= MAX_BETRIEB_ORT);
  if (passend) return passend;
  return `${kandidaten[2].slice(0, MAX_BETRIEB_ORT - 1).trimEnd()}…`;
}

/** Ohne Schema, weil das Template `https://{{...}}` bereits mitbringt. */
const KURZ_BASIS = "pageblitz.de";

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

  // Hausnummer: Ziffer am Ende, optional mit Bereich oder Buchstabe.
  const strassenMuster = /^(.*?)\s+(\d+\s*[-/]?\s*\d*\s*[a-zA-Z]?)$/;
  // Google stellt manchmal einen Zusatz vor die Strasse — bei Haarem stand
  // „Friseurhaarem, Ludgeripl. 19". Frueher wurden alle Teile verklebt, und
  // auf der Karte stand „Friseurhaarem, Ludgeripl." als Strasse (17.09.).
  // Die Strasse ist deshalb der letzte Teil mit Hausnummer; was davor
  // steht, ist Zusatz und faellt weg — der Firmenname steht ohnehin in der
  // Anschrift.
  const strasse = [...teile]
    .reverse()
    .map(t => t.match(strassenMuster))
    .find(Boolean);
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
  /**
   * Rückseite: Nur die Anschreiben-Vorlage; die Begrüßung entsteht je
   * Betrieb aus dem Namen (siehe postkartenVariablen).
   */
  anschreiben: string;
}

/**
 * Preis auf der Karte (2026-10-13, Preismodell mit Laufzeit): Auf Druck gibt
 * es keine Fußnote — deshalb steht die Bedingung direkt am Preis
 * (`POSTCARD_PRICE`, „ab <Jahrespreis>/Monat (12 Mon. Laufzeit, inkl.
 * MwSt.)", 48 Zeichen) und im Anschreiben ausgeschrieben (`POSTCARD_LETTER_PRICE`).
 * Beide kommen aus shared/pricingText.ts. Die bereits versendeten Karten der
 * ersten Welle trugen noch „Behalten <Jahrespreis>"; die Zeilen speichern nur den
 * Variantennamen, ihre Historie bleibt unberührt.
 *
 * „Anschauen kostet nichts." passt NICHT mehr mit in den Abbinder
 * (24 + 1 + 57 Zeichen > MAX_ABBINDER 60): die Preiszeile mit Laufzeit und
 * MwSt. hat Vorrang (Preisangabe); der Gratis-Hinweis steht deshalb im
 * Anschreiben auf der Rückseite („Scannen und anschauen kostet nichts.").
 */
export const PREIS_AB = POSTCARD_PRICE;

/**
 * Obergrenzen der Textfelder, gemessen am gedruckten PDF der ersten Welle:
 * Die Schlagzeile bricht ab ~46 Zeichen auf vier Zeilen um und läuft in die
 * Copy (2026-09-09); Copy und Abbinder sind auf die längste gedruckte
 * Fassung begrenzt (77 bzw. 58 Zeichen) plus etwas Luft — darüber ist nichts
 * erprobt. Das Anschreiben lief bei 417 Zeichen aus dem Satzspiegel.
 */
export const MAX_HEADLINE = 46;
export const MAX_COPY = 80;
export const MAX_ABBINDER = 60;
export const MAX_ANSCHREIBEN = 320;

/** Anschreiben der ersten Welle — B und C behalten es, damit nur die Vorderseite variiert. */
const ANSCHREIBEN_UNGEFRAGT =
  `euer Google-Profil ist gepflegt. Nur eine eigene Seite fehlt.\n\nIch baue Websites in meiner eigenen Agentur. Normal dauert das Wochen. Deine steht schon.\n\nScannen und anschauen kostet nichts. Behalten kostet ${POSTCARD_LETTER_PRICE}.\n\nViele Grüße\nChristian`;

export const TEXT_VARIANTEN = {
  /**
   * Umkehrung: Der zweite Satz dreht die Erwartung. Die alte Fassung
   * („Überraschung für dich") war ein Baukasten-Satz — er hätte unter jedem
   * Mailing stehen können.
   */
  ungefragt: {
    headline: "Deine Website ist fertig.",
    copy: "Du wusstest nur nichts davon. Deine Fotos, Zeiten und Bewertungen sind drin.",
    abbinder: `Behalten ${PREIS_AB}`,
    anschreiben: ANSCHREIBEN_UNGEFRAGT,
  },
  /** Der Verlust: Was passiert, wenn nichts passiert. */
  gefunden: {
    headline: "Ein Google-Profil. Keine Website.",
    copy: "Die Seite, die dort fehlt, steht schon — mit euren Fotos und Bewertungen.",
    abbinder: `Live ${PREIS_AB}`,
    anschreiben:
      `wer dich sucht, landet auf deinem Google-Profil und dann im Nichts.\n\nIch führe selbst eine Agentur und kenne den Grund: zu teuer, zu langsam. Deine Seite steht trotzdem schon.\n\nScannen und anschauen kostet nichts. Behalten kostet ${POSTCARD_LETTER_PRICE}.\n\nViele Grüße\nChristian`,
  },
  /** Der Wettbewerb vor Ort — nah an der Welt des Salons. */
  nachbarschaft: {
    headline: "Zwei Straßen weiter gibt es eine Website.",
    copy: "Deine auch — seit heute. Mit euren Fotos, Zeiten und Bewertungen.",
    abbinder: `Behalten ${PREIS_AB}`,
    anschreiben:
      `dein Google-Profil ist gut. Nur endet es dort, wo andere ihre Seite haben.\n\nIch baue solche Seiten in meiner Agentur. Sonst dauert das Wochen — deine ist fertig.\n\nScannen und anschauen kostet nichts. Behalten kostet ${POSTCARD_LETTER_PRICE}.\n\nViele Grüße\nChristian`,
  },
  /**
   * Welle 2, Batch B (2026-10-13): eigene Vorlage mit dem Screenshot der
   * Seite groß auf der Vorderseite. Nur die Schlagzeile ist neu — sie
   * beschreibt das Bild; Copy, Abbinder und Rückseite bleiben wie in Welle
   * 1, damit allein das Design den Unterschied macht.
   */
  screenshot: {
    headline: "Das ist deine neue Website.",
    copy: "Du wusstest nur nichts davon. Deine Fotos, Zeiten und Bewertungen sind drin.",
    abbinder: `Behalten ${PREIS_AB}`,
    anschreiben: ANSCHREIBEN_UNGEFRAGT,
  },
  /**
   * Welle 2, Batch C: das Angebot statt der Umkehrung. Schlagzeile und
   * Rückseite wie Welle 1 — verändert ist nur, was die Copy verspricht:
   * kostenlos ansehen, freischalten nur bei Gefallen.
   */
  angebot: {
    headline: "Deine Website ist fertig.",
    copy: "Schau sie dir kostenlos an – freischalten nur, wenn sie dir gefällt.",
    abbinder: `Erst dann ${PREIS_AB}`,
    anschreiben: ANSCHREIBEN_UNGEFRAGT,
  },
  /**
   * Welle 2, Batch D: zweite Karte an Salons der ersten Welle, die nie
   * gescannt haben. Kurz, freundlich, ohne Vorwurf — die erste Karte kann
   * schlicht im Stapel untergegangen sein.
   */
  nachfass: {
    headline: "Deine Website wartet noch auf dich.",
    copy: "Wir haben dir vor ein paar Wochen geschrieben. Deine Seite steht noch.",
    abbinder: `Behalten ${PREIS_AB}`,
    anschreiben:
      `vor ein paar Wochen kam schon eine Karte von mir. Vielleicht ist sie untergegangen.\n\nDeine Seite aus deinem Google-Profil steht noch. In meiner Agentur dauert so etwas sonst Wochen.\n\nScannen und anschauen kostet nichts. Behalten kostet ${POSTCARD_LETTER_PRICE}.\n\nViele Grüße\nChristian`,
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
  /** Vier Zeichen von der Karte; ohne ihn bleibt es beim Vorschau-Link. */
  kurzcode?: string;
}

export interface PostkartenVariablen extends PostkartenText {
  begruessung: string;
  betrieb_ort: string;
  qrCodeUrl: string;
  /** Zum Abtippen unter dem QR — leer, solange kein Code vergeben ist. */
  kurzlink: string;
  bildUrl: string;
}

function ohneSchema(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

export function postkartenVariablen(
  betrieb: PostkartenBetrieb,
  variante: TextVariante = "ungefragt"
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
  const betrieb_ort = betriebOrt(betrieb.name, betrieb.stadt);

  return {
    ...text,
    // Persönlich, ohne zu raten: Der Betriebsname ist das Einzige, was wir
    // sicher wissen — eine Anrede mit Herr/Frau wäre geraten.
    begruessung: `Hallo ${betrieb.name},`,
    betrieb_ort,
    // Der QR zeigt auf den Kurzcode, nicht auf den Vorschau-Token: Der
    // Token wechselt bei jeder Neuerzeugung, der Code bleibt. `?q=1`
    // unterscheidet den Scan vom abgetippten Kurz-Link darunter.
    qrCodeUrl: betrieb.kurzcode
      ? `${KURZ_BASIS}/k/${betrieb.kurzcode}?q=1`
      : ohneSchema(betrieb.vorschauUrl.trim()),
    kurzlink: betrieb.kurzcode ? `${KURZ_BASIS}/k/${betrieb.kurzcode}` : "",
    bildUrl: betrieb.bildUrl.trim(),
  };
}

export type Modus = "vorschau" | "versand";

/**
 * HeyMail verlangt fuer die beiden Endpunkte unterschiedliche Formen:
 * `/mailings/preview` nimmt `mailItem` (Einzahl), `/mailings/send` besteht
 * auf `mailItems` (Liste). Am 09.09. an der Validierung abgelesen — die
 * Doku sagte beide Male etwas anderes. Deshalb hier an einer Stelle
 * festgehalten statt im Skript verstreut.
 */
export function anfrageKoerper(
  modus: Modus,
  templateId: string,
  eintrag: unknown,
  name?: string
): Record<string, unknown> {
  return modus === "versand"
    ? { templateId, mailItems: [eintrag], ...(name ? { name } : {}) }
    : { templateId, mailItem: eintrag };
}

/** Obergrenze fuer den Mailing-Titel; HeyMail nennt keine, also bleiben wir kurz. */
export const MAX_MAILING_NAME = 80;

/**
 * Titel des Mailings in der HeyMail-Liste (Betreiber-Wunsch 2026-09-15).
 *
 * Bis hierher hiess dort jeder Auftrag „Mailing pageblitz master" — bei 31
 * Karten steht dann 31-mal dasselbe untereinander und keiner weiss, welche
 * Zeile zu welchem Betrieb gehoert. Der Kurzcode steht mit drin, weil er die
 * Bruecke zur Auswertung ist: Er steht auf dem Papier und unter jedem Scan.
 *
 * Nur beim Versand mitgeschickt — `/send` nimmt `name` an, fuer `/preview`
 * ist das ungeprueft, und die Validierung dort weist unbekannte Felder mit
 * UNKNOWN_FIELD ab.
 */
export function mailingTitel(betrieb: string, kurzcode?: string): string {
  const voll = kurzcode ? `${betrieb} · ${kurzcode}` : betrieb;
  return voll.length <= MAX_MAILING_NAME
    ? voll
    : `${voll.slice(0, MAX_MAILING_NAME - 1).trimEnd()}…`;
}
