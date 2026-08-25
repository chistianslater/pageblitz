/**
 * Einzige Quelle für die FAQs der Startseite.
 *
 * Vorher standen die Fragen doppelt: einmal als React-Array in LandingPage.tsx
 * und einmal als hartkodiertes FAQPage-JSON-LD in client/index.html. Die beiden
 * Listen waren auseinandergelaufen – von sechs Fragen stimmte genau eine
 * überein. Google verlangt, dass FAQ-Markup den sichtbaren Seiteninhalt
 * abbildet; abweichendes Markup kostet die Rich Results und kann eine manuelle
 * Maßnahme auslösen.
 *
 * Client-Rendering, Server-Prerender und JSON-LD lesen jetzt alle hier.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQ_ITEMS: FaqItem[] = [
  {
    q: "Brauche ich technische Kenntnisse?",
    a: "Nein. Pageblitz ist für Menschen ohne IT-Kenntnisse gemacht. Du beantwortest ein paar Fragen über dein Unternehmen – den Rest erledigt die KI.",
  },
  {
    q: "Muss ich zum Testen eine Kreditkarte angeben?",
    a: "Nein. Du erstellst deine Website und siehst dir die fertige Vorschau an, ohne irgendetwas zu bezahlen. Erst wenn du sie dauerhaft freischalten möchtest, beginnt die kostenlose Testwoche – und auch die endet automatisch, wenn du nichts tust.",
  },
  {
    q: "Was, wenn mir das Ergebnis nicht gefällt?",
    a: "Dann zahlst du nichts. Du siehst deine fertige Website immer zuerst in der Vorschau – erst wenn sie dir gefällt, entscheidest du dich fürs Freischalten. Ohne Risiko, ohne Verpflichtung.",
  },
  {
    q: "Was passiert nach den 7 Tagen?",
    a: "Nach dem kostenlosen Testzeitraum kostet Pageblitz 19,90 €/Monat bei jährlicher Zahlung oder 24,90 €/Monat bei monatlicher Zahlung. Du wirst vorher per E-Mail erinnert. Wenn du nicht weiter machen möchtest, kannst du einfach kündigen.",
  },
  {
    q: "Kann ich meine eigene Domain verwenden?",
    a: "Ja. Du kannst deine bestehende Domain in wenigen Klicks verbinden. Alternativ bekommst du eine kostenlose Subdomain (deinname.pageblitz.de).",
  },
  {
    q: "Kann ich die Texte und Bilder später ändern?",
    a: "Ja, jederzeit. Schreib einfach im Chat was du ändern möchtest – z. B. „Ändere die Headline auf …“ oder „Füge diese Leistung hinzu“. Keine Programmierkenntnisse nötig.",
  },
  {
    q: "Wie sieht meine Website aus?",
    a: "Pageblitz erstellt eine moderne, mobiloptimierte Website passend zu deiner Branche. Du kannst die Farben, Schriften und Layouts anpassen. Scroll nach oben und sieh dir die Beispiele an.",
  },
  {
    q: "Wie läuft die Kündigung ab?",
    a: "Ganz einfach: Schreibe uns eine E-Mail oder kündige direkt in deinem Account. Keine Mindestlaufzeiten, keine Kündigungsgebühren.",
  },
];
