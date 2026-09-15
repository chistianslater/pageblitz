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
  /**
   * Rückseite: Nur die Anschreiben-Vorlage; die Begrüßung entsteht je
   * Betrieb aus dem Namen (siehe postkartenVariablen).
   */
  anschreiben: string;
}

export const TEXT_VARIANTEN = {
  /**
   * Umkehrung: Der zweite Satz dreht die Erwartung. Die alte Fassung
   * („Überraschung für dich") war ein Baukasten-Satz — er hätte unter jedem
   * Mailing stehen können.
   */
  ungefragt: {
    headline: "Deine Website ist fertig.",
    copy: "Du wusstest nur nichts davon. Deine Fotos, Zeiten und Bewertungen sind drin.",
    abbinder: "Anschauen kostet nichts. Behalten 19,90 € im Monat.",
    anschreiben:
      "euer Google-Profil ist gepflegt. Nur eine eigene Seite fehlt.\n\nIch baue Websites in meiner eigenen Agentur. Normal dauert das Wochen. Deine steht schon.\n\nScannen, anschauen. Behalten kostet 19,90 € im Monat.\n\nViele Grüße\nChristian",
  },
  /** Der Verlust: Was passiert, wenn nichts passiert. */
  gefunden: {
    headline: "Ein Google-Profil. Keine Website.",
    copy: "Die Seite, die dort fehlt, steht schon — mit euren Fotos und Bewertungen.",
    abbinder: "Freischalten ab 19,90 € im Monat. Anschauen kostet nichts.",
    anschreiben:
      "wer dich sucht, landet auf deinem Google-Profil und dann im Nichts.\n\nIch führe selbst eine Agentur und kenne den Grund: zu teuer, zu langsam. Deine Seite steht trotzdem schon.\n\nScannen, anschauen. Behalten kostet 19,90 € im Monat.\n\nViele Grüße\nChristian",
  },
  /** Der Wettbewerb vor Ort — nah an der Welt des Salons. */
  nachbarschaft: {
    headline: "Zwei Straßen weiter gibt es eine Website.",
    copy: "Deine auch — seit heute. Mit euren Fotos, Zeiten und Bewertungen.",
    abbinder: "Anschauen kostet nichts. Behalten 19,90 € im Monat.",
    anschreiben:
      "dein Google-Profil ist gut. Nur endet es dort, wo andere ihre Seite haben.\n\nIch baue solche Seiten in meiner Agentur. Sonst dauert das Wochen — deine ist fertig.\n\nScannen, anschauen. Behalten kostet 19,90 € im Monat.\n\nViele Grüße\nChristian",
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
  const voll = `Für ${betrieb.name} in ${betrieb.stadt}`;
  const betrieb_ort =
    voll.length <= MAX_BETRIEB_ORT
      ? voll
      : `${voll.slice(0, MAX_BETRIEB_ORT - 1).trimEnd()}…`;

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
