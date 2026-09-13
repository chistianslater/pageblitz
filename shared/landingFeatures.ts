/**
 * Die optionalen Funktionen, die die Startseite zeigt — eine Quelle für die
 * React-Landing (ClearFeatures) und den Server-Prerender (server/seo/homePage.ts).
 *
 * Vorher stand diese Liste zweimal da: einmal im Klarstart-Konzept, einmal im
 * Prerender. Genau so laufen Prerender und sichtbare Seite auseinander — und
 * abweichender Text ist aus Google-Sicht Cloaking (siehe Kopfkommentar in
 * server/seo/homePage.ts). Preise kommen weiterhin aus shared/pricing.ts.
 */
import type { AddOnKey } from "./pricing";

export interface LandingFeature {
  id: AddOnKey;
  title: string;
  text: string;
  /** Was die Besucherin davon hat — steht unter der Demo. */
  benefit: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: "gallery",
    title: "Lass deine Arbeit für dich sprechen.",
    text: "Ein neuer Haarschnitt, ein fertiges Projekt, dein schönster Tisch: Zeig, was Besucher bei dir erwartet. Mit einer Galerie, die auch auf dem Handy groß wirkt.",
    benefit: "Bilder entdecken. Details groß ansehen. Einen Eindruck bekommen.",
  },
  {
    id: "booking",
    title: "Der nächste Termin kommt direkt zu dir.",
    text: "Deine Kunden wählen einen freien Termin auf deiner Website. Auch dann, wenn du gerade mitten in der Arbeit steckst.",
    benefit: "Weniger Abstimmung. Ein einfacher Weg zum nächsten Termin.",
  },
  {
    id: "aiChat",
    title: "Eine Frage? Deine Website antwortet.",
    text: "Leistungen, Öffnungszeiten oder der erste Kontakt: Ein KI-Chat hilft Besuchern, sich bei deinem Betrieb zurechtzufinden.",
    benefit: "Orientierung geben, während du dich um dein Geschäft kümmerst.",
  },
  {
    id: "contactForm",
    title: "Aus Interesse wird eine Anfrage.",
    text: "Mach den nächsten Schritt leicht. Über das Kontaktformular können Besucher dir ihr Anliegen direkt auf deiner Website schicken.",
    benefit: "Kein E-Mail-Programm öffnen. Einfach Kontakt aufnehmen.",
  },
  {
    id: "menu",
    title: "Vorfreude beginnt mit deiner Karte.",
    text: "Gerichte, Getränke und Preise übersichtlich auf deiner Website. Lesbar auf dem Smartphone – ohne eine PDF-Datei suchen und vergrößern zu müssen.",
    benefit: "Dein Angebot wird schon vor dem Besuch erlebbar.",
  },
  {
    id: "pricelist",
    title: "Gute Leistungen. Klare Preise.",
    text: "Zeig, was du anbietest und was es kostet. Mit einer übersichtlichen Preisliste finden Besucher schneller das passende Angebot.",
    benefit: "Fragen vorwegnehmen und die Entscheidung leichter machen.",
  },
  {
    id: "team",
    title: "Menschen kommen zu Menschen.",
    text: "Stell die Menschen hinter deinem Betrieb vor. Mit Bildern, Namen und Aufgaben bekommt deine Website ein persönliches Gesicht.",
    benefit: "Schon vor dem ersten Besuch wissen, wer einen erwartet.",
  },
  {
    id: "subpages",
    title: "Mehr Raum für das, was du kannst.",
    text: "Manche Leistungen verdienen mehr als einen kurzen Absatz. Auf eigenen Unterseiten erklärst du dein Angebot ausführlicher und führst Besucher gezielt weiter.",
    benefit:
      "Ein klarer Überblick. Und die Details genau dort, wo sie hingehören.",
  },
];
